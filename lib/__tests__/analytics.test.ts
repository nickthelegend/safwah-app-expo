import { weeklySpend, categoryBreakdown } from '../analytics';
import type { Transaction } from '../api';

// Only ts/amountAED/category matter to these functions; build partial rows.
const tx = (p: Partial<Transaction>): Transaction => ({
  merchant: 'm',
  category: 'Other',
  amountAED: 0,
  vatAED: 0,
  token: 'AED',
  status: 'completed',
  ts: Date.now(),
  ...p,
});

describe('weeklySpend', () => {
  it('returns 7 points labelled with weekday names', () => {
    const pts = weeklySpend([]);
    expect(pts).toHaveLength(7);
    const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    pts.forEach((p) => expect(dows).toContain(p.x));
  });

  it('seeds empty prior days but leaves today at its real (possibly zero) value', () => {
    // No transactions → the six prior days use the fixed seed curve, today = 0.
    expect(weeklySpend([]).map((p) => p.y)).toEqual([180, 420, 90, 560, 240, 310, 0]);
  });

  it("sums today's transactions into the final bucket", () => {
    const pts = weeklySpend([tx({ amountAED: 100 }), tx({ amountAED: 50 })]);
    expect(pts[6].y).toBe(150); // today = 100 + 50
    // prior days still fall back to the seed curve
    expect(pts.slice(0, 6).map((p) => p.y)).toEqual([180, 420, 90, 560, 240, 310]);
  });

  it('rounds fractional daily totals', () => {
    const pts = weeklySpend([tx({ amountAED: 10.4 }), tx({ amountAED: 10.4 })]);
    expect(pts[6].y).toBe(21); // round(20.8)
  });
});

describe('categoryBreakdown', () => {
  it('groups by category, sums, and sorts by value descending', () => {
    const out = categoryBreakdown([
      tx({ category: 'Dining', amountAED: 100 }),
      tx({ category: 'Dining', amountAED: 50 }),
      tx({ category: 'Retail', amountAED: 200 }),
    ]);
    expect(out.map((c) => c.label)).toEqual(['Retail', 'Dining']);
    expect(out[0].value).toBe(200);
    expect(out[1].value).toBe(150);
  });

  it('maps known categories to their palette colour', () => {
    const [dining] = categoryBreakdown([tx({ category: 'Dining', amountAED: 1 })]);
    expect(dining.color).toBe('#f59e0b');
  });

  it('falls back to Talise ink for unknown categories', () => {
    const [mystery] = categoryBreakdown([tx({ category: 'Mystery', amountAED: 1 })]);
    expect(mystery.color).toBe('#15300C');
  });

  it('defaults a missing category to "Other"', () => {
    const out = categoryBreakdown([tx({ category: undefined as unknown as string, amountAED: 5 })]);
    expect(out[0].label).toBe('Other');
  });

  it('returns an empty array for no transactions', () => {
    expect(categoryBreakdown([])).toEqual([]);
  });
});
