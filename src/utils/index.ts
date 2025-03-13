import type { Chain } from "viem";
import { base } from "viem/chains";
import { baseSepolia } from "viem/chains";

export function constructBaseScanUrl(
  chain: Chain,
  transactionHash: `0x${string}`,
) {
  if (chain.id === base.id) {
    return `https://basescan.org/tx/${transactionHash}`;
  }

  if (chain.id === baseSepolia.id) {
    return `https://sepolia.basescan.org/tx/${transactionHash}`;
  }
}
