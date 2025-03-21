import { z } from 'zod';

/**
 * Schema for the recent transactions tool
 * Validates the input parameters for fetching recent transactions
 */
export const RecentTransactionsSchema = z.object({
  address: z.string().describe('The wallet address to check transactions for'),
  chainId: z
    .number()
    .optional()
    .describe('The chain ID (defaults to Base mainnet if not specified)'),
});
