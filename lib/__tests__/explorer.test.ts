import { POLYGONSCAN_URL, txUrl, addressUrl, shortHash } from '../explorer';

describe('explorer URL helpers', () => {
  it('points at Polygon Amoy', () => {
    expect(POLYGONSCAN_URL).toBe('https://amoy.polygonscan.com');
  });

  it('builds a tx URL', () => {
    expect(txUrl('0xdeadbeef')).toBe('https://amoy.polygonscan.com/tx/0xdeadbeef');
  });

  it('builds an address URL', () => {
    expect(addressUrl('0xabc123')).toBe('https://amoy.polygonscan.com/address/0xabc123');
  });
});

describe('shortHash', () => {
  it('truncates a hash to first-10…last-8', () => {
    expect(shortHash('0x1234567890deadbeefcafe')).toBe('0x12345678…beefcafe');
  });

  it('returns an empty string when there is no hash', () => {
    expect(shortHash(undefined)).toBe('');
    expect(shortHash('')).toBe('');
  });
});
