import { isHash, type PublicActions, type WalletClient } from 'viem';
import type { z } from 'zod';
import { chainIdToChain } from '../../chains.js';
import type { TransactionStatusResponse } from '../types.js';
import {
  calculateConfirmations,
  convertBigIntToString,
  formatTransactionStatusResponse,
  isValidTxHash,
} from '../utils/index.js';
import { TransactionStatusSchema } from './schemas.js';

/**
 * Handler for the transaction status tool
 * Retrieves the status and details of a transaction
 *
 * @param wallet The wallet client with public actions
 * @param args The validated input arguments
 * @returns A JSON string with the transaction status information
 */
export async function transactionStatusHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof TransactionStatusSchema>,
): Promise<any> {
  const { txHash, chainId } = args;
  const chain = chainId ? chainIdToChain(chainId) : wallet.chain;

  // Ensure we have a valid chain
  if (!chain) {
    throw new Error(`Invalid chain ID: ${chainId}`);
  }

  // Validate transaction hash format
  if (!isValidTxHash(txHash)) {
    throw new Error(`Invalid transaction hash: ${txHash}`);
  }

  try {
    // Convert txHash to typed 0x-prefixed string
    const hash = txHash as `0x${string}`;

    // Get transaction details
    const transaction = await wallet.getTransaction({ hash });

    // Get transaction receipt (will be null for pending transactions)
    const receipt = await wallet
      .getTransactionReceipt({ hash })
      .catch(() => null);

    // Get current block number for confirmations
    const currentBlock = await wallet.getBlockNumber();

    // Basic status determination
    let status = 'pending';
    if (receipt) {
      status = receipt.status === 'success' ? 'success' : 'failed';
    }

    // Create a manually serialized response with only primitive types
    const response = {
      hash: txHash,
      status: status,
      from: transaction?.from,
      to: transaction?.to,
      blockNumber: receipt?.blockNumber ? String(receipt.blockNumber) : null,
      value: transaction?.value ? String(transaction.value) : null,
      gasUsed: receipt?.gasUsed ? String(receipt.gasUsed) : null,
      nonce:
        transaction?.nonce !== undefined ? String(transaction.nonce) : null,
      confirmations: receipt?.blockNumber
        ? String(Number(currentBlock) - Number(receipt.blockNumber))
        : null,
      explorerUrl: `https://${chain.name === 'baseSepolia' ? 'sepolia.' : ''}basescan.org/tx/${txHash}`,
    };

    // No need to use JSON.stringify here, return the object directly
    return response;
  } catch (error) {
    // Handle errors and provide useful error messages
    if (error instanceof Error) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
    throw new Error(`Failed to get transaction status: Unknown error`);
  }
}
