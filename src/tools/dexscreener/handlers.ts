import { isAddress, PublicActions, WalletClient } from 'viem';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { TokenPriceSchema } from './schemas.js';

export async function tokenPriceHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof TokenPriceSchema>,
): Promise<string> {
  const { contractAddress } = args;

  if (!isAddress(contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  const url = `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.pairs && data.pairs.length > 0) {
      const price = data.pairs[0].priceUsd; // USD price
      return JSON.stringify({
        price: price ? parseFloat(price) : null,
        tokenAddress: contractAddress,
        chain: 'base',
      });
    }

    return JSON.stringify({
      price: null,
      tokenAddress: contractAddress,
      chain: 'base',
    });
  } catch (error) {
    console.error('Failed to fetch token price:', error);
    throw new Error(
      `Failed to fetch token price: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
