import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../theme/safwah';
import { fmt, shortAddr } from '../lib/format';
import { useHoldings } from '../provider/HoldingsProvider';
import { useToast } from '../components/safwah/Toast';
import { AlertDialog, useAlertDialog } from '../components/safwah/AlertDialog';

export default function GiftScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { balances, gift } = useHoldings();
  const { toast } = useToast();
  const confirm = useAlertDialog();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<{ to: string; amt: number } | null>(null);

  const amt = parseFloat(amount) || 0;
  const insufficient = amt > balances.SFL;
  const validTo = to.trim().length >= 3;
  const canGift = amt > 0 && !insufficient && validTo;

  const doGift = () => {
    confirm.close();
    gift(amt, to.trim());
    setDone({ to: to.trim(), amt });
    toast({ title: 'Gift sent', description: `${fmt(amt, 0)} SFL to ${to.trim()}`, variant: 'success' });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <View style={styles.grab} />
        <Text style={styles.title}>Gift SFL</Text>
        <TouchableOpacity style={styles.close} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={safwah.colors.text} />
        </TouchableOpacity>
      </View>

      {done ? (
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="paper-plane" size={40} color={safwah.colors.onLime} />
          </View>
          <Text style={styles.doneText}>Sent {fmt(done.amt, 0)} SFL</Text>
          <Text style={styles.doneSub}>to {done.to.startsWith('0x') ? shortAddr(done.to) : done.to}</Text>
          <TouchableOpacity style={styles.cta} onPress={() => router.back()} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Ionicons name="person-outline" size={18} color={safwah.colors.textMute} />
            <TextInput
              style={styles.input}
              placeholder="Recipient · @handle or 0x…"
              placeholderTextColor={safwah.colors.textMute}
              autoCapitalize="none"
              value={to}
              onChangeText={setTo}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.label}>Amount</Text>
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
          </View>

          <TouchableOpacity style={[styles.cta, !canGift && styles.ctaDisabled]} onPress={confirm.open} disabled={!canGift} activeOpacity={0.9}>
            <Ionicons name="paper-plane-outline" size={17} color={safwah.colors.onLime} />
            <Text style={styles.ctaText}>{insufficient ? 'Not enough SFL' : 'Send gift'}</Text>
          </TouchableOpacity>
          <Text style={styles.note}>SFL is transferable to any Safwah user, instantly and free.</Text>
        </ScrollView>
      )}

      <AlertDialog
        isVisible={confirm.isVisible}
        onClose={confirm.close}
        title="Send gift?"
        description={`${fmt(amt, 0)} SFL will be sent to ${to.trim()} instantly — this can't be undone.`}
        confirmText="Send"
        onConfirm={doGift}
        onCancel={confirm.close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08080a' },
  header: { alignItems: 'center', marginBottom: 18, paddingHorizontal: 20 },
  grab: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 14 },
  title: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text },
  close: { position: 'absolute', right: 20, top: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: safwah.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: safwah.colors.border },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, marginBottom: 12 },
  input: { flex: 1, fontFamily: safwah.font.mono, fontSize: 15, color: safwah.colors.text },
  card: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  bal: { fontFamily: safwah.font.mono, fontSize: 12, color: safwah.colors.textMute },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountInput: { flex: 1, fontFamily: safwah.font.monoBold, fontSize: 32, color: safwah.colors.text, padding: 0 },
  sfl: { fontFamily: safwah.font.bold, fontSize: 18, color: safwah.colors.emerald },
  cta: { flexDirection: 'row', gap: 8, height: 54, paddingHorizontal: 44, minWidth: 180, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  ctaDisabled: { backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.border },
  ctaText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
  note: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textMute, textAlign: 'center', marginTop: 14 },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  doneCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  doneText: { fontFamily: safwah.font.bold, fontSize: 22, color: safwah.colors.text },
  doneSub: { fontFamily: safwah.font.mono, fontSize: 14, color: safwah.colors.textDim, marginTop: 8 },
});
