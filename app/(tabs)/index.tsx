import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit-react-native';

import { ScreenBackground } from '../../components/safwah/ScreenBackground';
import { GlassCard } from '../../components/safwah/GlassCard';
import { safwah } from '../../theme/safwah';
import { getTransactions, type Transaction } from '../../lib/api';
import { CCY_SYMBOL, fmt, fromAED, shortAddr, type Currency } from '../../lib/format';
import { useHoldings } from '../../provider/HoldingsProvider';
import { useConsumerOnchain } from '../../hooks/useConsumerOnchain';
import { weeklySpend } from '../../lib/analytics';
import { ChartContainer } from '../../components/charts/ChartContainer';
import { LineChart } from '../../components/charts/LineChart';

const CCYS: Currency[] = ['AED', 'USD', 'USDT'];

function timeAgo(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const oc = useConsumerOnchain();
  const { totalAED, currency: ccy, setCurrency, rates, balances } = useHoldings();
  const effTotal = oc.isConnected ? oc.totalAED : totalAED;
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    getTransactions().then(setTxs);
  }, []);

  const bal = fromAED(effTotal, ccy, rates);
  const balText = ccy === 'USD' ? `$${fmt(bal)}` : `${fmt(bal)}`;
  const week = weeklySpend(txs);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 130 }}
      >
        <View style={styles.topbar}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brand}>safwah</Text>
          </View>
          <TouchableOpacity style={styles.walletPill} activeOpacity={0.8} onPress={() => open()}>
            <View style={[styles.dot, { backgroundColor: isConnected ? safwah.colors.emerald : safwah.colors.textMute }]} />
            <Text style={styles.walletText}>{isConnected ? shortAddr(address) : 'Connect'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>Welcome back, Aisha</Text>

        <GlassCard style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Total balance</Text>
            <View style={styles.segment}>
              {CCYS.map((c) => (
                <TouchableOpacity key={c} onPress={() => setCurrency(c)} style={[styles.segBtn, ccy === c && styles.segBtnActive]} activeOpacity={0.8}>
                  <Text style={[styles.segText, ccy === c && styles.segTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.amountRow} activeOpacity={0.7} onPress={() => router.push('/tokens')}>
            {ccy !== 'USD' && <Text style={styles.amountCcy}>{CCY_SYMBOL[ccy]}</Text>}
            <Text style={styles.amount}>{balText}</Text>
            <Ionicons name="chevron-forward" size={20} color={safwah.colors.textMute} style={{ marginBottom: 9 }} />
          </TouchableOpacity>
          <Text style={styles.amountSub}>
            {ccy !== 'AED' ? `≈ AED ${fmt(effTotal)}` : `≈ $${fmt(fromAED(effTotal, 'USD', rates))} · ${fmt(fromAED(effTotal, 'USDT', rates))} USDT`}
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.85} onPress={() => router.push('/swap')}>
              <Ionicons name="swap-horizontal" size={17} color={safwah.colors.text} />
              <Text style={styles.ghostBtnText}>Swap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.limeBtn} activeOpacity={0.9} onPress={() => router.push('/scan')}>
              <Ionicons name="qr-code" size={17} color={safwah.colors.onLime} />
              <Text style={styles.limeBtnText}>Scan & Pay</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <View style={styles.statRow}>
          <GlassCard style={styles.stat}>
            <View style={styles.statTop}>
              <Ionicons name="receipt-outline" size={17} color={safwah.colors.lime} />
              <Text style={styles.statLabel}>VAT claimable</Text>
            </View>
            <Text style={styles.statValue}>AED 241.00</Text>
          </GlassCard>
          <GlassCard style={styles.stat}>
            <View style={styles.statTop}>
              <Ionicons name="star-outline" size={17} color={safwah.colors.emerald} />
              <Text style={styles.statLabel}>Loyalty</Text>
            </View>
            <Text style={styles.statValue}>{fmt(balances.SFL, 0)} SFL</Text>
          </GlassCard>
        </View>

        <ChartContainer
          title="Spending"
          description="Last 7 days · AED"
          style={{ marginTop: 26 }}
          right={
            <TouchableOpacity style={styles.analyticsBtn} activeOpacity={0.85} onPress={() => router.push('/analytics')}>
              <Ionicons name="stats-chart" size={14} color={safwah.colors.lime} />
              <Text style={styles.analyticsText}>Analytics</Text>
            </TouchableOpacity>
          }
        >
          <LineChart data={week} config={{ height: 180, showGrid: true, showLabels: true }} />
        </ChartContainer>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: safwah.colors.lime },
  brand: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text, letterSpacing: 0.4 },
  walletPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, paddingVertical: 7, paddingHorizontal: 11, borderRadius: safwah.radius.pill },
  dot: { width: 6, height: 6, borderRadius: 3 },
  walletText: { fontFamily: safwah.font.mono, fontSize: 11.5, color: safwah.colors.textDim },
  greeting: { fontFamily: safwah.font.regular, fontSize: 14, color: safwah.colors.textDim, marginTop: 18 },

  hero: { marginTop: 12, paddingVertical: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  segment: { flexDirection: 'row', backgroundColor: '#E7F0DB', borderRadius: safwah.radius.pill, padding: 3, borderWidth: 1, borderColor: safwah.colors.border },
  segBtn: { paddingVertical: 4, paddingHorizontal: 11, borderRadius: safwah.radius.pill },
  segBtnActive: { backgroundColor: safwah.colors.lime },
  segText: { fontFamily: safwah.font.semibold, fontSize: 11, color: safwah.colors.textMute },
  segTextActive: { color: safwah.colors.onLime },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 18 },
  amountCcy: { fontFamily: safwah.font.semibold, fontSize: 16, color: safwah.colors.textDim, marginBottom: 7 },
  amount: { fontFamily: safwah.font.monoBold, fontSize: 40, color: safwah.colors.text, letterSpacing: -1 },
  amountSub: { fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textMute, marginTop: 7 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  ghostBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 46, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.borderStrong },
  ghostBtnText: { fontFamily: safwah.font.semibold, fontSize: 14.5, color: safwah.colors.text },
  limeBtn: { flex: 1.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 46, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime },
  limeBtnText: { fontFamily: safwah.font.bold, fontSize: 14.5, color: safwah.colors.onLime },

  statRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  stat: { flex: 1, paddingVertical: 16 },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  statLabel: { fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textDim },
  statValue: { fontFamily: safwah.font.monoBold, fontSize: 18, color: safwah.colors.text },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 6 },
  sectionTitle: { fontFamily: safwah.font.semibold, fontSize: 16, color: safwah.colors.text },
  seeAll: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.lime },
  analyticsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: safwah.colors.limeWash, paddingVertical: 6, paddingHorizontal: 11, borderRadius: safwah.radius.pill },
  analyticsText: { fontFamily: safwah.font.semibold, fontSize: 12, color: safwah.colors.lime },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  txIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, alignItems: 'center', justifyContent: 'center' },
  txName: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.text },
  txMeta: { fontFamily: safwah.font.regular, fontSize: 11.5, color: safwah.colors.textMute, marginTop: 2 },
  txAmt: { fontFamily: safwah.font.monoBold, fontSize: 14, color: safwah.colors.text },
  txVat: { fontFamily: safwah.font.mono, fontSize: 10.5, color: safwah.colors.lime, marginTop: 3 },
});
