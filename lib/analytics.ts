import { type Transaction } from './api';

// Demo-grade analytics derived from the user's transactions.
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRIOR6 = [180, 420, 90, 560, 240, 310]; // seeded prior-day spend (AED) for empty days

const sameDay = (ts: number, d: Date) => {
  const x = new Date(ts);
  return x.getDate() === d.getDate() && x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear();
};

/// Spend per day for the last 7 days (real where present, seeded for empty prior days).
export function weeklySpend(txs: Transaction[]): { x: string; y: number }[] {
  const now = new Date();
  const pts: { x: string; y: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const day = Math.round(txs.filter((t) => sameDay(t.ts, d)).reduce((a, t) => a + (t.amountAED || 0), 0));
    pts.push({ x: DOW[d.getDay()], y: i === 0 ? day : day || PRIOR6[6 - i] });
  }
  return pts;
}

const CAT_COLORS: Record<string, string> = {
  Electronics: '#38bdf8',
  Dining: '#f59e0b',
  Groceries: '#10b981',
  Transport: '#a78bfa',
  Retail: '#fb7185',
  Other: '#15300C',
};

/// Spend grouped by merchant category.
export function categoryBreakdown(txs: Transaction[]): { label: string; value: number; color: string }[] {
  const m: Record<string, number> = {};
  txs.forEach((t) => {
    const c = t.category || 'Other';
    m[c] = (m[c] || 0) + (t.amountAED || 0);
  });
  return Object.entries(m)
    .map(([label, value]) => ({ label, value: +value.toFixed(2), color: CAT_COLORS[label] || '#15300C' }))
    .sort((a, b) => b.value - a.value);
}
