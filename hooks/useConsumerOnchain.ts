// Live on-chain balances for the consumer app — the connected wallet's USDT / AED / SFL
// on Polygon Amoy, plus a combined AED total. Reads only; swaps/pays go through useTx.
import { formatUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { CONTRACTS } from '../lib/contracts';

const RATE = 3.6725; // AED per USD

export function useConsumerOnchain() {
  const { address, isConnected } = useAccount();
  const query = { enabled: !!address, refetchInterval: 15000 } as const;

  const usdt = useReadContract({ address: CONTRACTS.MockUSDT.address, abi: CONTRACTS.MockUSDT.abi, functionName: 'balanceOf', args: address ? [address] : undefined, query });
  const aed = useReadContract({ address: CONTRACTS.MockAED.address, abi: CONTRACTS.MockAED.abi, functionName: 'balanceOf', args: address ? [address] : undefined, query });
  const sfl = useReadContract({ address: CONTRACTS.LoyaltyMinter.address, abi: CONTRACTS.LoyaltyMinter.abi, functionName: 'getBalance', args: address ? [address] : undefined, query });

  const usdtN = usdt.data != null ? +formatUnits(usdt.data as bigint, 6) : 0;
  const aedN = aed.data != null ? +formatUnits(aed.data as bigint, 18) : 0;
  const sflN = sfl.data != null ? +formatUnits(sfl.data as bigint, 18) : 0;

  return {
    address,
    isConnected,
    usdt: usdtN,
    aed: aedN,
    sfl: sflN,
    totalAED: aedN + usdtN * RATE + sflN * 0.2,
    refetch: () => { usdt.refetch(); aed.refetch(); sfl.refetch(); },
  };
}
