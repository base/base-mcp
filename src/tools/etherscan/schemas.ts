import { z } from 'zod';

export const GetAddressTransactionsSchema = z.object({
  address: z.string().describe('The address to get transactions for'),
  startblock: z
    .number()
    .optional()
    .describe('Starting block number (defaults to 0)'),
  endblock: z
    .number()
    .optional()
    .describe('Ending block number (defaults to 99999999)'),
  page: z.number().min(1).optional().describe('Page number (defaults to 1)'),
  offset: z
    .number()
    .min(1)
    .max(1000)
    .optional()
    .describe('Number of transactions per page (1-1000, defaults to 5)'),
  sort: z
    .enum(['asc', 'desc'])
    .optional()
    .describe(
      'Sort transactions by block number (asc or desc, defaults to desc)',
    ),
  chainId: z
    .number()
    .optional()
    .describe('The chain ID (defaults to chain the wallet is connected to)'),
});

export const GetContractInfoSchema = z.object({
  address: z.string().describe('The contract address to get information for'),
  chainId: z
    .number()
    .optional()
    .describe('The chain ID (defaults to chain the wallet is connected to)'),
});
