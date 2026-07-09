import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../theme/safwah';
import { fmt } from '../lib/format';
import { useHoldings } from '../provider/HoldingsProvider';
import { useToast } from '../components/safwah/Toast';

const QUICK = [100, 500, 1000];

export default function RedeemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { balances, unitAED, redeem } = useHoldings();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<{ aed: number } | null>(null);

  const amt = parseFloat(amount) || 0;
  const aed = amt * unitAED('SFL');
  const insufficient = amt > balances.SFL;
  const canRedeem = amt > 0 && !insufficient;

  const doRedeem = () => {
    if (!canRedeem) return;
    redeem(amt);
    setDone({ aed });
    toast({ title: 'Redeemed', description: `AED ${fmt(aed)} discount unlocked`, variant: 'success' });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <View style={styles.grab} />
        <Text style={styles.title}>Redeem SFL</Text>
        <TouchableOpacity style={styles.close} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={safwah.colors.text} />
        </TouchableOpacity>
      </View>

      {done ? (
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="gift" size={42} color={safwah.colors.onLime} />
          </View>
          <Text style={styles.doneText}>AED {fmt(done.aed)} discount unlocked</Text>
          <Text style={styles.doneSub}>Applied at your next checkout</Text>
          <TouchableOpacity style={styles.cta} onPress={() => router.back()} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.label}>Redeem amount</Text>
              <Text style={styles.bal}>Balance {fmt(balances.SFL, 0)} SFL</Text>
            </View>
            <View style={styles.amountRow}>
              <TextInput
                style={[styles.amountInput, insufficient && { color: safwah.colors.danger }]}
                placeholder="0"
                placeholderTextColor={safwah.colors.textMute}
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <Text style={styles.sfl}>SFL</Text>
            </View>
            <Text style={styles.worth}>= AED {fmt(aed)} discount</Text>
          </View>

          <View style={styles.quick}>
            {QUICK.map((q) => (
              <TouchableOpacity key={q} style={styles.quickChip} onPress={() => setAmount(String(q))} activeOpacity={0.85}>
                <Text style={styles.quickText}>{q}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.quickChip} onPress={() => setAmount(String(Math.floor(balances.SFL)))} activeOpacity={0.85}>
              <Text style={styles.quickText}>Max</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.cta, !canRedeem && styles.ctaDisabled]} onPress={doRedeem} disabled={!canRedeem} activeOpacity={0.9}>
            <Text style={styles.ctaText}>{insufficient ? 'Not enough SFL' : 'Redeem'}</Text>
          </TouchableOpacity>
          <Text style={styles.note}>1 SFL = AED 0.20 · redeemable at any Safwah merchant</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  header: { alignItems: 'center', marginBottom: 18, paddingHorizontal: 20 },
  grab: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(19,19,22,0.18)', marginBottom: 14 },
  title: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text },
  close: { position: 'absolute', right: 20, top: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: safwah.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: safwah.colors.border },
  card: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  bal: { fontFamily: safwah.font.mono, fontSize: 12, color: safwah.colors.textMute },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountInput: { flex: 1, fontFamily: safwah.font.monoBold, fontSize: 32, color: safwah.colors.text, padding: 0 },
  sfl: { fontFamily: safwah.font.bold, fontSize: 18, color: safwah.colors.emerald },
  worth: { fontFamily: safwah.font.medium, fontSize: 13.5, color: safwah.colors.lime, marginTop: 10 },
  quick: { flexDirection: 'row', gap: 10, marginTop: 14 },
  quickChip: { flex: 1, height: 42, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.border, alignItems: 'center', justifyContent: 'center' },
  quickText: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.text },
  cta: { height: 54, paddingHorizontal: 44, minWidth: 180, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  ctaDisabled: { backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.border },
  ctaText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
  note: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textMute, textAlign: 'center', marginTop: 14 },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  doneCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  doneText: { fontFamily: safwah.font.bold, fontSize: 21, color: safwah.colors.text, textAlign: 'center' },
  doneSub: { fontFamily: safwah.font.regular, fontSize: 13.5, color: safwah.colors.textDim, marginTop: 8 },
});
