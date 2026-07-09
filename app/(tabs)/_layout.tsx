import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { safwah } from '../../theme/safwah';

const LEFT = [
  { name: 'index', icon: 'home' },
  { name: 'loyalty', icon: 'sparkles' },
] as const;
const RIGHT = [
  { name: 'transactions', icon: 'receipt' },
  { name: 'profile', icon: 'person' },
] as const;

function Tab({ item, state, navigation }: { item: { name: string; icon: string }; state: any; navigation: any }) {
  const routeIndex = state.routes.findIndex((r: any) => r.name === item.name);
  const focused = state.index === routeIndex;
  const onPress = () => {
    const e = navigation.emit({ type: 'tabPress', target: state.routes[routeIndex]?.key, canPreventDefault: true });
    if (!focused && !e.defaultPrevented) navigation.navigate(item.name);
  };
  return (
    <TouchableOpacity style={styles.cell} activeOpacity={0.7} onPress={onPress} hitSlop={8}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons
          name={(focused ? item.icon : `${item.icon}-outline`) as never}
          size={23}
          color={focused ? safwah.colors.lime : safwah.colors.textMute}
        />
      </View>
    </TouchableOpacity>
  );
}

function SafwahTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.pill}>
        {LEFT.map((it) => (
          <Tab key={it.name} item={it} state={state} navigation={navigation} />
        ))}
        <View style={styles.cell}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/scan')} hitSlop={10}>
            <View style={styles.fab}>
              <Ionicons name="qr-code" size={24} color={safwah.colors.onLime} />
            </View>
          </TouchableOpacity>
        </View>
        {RIGHT.map((it) => (
          <Tab key={it.name} item={it} state={state} navigation={navigation} />
        ))}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <SafwahTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="loyalty" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    height: 62,
    paddingHorizontal: 10,
    borderRadius: 26,
    backgroundColor: 'rgba(238,238,240,0.94)',
    borderWidth: 1,
    borderColor: safwah.colors.border,
    shadowColor: 'rgba(19,19,22,0.12)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 26,
    elevation: 18,
  },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    width: 44,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: safwah.colors.limeWash },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 18,
    marginTop: -20,
    backgroundColor: safwah.colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#E7F0DB',
    shadowColor: safwah.colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
});
