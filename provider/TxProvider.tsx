// Transaction orchestration + status UI for the merchant app.
// Any screen can call `useTx().run(contractCall, { label })` to sign a transaction;
// a modal (TxStatusModal) automatically shows signing → pending → success/error with
// a Polygonscan link to the tx hash.
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePublicClient, useWriteContract } from 'wagmi';

import { TxStatusModal } from '@/components/TxStatusModal';

export type TxStatus = 'idle' | 'signing' | 'pending' | 'success' | 'error';

export type TxState = {
  status: TxStatus;
  label?: string;
  hash?: `0x${string}`;
  error?: string;
};

type RunConfig = {
  address: `0x${string}`;
  abi: any;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
};

type TxContextValue = {
  state: TxState;
  run: (config: RunConfig, opts?: { label?: string }) => Promise<`0x${string}`>;
  reset: () => void;
};

const TxContext = createContext<TxContextValue | null>(null);

function parseTxError(e: any): string {
  const msg = e?.shortMessage || e?.details || e?.message || 'Transaction failed';
  if (/User rejected|denied|rejected the request/i.test(msg)) return 'Transaction rejected in wallet';
  return String(msg).slice(0, 180);
}

export function TxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TxState>({ status: 'idle' });
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  const run = useCallback(
    async (config: RunConfig, opts?: { label?: string }) => {
      const label = opts?.label;
      try {
        setState({ status: 'signing', label });
        const hash = await writeContractAsync(config as any);
        setState({ status: 'pending', label, hash });

        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          setState({
            status: receipt.status === 'success' ? 'success' : 'error',
            label,
            hash,
            error: receipt.status === 'success' ? undefined : 'Transaction reverted on-chain',
          });
        } else {
          setState({ status: 'success', label, hash });
        }
        return hash;
      } catch (e) {
        setState({ status: 'error', label, error: parseTxError(e) });
        throw e;
      }
    },
    [writeContractAsync, publicClient],
  );

  const value = useMemo(() => ({ state, run, reset }), [state, run, reset]);

  return (
    <TxContext.Provider value={value}>
      {children}
      <TxStatusModal state={state} onClose={reset} />
    </TxContext.Provider>
  );
}

export function useTx() {
  const ctx = useContext(TxContext);
  if (!ctx) throw new Error('useTx must be used within TxProvider');
  return ctx;
}
