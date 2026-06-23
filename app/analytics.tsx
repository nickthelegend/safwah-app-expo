import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../theme/safwah';
import { fmt } from '../lib/format';
import { getTransactions, type Transaction } from '../lib/api';
import { categoryBreakdown, weeklySpend } from '../lib/analytics';
import { ChartContainer } from '../components/charts/ChartContainer';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { DoughnutChart } from '../components/charts/DoughnutChart';

export default function Analytics() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [txs, setTxs] = useState<Transaction[]>([]);
  useEffect(() => {
    getTransactions().then(setTxs);
  }, []);

  const week = weeklySpend(txs);
  const cats = categoryBreakdown(txs);
  const total = txs.reduce((a, t) => a + (t.amountAED || 0), 0);
  const vat = txs.reduce((a, t) => a + (t.vatAED || 0), 0);
  const avg = txs.length ? total / txs.length : 0;
  const bars = week.map((p, i) => ({ label: p.x, value: p.y, color: i === week.length - 1 ? safwah.colors.lime : safwah.colors.emerald }));

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={safwah.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}>
        <View style={styles.tiles}>
          <Tile label="Total spent" value={`AED ${fmt(total, 0)}`} icon="card-outline" accent={safwah.colors.lime} />
          <Tile label="VAT reclaimable" value={`AED ${fmt(vat, 0)}`} icon="shield-checkmark-outline" accent={safwah.colors.emerald} />
        </View>
        <View style={styles.tiles}>
          <Tile label="Transactions" value={`${txs.length}`} icon="receipt-outline" accent={safwah.colors.lime} />
          <Tile label="Avg spend" value={`AED ${fmt(avg, 0)}`} icon="pricetag-outline" accent={safwah.colors.emerald} />
        </View>

        <ChartContainer title="Spending trend" description="AED · last 7 days" style={{ marginTop: 14 }}>
          <LineChart data={week} config={{ height: 200, showGrid: true, showLabels: true }} />
        </ChartContainer>

        <ChartContainer title="Daily spend" description="Per weekday" style={{ marginTop: 14 }}>
          <BarChart data={bars} config={{ height: 200, showLabels: true, showValues: true }} />
        </ChartContainer>

        {cats.length > 0 && (
          <ChartContainer title="Where it went" description="Spending by category" style={{ marginTop: 14 }}>
            <DoughnutChart data={cats} config={{ height: 230, innerRadius: 0.62, centerValue: `AED ${fmt(total, 0)}`, centerLabel: 'spent' }} />
          </ChartContainer>
        )}
      </ScrollView>
    </View>
  );
}

function Tile({ label, value, icon, accent }: { label: string; value: string; icon: string; accent: string }) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileTop}>
        <Ionicons name={icon as never} size={16} color={accent} />
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 14 },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text },
  tiles: { flexDirection: 'row', gap: 12, marginTop: 12 },
  tile: { flex: 1, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.md, padding: 15 },
  tileTop: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  tileLabel: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textDim },
  tileValue: { fontFamily: safwah.font.monoBold, fontSize: 18, color: safwah.colors.text },
});
