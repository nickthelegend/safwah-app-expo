import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount, usePublicClient } from 'wagmi';
import { useAppKit } from '@reown/appkit-react-native';
import { formatUnits, parseUnits } from 'viem';

import { safwah } from '../theme/safwah';
import { fmt } from '../lib/format';
import { TOKEN_META, useHoldings, type Token } from '../provider/HoldingsProvider';
import { useToast } from '../components/safwah/Toast';
import { useTx } from '../provider/TxProvider';
import { CONTRACTS } from '../lib/contracts';
import { useConsumerOnchain } from '../hooks/useConsumerOnchain';

export default function SwapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { balances, unitAED, swap } = useHoldings();
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const publicClient = usePublicClient();
  const { run } = useTx();
  const oc = useConsumerOnchain();
  const [from, setFrom] = useState<Token>('USDT');
  const [to, setTo] = useState<Token>('AED');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<{ got: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [quoted, setQuoted] = useState(0); // live AED out for the current amount

  // The on-chain leg supports the USDT→AED pool. When connected we quote live and
  // fall back to the local rate for any other pairing the UI allows.
  const onchainPair = isConnected && from === 'USDT' && to === 'AED';

  // Live USDT balance for the connected wallet; otherwise the demo holdings figure.
  const fromBalance = isConnected && from === 'USDT' ? oc.usdt : balances[from];

  const amt = parseFloat(amount) || 0;
  const localReceive = unitAED(to) > 0 ? (amt * unitAED(from)) / unitAED(to) : 0;
  const receive = onchainPair && quoted > 0 ? quoted : localReceive;
  const rate = amt > 0 && onchainPair && quoted > 0 ? quoted / amt : unitAED(from) / unitAED(to);
  const insufficient = amt > fromBalance;
  const canSwap = amt > 0 && !insufficient && !busy;

  // Pull a live AED quote from the swap pool as the amount changes (USDT→AED only).
  useEffect(() => {
    if (!onchainPair || !publicClient || amt <= 0) {
      setQuoted(0);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const amountIn = parseUnits(amount, 6);
        const out = (await publicClient.readContract({
          address: CONTRACTS.SafwahSwap.address,
          abi: CONTRACTS.SafwahSwap.abi,
          functionName: 'quote',
          args: [CONTRACTS.MockUSDT.address, amountIn],
        })) as bigint;
        if (!cancelled) setQuoted(+formatUnits(out, 18));
      } catch {
        if (!cancelled) setQuoted(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onchainPair, publicClient, amount, amt]);

  const flip = () => {
    setFrom(to);
    setTo(from);
    setAmount('');
    setQuoted(0);
  };

  const TOKENS: Token[] = ['AED', 'USDT', 'SFL'];
  const cycle = (which: 'from' | 'to') => {
    const cur = which === 'from' ? from : to;
    const other = which === 'from' ? to : from;
    let next = TOKENS[(TOKENS.indexOf(cur) + 1) % TOKENS.length];
    if (next === other) next = TOKENS[(TOKENS.indexOf(next) + 1) % TOKENS.length];
    if (which === 'from') setFrom(next);
    else setTo(next);
    setAmount('');
    setQuoted(0);
  };

  const faucet = async () => {
    try {
      await run(
        { address: CONTRACTS.MockUSDT.address, abi: CONTRACTS.MockUSDT.abi, functionName: 'faucet', args: [] },
        { label: 'Getting test USDT' },
      );
      oc.refetch();
    } catch {
      // modal already surfaced the error
    }
  };

  const doSwap = async () => {
    if (!canSwap) return;

    // Off-chain / demo pairings keep the original instant-swap behaviour.
    if (!onchainPair) {
      const got = swap(from, to, amt);
      setDone({ got });
      toast({ title: 'Swap complete', description: `Received ${fmt(got, to === 'SFL' ? 0 : 2)} ${to}`, variant: 'success' });
      return;
    }

    // Real USDT→AED swap on Polygon Amoy: quote → minOut(2% slippage) → approve → swap.
    setBusy(true);
    try {
      const amountIn = parseUnits(amount, 6);
      const out = (await publicClient!.readContract({
        address: CONTRACTS.SafwahSwap.address,
        abi: CONTRACTS.SafwahSwap.abi,
        functionName: 'quote',
        args: [CONTRACTS.MockUSDT.address, amountIn],
      })) as bigint;
      const minOut = (out * 98n) / 100n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

      await run(
        { address: CONTRACTS.MockUSDT.address, abi: CONTRACTS.MockUSDT.abi, functionName: 'approve', args: [CONTRACTS.SafwahSwap.address, amountIn] },
        { label: 'Approving USDT' },
      );
      await run(
        {
          address: CONTRACTS.SafwahSwap.address,
          abi: CONTRACTS.SafwahSwap.abi,
          functionName: 'swap',
          args: [CONTRACTS.MockUSDT.address, amountIn, minOut, deadline],
        },
        { label: 'Swapping USDT → AED' },
      );

      oc.refetch();
      const got = +formatUnits(out, 18);
      setDone({ got });
      toast({ title: 'Swap complete', description: `Received ${fmt(got, 2)} AED`, variant: 'success' });
    } catch {
      // run() surfaced the error in its modal; leave the form as-is to retry.
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <View style={styles.grab} />
        <Text style={styles.title}>Swap</Text>
        <TouchableOpacity style={styles.close} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={safwah.colors.text} />
        </TouchableOpacity>
      </View>

      {done ? (
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="checkmark" size={46} color={safwah.colors.onLime} />
          </View>
          <Text style={styles.doneText}>Swapped to {fmt(done.got, to === 'SFL' ? 0 : 2)} {to}</Text>
          <Text style={styles.doneSub}>Your balances are updated</Text>
          <TouchableOpacity style={styles.cta} onPress={() => router.back()} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* From */}
          <View style={styles.tokenCard}>
            <View style={styles.tokenRow}>
              <Text style={styles.tokenLabel}>You pay</Text>
              {isConnected && from === 'USDT' ? (
                <TouchableOpacity onPress={faucet} activeOpacity={0.7}>
                  <Text style={styles.bal}>Balance {fmt(fromBalance, 2)} · Get test USDT</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.bal}>Balance {fmt(fromBalance, from === 'SFL' ? 0 : 2)}</Text>
              )}
            </View>
            <View style={styles.amountRow}>
              <TextInput
                style={[styles.amountInput, insufficient && { color: safwah.colors.danger }]}
                placeholder="0.00"
                placeholderTextColor={safwah.colors.textMute}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <TouchableOpacity style={[styles.chip, { borderColor: TOKEN_META[from].color }]} onPress={() => cycle('from')} activeOpacity={0.8}>
                <View style={[styles.dot, { backgroundColor: TOKEN_META[from].color }]} />
                <Text style={styles.chipText}>{from}</Text>
                <Ionicons name="chevron-down" size={13} color={safwah.colors.textMute} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.flipWrap}>
            <TouchableOpacity style={styles.flip} onPress={flip} activeOpacity={0.85}>
              <Ionicons name="swap-vertical" size={20} color={safwah.colors.lime} />
            </TouchableOpacity>
          </View>

          {/* To */}
          <View style={styles.tokenCard}>
            <View style={styles.tokenRow}>
              <Text style={styles.tokenLabel}>You receive</Text>
              <Text style={styles.bal}>
                Balance {fmt(isConnected && to === 'AED' ? oc.aed : balances[to], to === 'SFL' ? 0 : 2)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.receive}>{fmt(receive, to === 'SFL' ? 0 : 2)}</Text>
              <TouchableOpacity style={[styles.chip, { borderColor: TOKEN_META[to].color }]} onPress={() => cycle('to')} activeOpacity={0.8}>
                <View style={[styles.dot, { backgroundColor: TOKEN_META[to].color }]} />
                <Text style={styles.chipText}>{to}</Text>
                <Ionicons name="chevron-down" size={13} color={safwah.colors.textMute} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rateRow}>
            <Text style={styles.rateText}>
              1 {from} ≈ {fmt(rate, rate < 1 ? 4 : 2)} {to}
            </Text>
            <Text style={styles.rateText}>Fee 0%</Text>
          </View>

          {!isConnected ? (
            <TouchableOpacity style={styles.cta} onPress={() => open()} activeOpacity={0.9}>
              <Text style={styles.ctaText}>Connect wallet</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.cta, !canSwap && styles.ctaDisabled]}
              onPress={doSwap}
              activeOpacity={0.9}
              disabled={!canSwap}
            >
              <Text style={styles.ctaText}>{busy ? 'Swapping…' : insufficient ? `Not enough ${from}` : 'Swap'}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bgElevated ?? '#ffffff' },
  header: { alignItems: 'center', marginBottom: 18, paddingHorizontal: 20 },
  grab: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(19,19,22,0.18)', marginBottom: 14 },
  title: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text },
  close: { position: 'absolute', right: 20, top: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: safwah.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: safwah.colors.border },
  tokenCard: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 18 },
  tokenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tokenLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  bal: { fontFamily: safwah.font.mono, fontSize: 12, color: safwah.colors.textMute },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountInput: { flex: 1, fontFamily: safwah.font.monoBold, fontSize: 30, color: safwah.colors.text, padding: 0 },
  receive: { flex: 1, fontFamily: safwah.font.monoBold, fontSize: 30, color: safwah.colors.text },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 13, borderRadius: safwah.radius.pill },
  dot: { width: 9, height: 9, borderRadius: 5 },
  chipText: { fontFamily: safwah.font.bold, fontSize: 14, color: safwah.colors.text },
  flipWrap: { alignItems: 'center', marginVertical: -10, zIndex: 2 },
  flip: { width: 40, height: 40, borderRadius: 13, backgroundColor: safwah.colors.bgElevated ?? '#ffffff', borderWidth: 1, borderColor: safwah.colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 4 },
  rateText: { fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textMute },
  cta: { height: 54, paddingHorizontal: 44, minWidth: 180, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  ctaDisabled: { backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.border },
  ctaText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  doneCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  doneText: { fontFamily: safwah.font.bold, fontSize: 22, color: safwah.colors.text, textAlign: 'center' },
  doneSub: { fontFamily: safwah.font.regular, fontSize: 13.5, color: safwah.colors.textDim, marginTop: 8 },
});
