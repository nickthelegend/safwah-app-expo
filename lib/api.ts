// Thin client for the Safwah backend API (which holds the Mongo credential).
import { DEFAULT_RATES, type Rates } from './format';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export type Transaction = {
  _id?: string;
  merchant: string;
  category: string;
  amountAED: number;
  vatAED: number;
  token: 'AED' | 'USDT';
  status: string;
  ts: number;
};

export type Profile = {
  address: string;
  name: string;
  country: string;
  passport: string;
  tier: string;
  sfl: number;
  sflToNext: number;
  memberSince: string;
};

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export type Stats = {
  txCount: number;
  totalSpentAED: number;
  totalVatAED: number;
  byCategory: Record<string, { count: number; amountAED: number }>;
  byToken: Record<string, number>;
  updatedAt?: number;
};

export const DEFAULT_STATS: Stats = {
  txCount: 0,
  totalSpentAED: 0,
  totalVatAED: 0,
  byCategory: {},
  byToken: {},
};

export const getRates = () => get<Rates>('/rates', DEFAULT_RATES);
export const getTransactions = () => get<Transaction[]>('/transactions', []);
export const getProfile = (address: string) =>
  get<Profile | null>(`/profile/${address || 'guest'}`, null);
export const getStats = () => get<Stats>('/stats', DEFAULT_STATS);
