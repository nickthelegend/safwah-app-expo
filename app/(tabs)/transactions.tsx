import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ScreenBackground } from '../../components/safwah/ScreenBackground';
import { GlassCard } from '../../components/safwah/GlassCard';
import { safwah } from '../../theme/safwah';
import { getTransactions, type Transaction } from '../../lib/api';
import { fmt } from '../../lib/format';

function timeAgo(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [txs, setTxs] = useState<Transaction[]>([]);

  const load = React.useCallback(() => {
    getTransactions().then(setTxs);
  }, []);
  useFocusEffect(load);

  const totalSpend = txs.reduce((s, t) => s + t.amountAED, 0);
  const totalVat = txs.reduce((s, t) => s + t.vatAED, 0);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 130 }}
      >
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>Stored in MongoDB · recorded on-chain</Text>

        <GlassCard style={styles.summary}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Total spend</Text>
            <Text style={styles.summaryValue}>AED {fmt(totalSpend)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>VAT (5%)</Text>
            <Text style={[styles.summaryValue, { color: safwah.colors.lime }]}>AED {fmt(totalVat)}</Text>
          </View>
        </GlassCard>

        {txs.map((t, i) => (
          <View key={t._id || i} style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name="arrow-up" size={16} color={safwah.colors.textDim} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{t.merchant}</Text>
              <Text style={styles.meta}>{t.category} · {timeAgo(t.ts)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amt}>− AED {fmt(t.amountAED)}</Text>
              <View style={styles.badge}>
                <View style={[styles.badgeDot, { backgroundColor: t.token === 'USDT' ? '#26a17b' : safwah.colors.lime }]} />
                <Text style={styles.badgeText}>{t.token}</Text>
              </View>
            </View>
          </View>
        ))}
        {txs.length === 0 && <Text style={styles.empty}>No transactions yet — scan a QR to pay.</Text>}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: safwah.font.bold, fontSize: 27, color: safwah.colors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, marginTop: 5, marginBottom: 18 },
  summary: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryCol: { flex: 1 },
  summaryDivider: { width: 1, height: 36, backgroundColor: safwah.colors.border, marginHorizontal: 16 },
  summaryLabel: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textDim },
  summaryValue: { fontFamily: safwah.font.monoBold, fontSize: 18, color: safwah.colors.text, marginTop: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: safwah.font.semibold, fontSize: 14.5, color: safwah.colors.text },
  meta: { fontFamily: safwah.font.regular, fontSize: 11.5, color: safwah.colors.textMute, marginTop: 2 },
  amt: { fontFamily: safwah.font.monoBold, fontSize: 14.5, color: safwah.colors.text },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: safwah.font.mono, fontSize: 10.5, color: safwah.colors.textMute },
  empty: { fontFamily: safwah.font.regular, fontSize: 14, color: safwah.colors.textMute, textAlign: 'center', marginTop: 40 },
});
