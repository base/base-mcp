import { z } from 'zod';

/**
 * Schema for the transaction status tool
 * Validates the input parameters for checking a transaction's status
 */
export const TransactionStatusSchema = z.object({
  txHash: z
    .string()
    .describe('The transaction hash to check'),
  chainId: z
    .number()
    .optional()
    .describe('The chain ID (defaults to Base mainnet if not specified)'),
}); 