import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '../components/safwah/ScreenBackground';
import { safwah } from '../theme/safwah';
import { WalletActionsContext } from '../provider/Web3Provider';
import { useSession } from '../provider/SessionProvider';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'qr-code-outline' as const,
    title: 'Pay anywhere\nin the UAE',
    body: 'Arrive with USDT, ETH or AED. Scan a merchant QR and pay in compliant AED — one tap, sub-second.',
    accent: safwah.colors.lime,
  },
  {
    icon: 'receipt-outline' as const,
    title: 'Get your 5%\nVAT back',
    body: 'Every purchase is recorded on-chain. Claim your VAT refund instantly — 80% now, 20% at the airport. No queues.',
    accent: safwah.colors.lime,
  },
  {
    icon: 'star-outline' as const,
    title: 'Loyalty across\nevery merchant',
    body: 'Earn Safwah Loyalty (SFL) at ADNOC, Spinneys, Emaar and more. One token, redeemable everywhere.',
    accent: safwah.colors.emerald,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { open } = React.useContext(WalletActionsContext);
  const { enterDemo } = useSession();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: any) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const demo = () => {
    enterDemo();
    router.replace('/(tabs)');
  };

  return (
    <ScreenBackground>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brand}>safwah</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.pager}
        >
          {SLIDES.map((s, i) => (
            <View key={i} style={[styles.slide, { width }]}>
              <View style={[styles.iconWrap, { borderColor: s.accent }]}>
                <Ionicons name={s.icon} size={56} color={s.accent} />
              </View>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.connectBtn} activeOpacity={0.9} onPress={open}>
            <Ionicons name="wallet" size={19} color={safwah.colors.onLime} />
            <Text style={styles.connectText}>Connect Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoBtn} activeOpacity={0.85} onPress={demo}>
            <Text style={styles.demoText}>Explore in demo mode</Text>
          </TouchableOpacity>
          <Text style={styles.legal}>Powered by Reown · WalletConnect · Polygon</Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 0 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, marginBottom: 8 },
  brandDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: safwah.colors.lime },
  brand: { fontFamily: safwah.font.bold, fontSize: 20, color: safwah.colors.text, letterSpacing: 0.5 },

  pager: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  iconWrap: {
    width: 116,
    height: 116,
    borderRadius: 34,
    borderWidth: 1.5,
    backgroundColor: safwah.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: { fontFamily: safwah.font.bold, fontSize: 30, lineHeight: 36, color: safwah.colors.text, textAlign: 'center', letterSpacing: -0.5 },
  body: { fontFamily: safwah.font.regular, fontSize: 15, lineHeight: 23, color: safwah.colors.textDim, textAlign: 'center', marginTop: 18, maxWidth: 320 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginVertical: 24 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: safwah.colors.borderStrong },
  dotActive: { width: 22, backgroundColor: safwah.colors.lime },

  actions: { paddingHorizontal: 24, gap: 12 },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 54,
    borderRadius: safwah.radius.md,
    backgroundColor: safwah.colors.lime,
  },
  connectText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
  demoBtn: { height: 50, borderRadius: safwah.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  demoText: { fontFamily: safwah.font.semibold, fontSize: 15, color: safwah.colors.text },
  legal: { fontFamily: safwah.font.regular, fontSize: 11.5, color: safwah.colors.textMute, textAlign: 'center', marginTop: 6 },
});
