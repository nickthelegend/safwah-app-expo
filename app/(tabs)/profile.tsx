import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount, useDisconnect } from 'wagmi';

import { WalletActionsContext } from '../../provider/Web3Provider';

import { ScreenBackground } from '../../components/safwah/ScreenBackground';
import { GlassCard } from '../../components/safwah/GlassCard';
import { safwah } from '../../theme/safwah';
import { getProfile, type Profile } from '../../lib/api';
import { useHoldings } from '../../provider/HoldingsProvider';
import { type Currency } from '../../lib/format';
import { BottomSheet, useBottomSheet } from '../../components/safwah/BottomSheet';
import { useToast } from '../../components/safwah/Toast';

const DEFAULT: Profile = {
  address: 'guest',
  name: 'Aisha Rahman',
  country: 'United Kingdom',
  passport: 'GBR••••2841',
  tier: 'Gold',
  sfl: 1284,
  sflToNext: 716,
  memberSince: '2026',
};

const SUPPORT_EMAIL = 'support@safwah.ae';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { address, isConnected, chain } = useAccount();
  const { open, openAccount } = useContext(WalletActionsContext);
  const { disconnect } = useDisconnect();
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  const { currency, setCurrency, notifications, setNotifications, balances } = useHoldings();

  useEffect(() => {
    getProfile(address || 'guest').then((p) => p && setProfile(p));
  }, [address]);

  const ccySheet = useBottomSheet();
  const { toast } = useToast();
  const setCcy = (c: Currency) => {
    setCurrency(c);
    toast({ title: 'Default currency', description: `Showing balances in ${c}`, variant: 'success' });
    ccySheet.close();
  };

  const PLATINUM = 2000;
  const sfl = balances.SFL;
  const pct = Math.min(100, Math.round((sfl / PLATINUM) * 100));
  const toNext = Math.max(0, PLATINUM - sfl);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 130 }}
      >
        <Text style={styles.title}>Profile</Text>

        <GlassCard style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.country}>{profile.country} · since {profile.memberSince}</Text>
          </View>
          <View style={styles.tierBadge}>
            <Ionicons name="shield-checkmark" size={12} color={safwah.colors.emerald} />
            <Text style={styles.tierBadgeText}>{profile.tier}</Text>
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>Wallet</Text>
        <GlassCard style={styles.wallet}>
          {isConnected ? (
            <>
              <View style={styles.walletTop}>
                <View style={styles.netPill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.netText}>{chain?.name || 'Polygon Amoy'}</Text>
                </View>
                <Text style={styles.reown}>Reown</Text>
              </View>
              <Text style={styles.address}>{address}</Text>
              <View style={styles.walletActions}>
                <TouchableOpacity style={styles.manageBtn} activeOpacity={0.85} onPress={openAccount}>
                  <Text style={styles.manageText}>Manage</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.disconnectBtn} activeOpacity={0.85} onPress={() => disconnect()}>
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.walletIconWrap}>
                <Ionicons name="wallet-outline" size={24} color={safwah.colors.lime} />
              </View>
              <Text style={styles.walletTitle}>Connect your wallet</Text>
              <Text style={styles.walletSub}>
                Link an EVM wallet to pay, claim VAT and hold SFL. Powered by Reown · WalletConnect.
              </Text>
              <TouchableOpacity style={styles.connectBtn} activeOpacity={0.9} onPress={open}>
                <Ionicons name="wallet" size={18} color={safwah.colors.onLime} />
                <Text style={styles.connectText}>Connect Wallet</Text>
              </TouchableOpacity>
            </>
          )}
        </GlassCard>

        <Text style={styles.sectionLabel}>Loyalty level</Text>
        <GlassCard style={styles.level}>
          <View style={styles.levelTop}>
            <View>
              <Text style={styles.levelTier}>{profile.tier} member</Text>
              <Text style={styles.levelSfl}>{Math.round(sfl).toLocaleString()} SFL</Text>
            </View>
            <View style={styles.levelRing}>
              <Text style={styles.levelPct}>{pct}%</Text>
            </View>
          </View>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.levelHint}>{Math.round(toNext).toLocaleString()} SFL to Platinum tier</Text>
        </GlassCard>

        <Text style={styles.sectionLabel}>Settings</Text>
        <GlassCard style={{ paddingVertical: 4, paddingHorizontal: 4 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.settingRow, styles.settingBorder]}
            onPress={() =>
              Alert.alert('Passport & KYC', `${profile.passport} · Verified\n\nYour passport is verified once to unlock tax-free VAT refunds on eligible purchases.`)
            }
          >
            <View style={styles.settingIcon}>
              <Ionicons name="card-outline" size={17} color={safwah.colors.textDim} />
            </View>
            <Text style={styles.settingLabel}>Passport & KYC</Text>
            <Text style={styles.settingValue}>Verified</Text>
            <Ionicons name="chevron-forward" size={16} color={safwah.colors.textMute} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={[styles.settingRow, styles.settingBorder]} onPress={ccySheet.open}>
            <View style={styles.settingIcon}>
              <Ionicons name="cash-outline" size={17} color={safwah.colors.textDim} />
            </View>
            <Text style={styles.settingLabel}>Default currency</Text>
            <Text style={styles.settingValue}>{currency}</Text>
            <Ionicons name="chevron-forward" size={16} color={safwah.colors.textMute} />
          </TouchableOpacity>

          <View style={[styles.settingRow, styles.settingBorder]}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications-outline" size={17} color={safwah.colors.textDim} />
            </View>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: safwah.colors.lime, false: 'rgba(19,19,22,0.12)' }}
              thumbColor={safwah.colors.text}
              ios_backgroundColor="rgba(19,19,22,0.12)"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.settingRow, styles.settingBorder]}
            onPress={() =>
              Alert.alert('Security', 'Your funds are self-custodied through Reown · WalletConnect and protected by your device biometrics. Safwah never holds your private keys.')
            }
          >
            <View style={styles.settingIcon}>
              <Ionicons name="shield-checkmark-outline" size={17} color={safwah.colors.textDim} />
            </View>
            <Text style={styles.settingLabel}>Security</Text>
            <Ionicons name="chevron-forward" size={16} color={safwah.colors.textMute} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingRow}
            onPress={() => Alert.alert('Help & support', `Reach the Safwah team anytime at ${SUPPORT_EMAIL} or through 24/7 in-app live chat.`)}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="help-circle-outline" size={17} color={safwah.colors.textDim} />
            </View>
            <Text style={styles.settingLabel}>Help & support</Text>
            <Ionicons name="chevron-forward" size={16} color={safwah.colors.textMute} />
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>

      <BottomSheet isVisible={ccySheet.isVisible} onClose={ccySheet.close} title="Default currency">
        <Text style={styles.sheetHint}>How balances are shown across the app.</Text>
        <CcyOption code="AED" name="UAE Dirham" selected={currency === 'AED'} onPress={() => setCcy('AED')} />
        <CcyOption code="USD" name="US Dollar" selected={currency === 'USD'} onPress={() => setCcy('USD')} />
        <CcyOption code="USDT" name="Tether" selected={currency === 'USDT'} onPress={() => setCcy('USDT')} />
      </BottomSheet>
    </ScreenBackground>
  );
}

