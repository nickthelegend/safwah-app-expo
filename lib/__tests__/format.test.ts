import { fmt, fromAED, shortAddr, CCY_SYMBOL, DEFAULT_RATES, type Rates } from '../format';

describe('fmt', () => {
  it('adds thousands separators and two decimals by default', () => {
    expect(fmt(1234.5)).toBe('1,234.50');
    expect(fmt(1000000)).toBe('1,000,000.00');
    expect(fmt(0)).toBe('0.00');
  });

  it('respects a custom decimal-place count (and rounds)', () => {
    expect(fmt(1234.567, 0)).toBe('1,235'); // .567 rounds up
    expect(fmt(1.236, 2)).toBe('1.24'); // .006 rounds up (away from a FP boundary)
    expect(fmt(9.94, 1)).toBe('9.9'); // .04 rounds down
  });

  it('handles negatives', () => {
    expect(fmt(-4528)).toBe('-4,528.00');
  });
});

describe('fromAED', () => {
  const rates: Rates = DEFAULT_RATES; // { aedPerUsd: 3.6725, usdtPerUsd: 1 }

  it('returns the amount unchanged for AED', () => {
    expect(fromAED(4528, 'AED', rates)).toBe(4528);
  });

  it('converts AED → USD by the peg', () => {
    expect(fromAED(3.6725, 'USD', rates)).toBeCloseTo(1, 10);
    expect(fromAED(367.25, 'USD', rates)).toBeCloseTo(100, 10);
  });

  it('converts AED → USDT through USD using the USDT/USD rate', () => {
    expect(fromAED(3.6725, 'USDT', rates)).toBeCloseTo(1, 10);
    // a depegged USDT scales the result
    expect(fromAED(3.6725, 'USDT', { aedPerUsd: 3.6725, usdtPerUsd: 0.99 })).toBeCloseTo(0.99, 10);
  });

  it('is symmetric with the peg (AED→USD→AED round-trips)', () => {
    const usd = fromAED(500, 'USD', rates);
    expect(usd * rates.aedPerUsd).toBeCloseTo(500, 6);
  });
});

describe('CCY_SYMBOL & DEFAULT_RATES', () => {
  it('maps each currency to its display symbol', () => {
    expect(CCY_SYMBOL.AED).toBe('AED');
    expect(CCY_SYMBOL.USD).toBe('$');
    expect(CCY_SYMBOL.USDT).toBe('USDT');
  });

  it('pegs AED at the official ~3.6725 rate and USDT at parity', () => {
    expect(DEFAULT_RATES.aedPerUsd).toBe(3.6725);
    expect(DEFAULT_RATES.usdtPerUsd).toBe(1);
  });
});

describe('shortAddr', () => {
  it('truncates a wallet address to head…tail', () => {
    expect(shortAddr('0xAbC1230000000000000000000000000000009999')).toBe('0xAbC1…9999');
  });

  it('returns an empty string for missing input', () => {
    expect(shortAddr(undefined)).toBe('');
    expect(shortAddr('')).toBe('');
  });
});
