import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ScreenBackground } from '../../components/safwah/ScreenBackground';
import { GlassCard } from '../../components/safwah/GlassCard';
import { safwah } from '../../theme/safwah';
import { fmt } from '../../lib/format';
import { useHoldings } from '../../provider/HoldingsProvider';

const PARTNERS = [
  { name: 'ADNOC', rate: '2×', color: '#0a7d3c', initial: 'A' },
  { name: 'Spinneys', rate: '1.5×', color: '#d23c3c', initial: 'S' },
  { name: 'Emaar', rate: '3×', color: '#8a6d3b', initial: 'E' },
  { name: 'Noon', rate: '1×', color: '#feee00', initial: 'N', dark: true },
  { name: 'Careem', rate: '2×', color: '#1fbf6c', initial: 'C' },
  { name: 'Majid Al', rate: '2.5×', color: '#5c6bc0', initial: 'M' },
];

export default function LoyaltyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { balances } = useHoldings();

  const PLATINUM = 2000;
  const pct = Math.min(100, Math.round((balances.SFL / PLATINUM) * 100));
  const toNext = Math.max(0, PLATINUM - balances.SFL);
  const valueAED = balances.SFL * 0.2;

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 130 }}
      >
        <Text style={styles.title}>Loyalty</Text>
        <Text style={styles.subtitle}>One token, every merchant — Safwah Loyalty</Text>

        <GlassCard style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Your balance</Text>
            <View style={styles.tierBadge}>
              <Ionicons name="shield-checkmark" size={12} color={safwah.colors.emerald} />
              <Text style={styles.tierText}>Gold</Text>
            </View>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{fmt(balances.SFL, 0)}</Text>
            <Text style={styles.sfl}>SFL</Text>
          </View>

          <View style={styles.tierTrack}>
            <View style={[styles.tierFill, { width: `${pct}%` }]} />
          </View>
          <View style={styles.tierMeta}>
            <Text style={styles.tierHint}>{fmt(toNext, 0)} SFL to Platinum</Text>
            <Text style={styles.tierHint}>≈ AED {fmt(valueAED)} value</Text>
          </View>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.redeemBtn} activeOpacity={0.9} onPress={() => router.push('/redeem')}>
              <Ionicons name="gift-outline" size={17} color={safwah.colors.onLime} />
              <Text style={styles.redeemText}>Redeem</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.giftBtn} activeOpacity={0.85} onPress={() => router.push('/gift')}>
              <Ionicons name="paper-plane-outline" size={16} color={safwah.colors.text} />
              <Text style={styles.giftText}>Gift</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Earn more at partners</Text>
        <View style={styles.grid}>
          {PARTNERS.map((p) => (
            <GlassCard key={p.name} style={styles.partner}>
              <View style={styles.partnerRow}>
                <View style={[styles.logo, { backgroundColor: p.color }]}>
                  <Text style={[styles.logoText, p.dark && { color: '#0A0E0B' }]}>{p.initial}</Text>
                </View>
                <View style={styles.rateChip}>
                  <Text style={styles.rateText}>{p.rate} SFL</Text>
                </View>
              </View>
              <Text style={styles.partnerName}>{p.name}</Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: safwah.font.bold, fontSize: 27, color: safwah.colors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, marginTop: 5, marginBottom: 18 },
  hero: { paddingVertical: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: safwah.colors.emeraldWash, paddingVertical: 5, paddingHorizontal: 10, borderRadius: safwah.radius.pill },
  tierText: { fontFamily: safwah.font.semibold, fontSize: 12, color: safwah.colors.emerald },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 14 },
  amount: { fontFamily: safwah.font.monoBold, fontSize: 40, color: safwah.colors.text, letterSpacing: -1 },
  sfl: { fontFamily: safwah.font.semibold, fontSize: 15, color: safwah.colors.emerald, marginBottom: 8 },
  tierTrack: { height: 7, borderRadius: 4, backgroundColor: '#E7F0DB', borderWidth: 1, borderColor: safwah.colors.border, overflow: 'hidden', marginTop: 18 },
  tierFill: { height: '100%', backgroundColor: safwah.colors.emerald },
  tierMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  tierHint: { fontFamily: safwah.font.regular, fontSize: 11.5, color: safwah.colors.textMute },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  redeemBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime },
  redeemText: { fontFamily: safwah.font.bold, fontSize: 14.5, color: safwah.colors.onLime },
  giftBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 46, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.borderStrong },
  giftText: { fontFamily: safwah.font.semibold, fontSize: 14.5, color: safwah.colors.text },
  sectionTitle: { fontFamily: safwah.font.semibold, fontSize: 16, color: safwah.colors.text, marginTop: 26, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  partner: { width: '47%', paddingVertical: 15 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  logo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: safwah.font.bold, fontSize: 17, color: '#fff' },
  rateChip: { backgroundColor: safwah.colors.limeWash, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 7 },
  rateText: { fontFamily: safwah.font.semibold, fontSize: 11, color: safwah.colors.lime },
  partnerName: { fontFamily: safwah.font.medium, fontSize: 13.5, color: safwah.colors.text },
});
