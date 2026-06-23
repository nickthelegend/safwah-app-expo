import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../theme/safwah';
import { fmt } from '../lib/format';
import { TOKEN_META, useHoldings, type Token } from '../provider/HoldingsProvider';
import { useToast } from '../components/safwah/Toast';

export default function SwapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { balances, unitAED, swap } = useHoldings();
  const { toast } = useToast();
  const [from, setFrom] = useState<Token>('USDT');
  const [to, setTo] = useState<Token>('AED');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<{ got: number } | null>(null);

  const amt = parseFloat(amount) || 0;
  const receive = unitAED(to) > 0 ? (amt * unitAED(from)) / unitAED(to) : 0;
  const rate = unitAED(from) / unitAED(to);
  const insufficient = amt > balances[from];
  const canSwap = amt > 0 && !insufficient;

  const flip = () => {
    setFrom(to);
    setTo(from);
    setAmount('');
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
  };

  const doSwap = () => {
    if (!canSwap) return;
    const got = swap(from, to, amt);
    setDone({ got });
    toast({ title: 'Swap complete', description: `Received ${fmt(got, to === 'SFL' ? 0 : 2)} ${to}`, variant: 'success' });
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
              <Text style={styles.bal}>Balance {fmt(balances[from], from === 'SFL' ? 0 : 2)}</Text>
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
              <Text style={styles.bal}>Balance {fmt(balances[to], to === 'SFL' ? 0 : 2)}</Text>
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

          <TouchableOpacity
            style={[styles.cta, !canSwap && styles.ctaDisabled]}
            onPress={doSwap}
            activeOpacity={0.9}
            disabled={!canSwap}
          >
            <Text style={styles.ctaText}>{insufficient ? `Not enough ${from}` : 'Swap'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bgElevated ?? '#08080a' },
  header: { alignItems: 'center', marginBottom: 18, paddingHorizontal: 20 },
  grab: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 14 },
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
  flip: { width: 40, height: 40, borderRadius: 13, backgroundColor: safwah.colors.bgElevated ?? '#08080a', borderWidth: 1, borderColor: safwah.colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
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