function CcyOption({ code, name, selected, onPress }: { code: string; name: string; selected?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.ccyOption} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.ccyBadge}>
        <Text style={styles.ccyBadgeText}>{code}</Text>
      </View>
      <Text style={styles.ccyName}>{name}</Text>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={safwah.colors.lime} /> : <View style={styles.ccyRadio} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: safwah.font.bold, fontSize: 27, color: safwah.colors.text, letterSpacing: -0.5, marginBottom: 16 },
  sheetHint: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, marginBottom: 14, lineHeight: 19 },
  ccyOption: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 14, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, marginBottom: 10 },
  ccyBadge: { width: 46, height: 36, borderRadius: 10, backgroundColor: safwah.colors.cardSoft, alignItems: 'center', justifyContent: 'center' },
  ccyBadgeText: { fontFamily: safwah.font.bold, fontSize: 12.5, color: safwah.colors.text },
  ccyName: { flex: 1, fontFamily: safwah.font.medium, fontSize: 14.5, color: safwah.colors.text },
  ccyRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: safwah.colors.borderStrong },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: safwah.font.bold, fontSize: 24, color: safwah.colors.onLime },
  name: { fontFamily: safwah.font.bold, fontSize: 17, color: safwah.colors.text },
  country: { fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textDim, marginTop: 3 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: safwah.colors.emeraldWash, paddingVertical: 5, paddingHorizontal: 10, borderRadius: safwah.radius.pill },
  tierBadgeText: { fontFamily: safwah.font.semibold, fontSize: 12, color: safwah.colors.emerald },

  sectionLabel: { fontFamily: safwah.font.semibold, fontSize: 13, color: safwah.colors.textMute, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 24, marginBottom: 10, marginLeft: 4 },

  wallet: { paddingVertical: 20 },
  walletIconWrap: { width: 50, height: 50, borderRadius: 15, backgroundColor: safwah.colors.limeWash, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  walletTitle: { fontFamily: safwah.font.bold, fontSize: 17, color: safwah.colors.text },
  walletSub: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, marginTop: 6, lineHeight: 19 },
  connectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, marginTop: 18 },
  connectText: { fontFamily: safwah.font.bold, fontSize: 15, color: safwah.colors.onLime },
  walletTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  netPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: safwah.colors.emeraldWash, paddingVertical: 5, paddingHorizontal: 10, borderRadius: safwah.radius.pill },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: safwah.colors.emerald },
  netText: { fontFamily: safwah.font.semibold, fontSize: 11.5, color: safwah.colors.emerald },
  reown: { fontFamily: safwah.font.semibold, fontSize: 12, color: safwah.colors.textMute },
  address: { fontFamily: safwah.font.mono, fontSize: 14, color: safwah.colors.text },
  walletActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  manageBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.borderStrong },
  manageText: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.text },
  disconnectBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: safwah.radius.md, borderWidth: 1, borderColor: 'rgba(229,72,77,0.3)' },
  disconnectText: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.danger },

  level: { paddingVertical: 18 },
  levelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  levelTier: { fontFamily: safwah.font.semibold, fontSize: 15, color: safwah.colors.text },
  levelSfl: { fontFamily: safwah.font.monoBold, fontSize: 20, color: safwah.colors.emerald, marginTop: 4 },
  levelRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: safwah.colors.emerald, alignItems: 'center', justifyContent: 'center' },
  levelPct: { fontFamily: safwah.font.monoBold, fontSize: 13, color: safwah.colors.text },
  levelTrack: { height: 7, borderRadius: 4, backgroundColor: '#E7F0DB', borderWidth: 1, borderColor: safwah.colors.border, overflow: 'hidden' },
  levelFill: { height: '100%', backgroundColor: safwah.colors.emerald },
  levelHint: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textMute, marginTop: 9 },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, paddingHorizontal: 12 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  settingIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: safwah.colors.cardSoft, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontFamily: safwah.font.medium, fontSize: 14.5, color: safwah.colors.text },
  settingValue: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textMute },
});
