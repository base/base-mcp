/**
 * Utility functions for transactions
 */
import type { Chain, Transaction, TransactionReceipt } from 'viem';
import { constructBaseScanUrl } from './index.js';

/**
 * Validates if a string is a valid transaction hash
 * @param hash The hash to validate
 * @returns boolean indicating if the hash is valid
 */
export function isValidTxHash(hash: string): boolean {
  // Transaction hashes are 66 characters long (with 0x prefix)
  // and contain only hexadecimal characters
  return /^0x([A-Fa-f0-9]{64})$/.test(hash);
}

/**
 * Calculates the number of confirmations based on current block number and transaction block number
 * @param currentBlock The current block number
 * @param txBlockNumber The transaction block number
 * @returns The number of confirmations or undefined if not available
 */
export function calculateConfirmations(
  currentBlock?: bigint,
  txBlockNumber?: bigint,
): number | undefined {
  if (!currentBlock || !txBlockNumber) {
    return undefined;
  }
  return Number(currentBlock - txBlockNumber);
}

/**
 * Recursively converts BigInt values in an object to strings
 * @param obj The object to convert
 * @returns A new object with BigInt values converted to strings
 */
export function convertBigIntToString(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }

  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = convertBigIntToString(obj[key]);
    }
    return newObj;
  }

  return obj;
}

/**
 * Formats a transaction status response in a user-friendly way
 * @param receipt The transaction receipt
 * @param transaction The transaction details
 * @param chain The chain object
 * @returns A formatted response object
 */
export function formatTransactionStatusResponse(
  receipt: TransactionReceipt | null,
  transaction: Transaction | null,
  chain: Chain,
): any {
  // Convert transaction and receipt to ensure all BigInt values are strings
  const safeTransaction = convertBigIntToString(transaction);
  const safeReceipt = convertBigIntToString(receipt);

  // If receipt is null, the transaction is pending
  if (!safeReceipt) {
    return {
      hash: safeTransaction?.hash,
      status: 'pending',
      from: safeTransaction?.from,
      to: safeTransaction?.to,
      value: safeTransaction?.value,
      nonce: safeTransaction?.nonce,
      explorerUrl: safeTransaction?.hash
        ? constructBaseScanUrl(chain, safeTransaction.hash)
        : undefined,
    };
  }

  // Determine status based on receipt status
  const status = safeReceipt.status === 'success' ? 'success' : 'failed';

  return {
    hash: safeReceipt.transactionHash,
    status,
    blockNumber: safeReceipt.blockNumber,
    // We don't have blockTimestamp directly from the receipt
    from: safeTransaction?.from || safeReceipt.from,
    to: safeTransaction?.to || safeReceipt.to,
    value: safeTransaction?.value,
    gasUsed: safeReceipt.gasUsed,
    gasFee:
      safeReceipt.effectiveGasPrice && safeReceipt.gasUsed
        ? (
            BigInt(safeReceipt.gasUsed) * BigInt(safeReceipt.effectiveGasPrice)
          ).toString()
        : undefined,
    nonce: safeTransaction?.nonce,
    // Calculate confirmations based on chain data if needed
    explorerUrl: constructBaseScanUrl(chain, safeReceipt.transactionHash),
    errorMessage: status === 'failed' ? 'Transaction failed' : undefined,
  };
}
