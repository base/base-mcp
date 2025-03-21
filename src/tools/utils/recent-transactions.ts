/**
 * Utility functions for fetching recent transactions
 */
import type { Chain, Transaction } from 'viem';
import { constructBaseScanUrl } from './index.js';

/**
 * Converts BigInt values in an object to strings
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
 * Formats recent transactions into a user-friendly response
 * @param transactions The transaction list
 * @param chain The blockchain chain object
 * @returns A formatted response array
 */
export function formatRecentTransactionsResponse(
  transactions: Transaction[],
  chain: Chain,
): any {
  return transactions.map((transaction) => ({
    hash: transaction.hash,
    status: transaction.blockNumber ? 'success' : 'pending',
    blockNumber: transaction.blockNumber,
    from: transaction.from,
    to: transaction.to,
    value: transaction.value,
    explorerUrl: constructBaseScanUrl(chain, transaction.hash),
  }));
}
