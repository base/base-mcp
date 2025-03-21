import { z } from 'zod';

export const BatchTransferSchema = z.object({
  tokenAddress: z.string().describe('The ERC20 token contract address'),
  recipients: z.array(
    z.object({
      address: z.string().describe('Recipient wallet address'),
      amount: z.string().describe('Amount to transfer (in wei)'),
    })
  ).describe('Array of recipient addresses and respective amounts'),
});
