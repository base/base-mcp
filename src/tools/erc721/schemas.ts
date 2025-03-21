import { z } from 'zod';

export const Erc721BalanceSchema = z.object({
  contractAddress: z
    .string()
    .describe('The contract address for which to get the NFT balance'),
});

export const Erc721TransferSchema = z.object({
  contractAddress: z
    .string()
    .describe('The address of the NFT contract'),
  toAddress: z.string().describe('The address of the recipient'),
  tokenId: z.string().describe('The ID of the NFT to transfer'),
}); 