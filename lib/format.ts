export type Rates = { aedPerUsd: number; usdtPerUsd: number };

export const DEFAULT_RATES: Rates = { aedPerUsd: 3.6725, usdtPerUsd: 1 };

/// Format a number with thousands separators and fixed decimals.
export function fmt(n: number, dp = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export type Currency = 'AED' | 'USD' | 'USDT';

/// Convert an AED amount into the requested currency using live-ish rates.
export function fromAED(aed: number, ccy: Currency, rates: Rates): number {
  if (ccy === 'AED') return aed;
  const usd = aed / rates.aedPerUsd;
  if (ccy === 'USD') return usd;
  return usd * rates.usdtPerUsd; // USDT
}

export const CCY_SYMBOL: Record<Currency, string> = { AED: 'AED', USD: '$', USDT: 'USDT' };

export function shortAddr(addr?: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
