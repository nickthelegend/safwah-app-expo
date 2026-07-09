import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../theme/safwah';
import { fmt, fromAED } from '../lib/format';
import { TOKEN_META, useHoldings, type Token } from '../provider/HoldingsProvider';

const ORDER: Token[] = ['AED', 'USDT', 'SFL'];

export default function TokensScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { balances, valueAED, totalAED, rates } = useHoldings();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <View style={styles.grab} />
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity style={styles.close} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={safwah.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total holdings</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalCcy}>AED</Text>
            <Text style={styles.total}>{fmt(totalAED)}</Text>
          </View>
          <Text style={styles.totalSub}>≈ ${fmt(fromAED(totalAED, 'USD', rates))} · {fmt(fromAED(totalAED, 'USDT', rates))} USDT</Text>
        </View>

        <Text style={styles.section}>Tokens</Text>
        {ORDER.map((t) => {
          const meta = TOKEN_META[t];
          const bal = balances[t];
          const val = valueAED(t);
          return (
            <View key={t} style={styles.row}>
              <View style={[styles.tokenIcon, { backgroundColor: meta.color }]}>
                <Text style={[styles.tokenSym, t === 'AED' && { color: '#ffffff' }]}>{t === 'SFL' ? 'S' : t[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tokenName}>{t}</Text>
                <Text style={styles.tokenSub}>{meta.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.tokenBal}>{fmt(bal, t === 'SFL' ? 0 : 2)}</Text>
                <Text style={styles.tokenVal}>AED {fmt(val)}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.ghost} activeOpacity={0.85} onPress={() => router.replace('/swap')}>
            <Ionicons name="swap-horizontal" size={17} color={safwah.colors.text} />
            <Text style={styles.ghostText}>Swap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lime} activeOpacity={0.9} onPress={() => router.replace('/scan')}>
            <Ionicons name="qr-code" size={17} color={safwah.colors.onLime} />
            <Text style={styles.limeText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  header: { alignItems: 'center', marginBottom: 18, paddingHorizontal: 20 },
  grab: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(19,19,22,0.18)', marginBottom: 14 },
  title: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text },
  close: { position: 'absolute', right: 20, top: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: safwah.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: safwah.colors.border },
  totalCard: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 20 },
  totalLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 10 },
  totalCcy: { fontFamily: safwah.font.semibold, fontSize: 16, color: safwah.colors.textDim, marginBottom: 6 },
  total: { fontFamily: safwah.font.monoBold, fontSize: 38, color: safwah.colors.text, letterSpacing: -1 },
  totalSub: { fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textMute, marginTop: 6 },
  section: { fontFamily: safwah.font.semibold, fontSize: 13, color: safwah.colors.textMute, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 24, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  tokenIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  tokenSym: { fontFamily: safwah.font.bold, fontSize: 17, color: '#fff' },
  tokenName: { fontFamily: safwah.font.semibold, fontSize: 15, color: safwah.colors.text },
  tokenSub: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textMute, marginTop: 2 },
  tokenBal: { fontFamily: safwah.font.monoBold, fontSize: 15, color: safwah.colors.text },
  tokenVal: { fontFamily: safwah.font.mono, fontSize: 11.5, color: safwah.colors.textMute, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  ghost: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 50, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.borderStrong },
  ghostText: { fontFamily: safwah.font.semibold, fontSize: 15, color: safwah.colors.text },
  lime: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 50, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime },
  limeText: { fontFamily: safwah.font.bold, fontSize: 15, color: safwah.colors.onLime },
});
