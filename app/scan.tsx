import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit-react-native';
import { parseUnits } from 'viem';

import { safwah } from '../theme/safwah';
import { API_BASE } from '../lib/api';
import { fmt } from '../lib/format';
import { useTx } from '../provider/TxProvider';
import { CONTRACTS } from '../lib/contracts';
import { useConsumerOnchain } from '../hooks/useConsumerOnchain';

const isAddress = (v: string): v is `0x${string}` => /^0x[a-fA-F0-9]{40}$/.test(v.trim());

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const { run } = useTx();
  const oc = useConsumerOnchain();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'AED' | 'USDT'>('USDT');
  const [status, setStatus] = useState<'idle' | 'paying' | 'done'>('idle');

  const cameraReady = Platform.OS !== 'web' && permission?.granted;

  // QR encodes either a safwah URL (?merchant=0x…&amount=…) or a bare merchant address.
  const onBarcode = ({ data }: { data: string }) => {
    try {
      const url = new URL(data);
      const m = url.searchParams.get('merchant');
      const a = url.searchParams.get('amount');
      if (m) setMerchant(m);
      if (a) setAmount(a);
    } catch {
      setMerchant(data);
    }
  };

  const pay = async () => {
    if (!isConnected) {
      open();
      return;
    }
    const aed = parseFloat(amount) || 0;
    if (aed <= 0) return;

    // The on-chain payment settles in AED, so the merchant field must be a wallet address.
    const to = merchant.trim();
    if (!isAddress(to)) return;

    setStatus('paying');
    try {
      const amountAED = parseUnits(amount, 18);

      // Approve AED for the payment contract, then pay(merchant, amount, receipt).
      await run(
        { address: CONTRACTS.MockAED.address, abi: CONTRACTS.MockAED.abi, functionName: 'approve', args: [CONTRACTS.SafwahPayment.address, amountAED] },
        { label: 'Approving AED' },
      );
      await run(
        { address: CONTRACTS.SafwahPayment.address, abi: CONTRACTS.SafwahPayment.abi, functionName: 'pay', args: [to, amountAED, 'safwah-app'] },
        { label: `Paying AED ${fmt(aed)}` },
      );

      oc.refetch();

      // Mirror the payment to the backend ledger (best-effort; the on-chain tx is source of truth).
      try {
        await fetch(`${API_BASE}/transactions`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            merchant: to,
            category: 'Payment',
            amountAED: aed,
            vatAED: +(aed * 0.05).toFixed(2),
            token,
            status: 'completed',
          }),
        });
      } catch {
        // ignore — the on-chain payment already succeeded
      }

      setStatus('done');
      setTimeout(() => router.back(), 1200);
    } catch {
      // run() surfaced the error in its modal; return to idle so the user can retry.
      setStatus('idle');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <View style={styles.grab} />
        <Text style={styles.title}>Scan & Pay</Text>
        <TouchableOpacity style={styles.close} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={safwah.colors.text} />
        </TouchableOpacity>
      </View>

      {status === 'done' ? (
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="checkmark" size={46} color={safwah.colors.onLime} />
          </View>
          <Text style={styles.doneText}>Paid AED {fmt(parseFloat(amount) || 0)}</Text>
          <Text style={styles.doneSub}>Settled to merchant in AED · 5% VAT recorded on-chain</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.cameraWrap}>
            {cameraReady ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={onBarcode}
              />
            ) : (
              <View style={styles.fallback}>
                <Ionicons name="qr-code-outline" size={76} color="rgba(19,19,22,0.05)" />
              </View>
            )}
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>

          <Text style={styles.hint}>
            {cameraReady ? 'Point at a Safwah QR to autofill' : 'Camera opens on the mobile build — enter details below'}
          </Text>
          {Platform.OS !== 'web' && !permission?.granted ? (
            <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permText}>Enable camera</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.field}>
            <Ionicons name="storefront-outline" size={18} color={safwah.colors.textMute} />
            <TextInput
              style={styles.input}
              placeholder="Merchant name or 0x…"
              placeholderTextColor={safwah.colors.textMute}
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.aed}>AED</Text>
            <TextInput
              style={[styles.input, styles.amount]}
              placeholder="0.00"
              placeholderTextColor={safwah.colors.textMute}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <Text style={styles.payWithLabel}>Pay with</Text>
          <View style={styles.tokenRow}>
            {(['USDT', 'AED'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tokenChip, token === t && styles.tokenChipActive]}
                onPress={() => setToken(t)}
                activeOpacity={0.85}
              >
                <View style={[styles.tokenDot, { backgroundColor: t === 'USDT' ? '#26a17b' : safwah.colors.lime }]} />
                <Text style={[styles.tokenText, token === t && { color: safwah.colors.text }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.payBtn} onPress={pay} activeOpacity={0.9} disabled={status === 'paying'}>
            {status === 'paying' ? (
              <ActivityIndicator color={safwah.colors.onLime} />
            ) : !isConnected ? (
              <>
                <Text style={styles.payText}>Connect wallet</Text>
                <Ionicons name="arrow-forward" size={18} color={safwah.colors.onLime} />
              </>
            ) : (
              <>
                <Text style={styles.payText}>Pay{amount ? ` AED ${fmt(parseFloat(amount) || 0)}` : ''}</Text>
                <Ionicons name="arrow-forward" size={18} color={safwah.colors.onLime} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bgElevated },
  header: { alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  grab: { width: 40, height: 4, borderRadius: 2, backgroundColor: safwah.colors.borderStrong, marginBottom: 14 },
  title: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text },
  close: { position: 'absolute', right: 20, top: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: safwah.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: safwah.colors.border },

  cameraWrap: { width: '100%', aspectRatio: 1, borderRadius: 26, overflow: 'hidden', backgroundColor: '#eeeef0', borderWidth: 1, borderColor: safwah.colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  fallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: safwah.colors.lime },
  tl: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  tr: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  bl: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  br: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  hint: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, textAlign: 'center', marginTop: 16 },
  permBtn: { alignSelf: 'center', marginTop: 12, paddingVertical: 9, paddingHorizontal: 18, borderRadius: safwah.radius.pill, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  permText: { fontFamily: safwah.font.semibold, fontSize: 13, color: safwah.colors.lime },

  field: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, marginTop: 12 },
  input: { flex: 1, fontFamily: safwah.font.mono, fontSize: 15, color: safwah.colors.text },
  amount: { fontFamily: safwah.font.monoBold, fontSize: 18 },
  aed: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.textDim },
  payWithLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim, marginTop: 20, marginBottom: 10 },
  tokenRow: { flexDirection: 'row', gap: 10 },
  tokenChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  tokenChipActive: { borderColor: safwah.colors.lime, backgroundColor: safwah.colors.limeWash },
  tokenDot: { width: 9, height: 9, borderRadius: 5 },
  tokenText: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.textDim },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, marginTop: 22 },
  payText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },

  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  doneCircle: { width: 92, height: 92, borderRadius: 46, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  doneText: { fontFamily: safwah.font.bold, fontSize: 24, color: safwah.colors.text },
  doneSub: { fontFamily: safwah.font.regular, fontSize: 13.5, color: safwah.colors.textDim, textAlign: 'center', marginTop: 8 },
});
