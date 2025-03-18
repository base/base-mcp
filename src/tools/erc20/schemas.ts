import { z } from 'zod';

export const Erc20BalanceSchema = z.object({
  contractAddress: z
    .string()
    .describe('The contract address for which to get the balance'),
});

export const Erc20TransferSchema = z.object({
  contractAddress: z
    .string()
    .describe('The address of the contract to transfer the token from'),
  toAddress: z.string().describe('The address of the recipient'),
  amount: z.string().describe('The amount of tokens to transfer'),
});
