import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getRates } from '../lib/api';
import { DEFAULT_RATES, type Currency, type Rates } from '../lib/format';

export type Token = 'AED' | 'USDT' | 'SFL';
export type Balances = Record<Token, number>;

export const TOKEN_META: Record<Token, { name: string; color: string }> = {
  AED: { name: 'Dirham (Mock AED)', color: '#15300C' },
  USDT: { name: 'Tether USD', color: '#26a17b' },
  SFL: { name: 'Safwah Loyalty', color: '#10b981' },
};

/// Value of 1 unit of a token, expressed in AED.
function unitAED(token: Token, rates: Rates): number {
  if (token === 'AED') return 1;
  if (token === 'USDT') return rates.aedPerUsd; // ≈ 3.6725
  return 0.2; // 1 SFL ≈ AED 0.20 redemption value
}

type Ctx = {
  balances: Balances;
  rates: Rates;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  notifications: boolean;
  setNotifications: (b: boolean) => void;
  totalAED: number;
  unitAED: (t: Token) => number;
  valueAED: (t: Token, amount?: number) => number;
  swap: (from: Token, to: Token, amount: number) => number;
  redeem: (sfl: number) => void;
  gift: (sfl: number, to: string) => void;
  topUp: (t: Token, amount: number) => void;
};

const HoldingsContext = createContext<Ctx>(null as unknown as Ctx);

export function HoldingsProvider({ children }: { children: React.ReactNode }) {
  const [balances, setBalances] = useState<Balances>({ AED: 900, USDT: 1000, SFL: 1284 });
  const [currency, setCurrency] = useState<Currency>('AED');
  const [notifications, setNotifications] = useState(true);
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);

  useEffect(() => {
    getRates().then(setRates).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const u = (t: Token) => unitAED(t, rates);
    const valueAED = (t: Token, amount = balances[t]) => amount * u(t);
    const totalAED = (Object.keys(balances) as Token[]).reduce((s, t) => s + valueAED(t), 0);
    return {
      balances,
      rates,
      currency,
      setCurrency,
      notifications,
      setNotifications,
      totalAED,
      unitAED: u,
      valueAED,
      swap: (from, to, amount) => {
        const out = (amount * u(from)) / u(to);
        setBalances((b) => ({
          ...b,
          [from]: Math.max(0, +(b[from] - amount).toFixed(6)),
          [to]: +(b[to] + out).toFixed(6),
        }));
        return out;
      },
      redeem: (sfl) => setBalances((b) => ({ ...b, SFL: Math.max(0, +(b.SFL - sfl).toFixed(6)) })),
      gift: (sfl) => setBalances((b) => ({ ...b, SFL: Math.max(0, +(b.SFL - sfl).toFixed(6)) })),
      topUp: (t, amount) => setBalances((b) => ({ ...b, [t]: +(b[t] + amount).toFixed(6) })),
    };
  }, [balances, currency, notifications, rates]);

  return <HoldingsContext.Provider value={value}>{children}</HoldingsContext.Provider>;
}

export const useHoldings = () => useContext(HoldingsContext);
