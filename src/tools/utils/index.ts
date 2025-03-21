import type { Chain } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { chainIdToChain } from '../../chains.js';

interface ExtractedTokenData {
  dex: string;
  pairName: string;
  pairAddress: string;
  priceUsd: string;
  volume24h: number;
  marketCap: number;
  pairCreatedAt: string;
  socials: {
    websites: string[];
    socialLinks: string[];
  };
}

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

export const checkToolSupportsChain = ({
  chainId,
  supportedChains,
}: {
  chainId: number | undefined;
  supportedChains: Chain[];
}) => {
  if (supportedChains.some((chain) => chain.id === chainId)) {
    return true;
  }

  const chainName = chainId
    ? (chainIdToChain(chainId)?.name ?? `chain ${chainId}`)
    : 'chain';

  throw new Error(`Not implemented on ${chainName}`);
};

export async function fetchDexscreener(url: string, action: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to ${action}: ${error.message}`);
    }
    throw new Error(`Failed to ${action}: Unknown error`);
  }
}

export function extractTokenData(data: any[]): ExtractedTokenData {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data format received');
  }

  const tokenData = data[0];
  const extracted = {
    dex: tokenData.dexId,
    pairName: `${tokenData.baseToken.symbol}/${tokenData.quoteToken.symbol}`,
    pairAddress: tokenData.pairAddress,
    priceUsd: `$${Number(tokenData.priceUsd).toFixed(6)}`,
    volume24h: tokenData.volume.h24,
    marketCap: tokenData.marketCap,
    pairCreatedAt: new Date(tokenData.pairCreatedAt).toISOString(),
    socials: {
      websites: tokenData.info?.websites || [],
      socialLinks: tokenData.info?.socials || [],
    },
  };

  console.log('Data Format: ', extracted);
  return extracted;
}
