import type { PublicActions, WalletClient } from 'viem';
import type { z } from 'zod';
import { chainIdToChain } from '../../chains.js';
// import type { RecentTransactionsResponse } from '../types.js';
import { RecentTransactionsSchema } from './schemas.js';

/**
 * Handler for the recent transactions tool
 * Retrieves the latest transactions for a given wallet address
 *
 * @param wallet The wallet client with public actions
 * @param args The validated input arguments
 * @returns A JSON string with the transaction details
 */
export async function recentTransactionsHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof RecentTransactionsSchema>,
): Promise<any> {
  const { address, chainId } = args;
  const chain = chainId ? chainIdToChain(chainId) : wallet.chain;

  // Ensure we have a valid chain
  if (!chain) {
    throw new Error(`Invalid chain ID: ${chainId}`);
  }

  try {
    // Fetch transactions from BaseScan API
    const response = await fetch(
      `https://${chain.name === 'baseSepolia' ? 'sepolia.' : ''}api.basescan.org/api?module=account&action=txlist&address=${address}&sort=desc`,
    );

    const data = await response.json();
    if (data.status !== '1') {
      throw new Error(`Error fetching transactions: ${data.message}`);
    }

    // Extract relevant transaction details
    const transactions = data.result.slice(0, 5).map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      blockNumber: tx.blockNumber,
      timestamp: tx.timeStamp,
      explorerUrl: `https://${chain.name === 'baseSepolia' ? 'sepolia.' : ''}basescan.org/tx/${tx.hash}`,
    }));

    return { address, transactions };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch recent transactions: ${error.message}`);
    }
    throw new Error(`Failed to fetch recent transactions: Unknown error`);
  }
}
