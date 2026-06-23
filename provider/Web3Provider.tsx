import React, { createContext, useMemo } from 'react';
import { View } from 'react-native';
import { AppKit, AppKitProvider, useAppKit } from '@reown/appkit-react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { appkit, queryClient, wagmiAdapter } from '../lib/appkit';

type WalletActions = { open: () => void; openAccount: () => void };

/// Exposes the AppKit modal actions through context so screens never call useAppKit()
/// directly — keeps web (where AppKit is disabled) from crashing.
export const WalletActionsContext = createContext<WalletActions>({ open: () => {}, openAccount: () => {} });

function AppKitBridge({ children }: { children: React.ReactNode }) {
  const { open } = useAppKit();
  const value = useMemo<WalletActions>(
    () => ({ open: () => open(), openAccount: () => open({ view: 'Account' }) }),
    [open],
  );
  return <WalletActionsContext.Provider value={value}>{children}</WalletActionsContext.Provider>;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {appkit ? (
          <AppKitProvider instance={appkit}>
            <AppKitBridge>
              {children}
              <View style={{ position: 'absolute', height: '100%', width: '100%' }} pointerEvents="box-none">
                <AppKit />
              </View>
            </AppKitBridge>
          </AppKitProvider>
        ) : (
          children
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
