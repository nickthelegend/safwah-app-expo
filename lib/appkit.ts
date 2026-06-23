// Reown AppKit + wagmi for the Safwah tourist app (Polygon Amoy).
// The AppKit modal is native-only; on web we run wagmi without it so the page boots cleanly.
import { Platform } from 'react-native';
import { createAppKit } from '@reown/appkit-react-native';
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import { QueryClient } from '@tanstack/react-query';
import { polygon, polygonAmoy } from 'viem/chains';
import * as Clipboard from 'expo-clipboard';

import { storage } from '../utils/StorageUtil';

export const queryClient = new QueryClient();

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '22260d6680223859f9b07dadfafce02d';

const metadata = {
  name: 'Safwah',
  description: 'UAE tourist payments, VAT refunds & loyalty on Polygon',
  url: 'https://safwah.ae',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: { native: 'safwah://', universal: 'https://safwah.ae' },
};

const networks = [polygonAmoy, polygon] as [typeof polygonAmoy, typeof polygon];

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  },
};

export const wagmiAdapter = new WagmiAdapter({ projectId, networks });

export const appkit =
  Platform.OS === 'web'
    ? null
    : createAppKit({
        projectId,
        networks,
        adapters: [wagmiAdapter],
        metadata,
        clipboardClient,
        storage,
        defaultNetwork: polygonAmoy,
        enableAnalytics: false,
        // Seedless / custodial sign-in: email + social (Google, Apple, …) embedded wallets,
        // alongside external wallets. Requires email+socials enabled on the Reown dashboard.
        features: { email: true, socials: ['google', 'apple', 'x', 'discord', 'farcaster'] },
      });
