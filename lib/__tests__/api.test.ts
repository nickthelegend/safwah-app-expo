import {
  getStats,
  getRates,
  getTransactions,
  getProfile,
  DEFAULT_STATS,
} from '../api';
import { DEFAULT_RATES } from '../format';

// Drive the resilient client by stubbing global.fetch.
const okJson = (data: unknown) => ({ ok: true, json: async () => data });
const httpError = (status: number) => ({ ok: false, status, json: async () => ({}) });

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getStats', () => {
  it('returns parsed stats when the API responds 200', async () => {
    const payload = {
      txCount: 5,
      totalSpentAED: 5380.4,
      totalVatAED: 269.02,
      byCategory: { Dining: { count: 1, amountAED: 480 } },
      byToken: { USDT: 5130, AED: 250.4 },
      updatedAt: 123,
    };
    global.fetch = jest.fn().mockResolvedValue(okJson(payload)) as unknown as typeof fetch;

    const stats = await getStats();
    expect(stats.txCount).toBe(5);
    expect(stats.totalVatAED).toBe(269.02);
    expect(stats.byToken.USDT).toBe(5130);
  });

  it('falls back to DEFAULT_STATS on an HTTP error', async () => {
    global.fetch = jest.fn().mockResolvedValue(httpError(500)) as unknown as typeof fetch;
    expect(await getStats()).toEqual(DEFAULT_STATS);
  });

  it('falls back to DEFAULT_STATS when the network throws (offline/demo)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;
    expect(await getStats()).toEqual(DEFAULT_STATS);
  });
});

describe('resilient client fallbacks', () => {
  it('getRates falls back to the pegged DEFAULT_RATES when offline', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    expect(await getRates()).toEqual(DEFAULT_RATES);
  });

  it('getTransactions falls back to an empty list', async () => {
    global.fetch = jest.fn().mockResolvedValue(httpError(404)) as unknown as typeof fetch;
    expect(await getTransactions()).toEqual([]);
  });

  it('getProfile falls back to null and targets "guest" for an empty address', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(httpError(404)) as unknown as typeof fetch;
    global.fetch = fetchMock;

    expect(await getProfile('')).toBeNull();
    expect((fetchMock as jest.Mock).mock.calls[0][0]).toContain('/profile/guest');
  });

  it('getRates returns live rates when the API is up', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(okJson({ aedPerUsd: 3.75, usdtPerUsd: 0.999 })) as unknown as typeof fetch;
    const rates = await getRates();
    expect(rates.aedPerUsd).toBe(3.75);
    expect(rates.usdtPerUsd).toBe(0.999);
  });
});
