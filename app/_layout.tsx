import 'text-encoding';
import '@walletconnect/react-native-compat';
import '../polyfills';

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

import { safwah } from '../theme/safwah';
import { Web3Provider } from '../provider/Web3Provider';
import { SessionProvider, useSession } from '../provider/SessionProvider';
import { HoldingsProvider } from '../provider/HoldingsProvider';
import { ToastProvider } from '../components/safwah/Toast';

/// Auth gate: keep unauthenticated users in onboarding, send authed users into the app.
function Gate() {
  const { isAuthed } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';
    if (!isAuthed && inTabs) router.replace('/onboarding');
    else if (isAuthed && inOnboarding) router.replace('/(tabs)');
  }, [isAuthed, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: safwah.colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="scan" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="swap" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="tokens" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="redeem" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="gift" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: safwah.colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: safwah.colors.bg }}>
      <Web3Provider>
        <SessionProvider>
          <HoldingsProvider>
            <SafeAreaProvider>
              <ToastProvider>
                <Gate />
                <StatusBar style="light" />
              </ToastProvider>
            </SafeAreaProvider>
          </HoldingsProvider>
        </SessionProvider>
      </Web3Provider>
    </GestureHandlerRootView>
  );
}
