import { z } from 'zod';

export const ListNftsSchema = z.object({
  ownerAddress: z
    .string()
    .describe('The address of the owner whose NFTs to list'),
  limit: z
    .number()
    .optional()
    .describe('Maximum number of NFTs to return (default: 50)'),
});

export const TransferNftSchema = z.object({
  contractAddress: z.string().describe('The address of the NFT contract'),
  tokenId: z.string().describe('The token ID of the NFT to transfer'),
  toAddress: z.string().describe('The address of the recipient'),
  amount: z
    .string()
    .optional()
    .describe('The amount to transfer (only used for ERC1155, default: 1)'),
});
