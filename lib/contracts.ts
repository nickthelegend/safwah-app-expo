// Safwah contract handles for the merchant app. Addresses come from EXPO_PUBLIC_*
// env (filled after `forge script Deploy`); ABIs are generated from the Foundry build.
import type { Abi } from 'viem';
import { polygonAmoy } from 'viem/chains';

import TokenRegistryAbi from './abis/TokenRegistry.json';
import MockAEDAbi from './abis/MockAED.json';
import MockUSDTAbi from './abis/MockUSDT.json';
import MerchantRegistryAbi from './abis/MerchantRegistry.json';
import VATTrackerAbi from './abis/VATTracker.json';
import LoyaltyMinterAbi from './abis/LoyaltyMinter.json';
import SafwahSwapAbi from './abis/SafwahSwap.json';
import SettlementRouterAbi from './abis/SettlementRouter.json';
import SafwahPaymentAbi from './abis/SafwahPayment.json';

const env = process.env;
// Live Amoy addresses as fallbacks so the app works even before EXPO_PUBLIC_* env is loaded.
const FALLBACK: Record<string, string> = {
  TOKEN_REGISTRY: '0xeB1cFE4eE0a4150d7be9199C145e0C020569dC59',
  MOCK_AED: '0xb0ab8015Ce10593eE9a26E78B0BeDBc21330ba23',
  MOCK_USDT: '0xAD4E088032cFfA6faDF3f085E34a04386A31A3Ce',
  MERCHANT_REGISTRY: '0xDeC4574c162d4CB4A906EEEA09d29aDc213b0bD6',
  VAT_TRACKER: '0x11ba0F051f6859a8BBb98cCa14B40F280FcB96F0',
  LOYALTY_MINTER: '0x99e7D79d61DF2EDFf28385de92D787fa2accA223',
  SAFWAH_SWAP: '0x44231038042759AC56fc1e10e7eaF83D375af687',
  SETTLEMENT_ROUTER: '0x63b612A09766Bd729aEa82B489705043Ff37B879',
  SAFWAH_PAYMENT: '0x2Fb74bC2ecC3F67C8C0984186c38645949e5e6E6',
};
const addr = (v: string | undefined, key: string) => ((v && v !== '' ? v : FALLBACK[key]) as `0x${string}`);

export const safwahChain = polygonAmoy;
export const safwahChainId = polygonAmoy.id; // 80002

export const CONTRACTS = {
  TokenRegistry: {
    address: addr(env.EXPO_PUBLIC_TOKEN_REGISTRY_ADDRESS, 'TOKEN_REGISTRY'),
    abi: TokenRegistryAbi as unknown as Abi,
  },
  MockAED: { address: addr(env.EXPO_PUBLIC_MOCK_AED_ADDRESS, 'MOCK_AED'), abi: MockAEDAbi as unknown as Abi },
  MockUSDT: { address: addr(env.EXPO_PUBLIC_MOCK_USDT_ADDRESS, 'MOCK_USDT'), abi: MockUSDTAbi as unknown as Abi },
  MerchantRegistry: {
    address: addr(env.EXPO_PUBLIC_MERCHANT_REGISTRY_ADDRESS, 'MERCHANT_REGISTRY'),
    abi: MerchantRegistryAbi as unknown as Abi,
  },
  VATTracker: { address: addr(env.EXPO_PUBLIC_VAT_TRACKER_ADDRESS, 'VAT_TRACKER'), abi: VATTrackerAbi as unknown as Abi },
  LoyaltyMinter: {
    address: addr(env.EXPO_PUBLIC_LOYALTY_MINTER_ADDRESS, 'LOYALTY_MINTER'),
    abi: LoyaltyMinterAbi as unknown as Abi,
  },
  SafwahSwap: { address: addr(env.EXPO_PUBLIC_SAFWAH_SWAP_ADDRESS, 'SAFWAH_SWAP'), abi: SafwahSwapAbi as unknown as Abi },
  SettlementRouter: {
    address: addr(env.EXPO_PUBLIC_SETTLEMENT_ROUTER_ADDRESS, 'SETTLEMENT_ROUTER'),
    abi: SettlementRouterAbi as unknown as Abi,
  },
  SafwahPayment: {
    address: addr(env.EXPO_PUBLIC_SAFWAH_PAYMENT_ADDRESS, 'SAFWAH_PAYMENT'),
    abi: SafwahPaymentAbi as unknown as Abi,
  },
} as const;

/// True once the deployed addresses have been wired into the env.
export const isContractsConfigured = () =>
  Boolean(env.EXPO_PUBLIC_MERCHANT_REGISTRY_ADDRESS && env.EXPO_PUBLIC_SAFWAH_PAYMENT_ADDRESS);
