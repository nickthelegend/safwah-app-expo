// Polygonscan (Amoy) URL helpers — used by the transaction-status UI.
export const POLYGONSCAN_URL = 'https://amoy.polygonscan.com';

export const txUrl = (hash: string) => `${POLYGONSCAN_URL}/tx/${hash}`;
export const addressUrl = (address: string) => `${POLYGONSCAN_URL}/address/${address}`;

export const shortHash = (hash?: string) =>
  hash ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : '';
