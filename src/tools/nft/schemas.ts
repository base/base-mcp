import { z } from 'zod';

// Schema for analyzing an NFT collection
export const AnalyzeNftCollectionSchema = z.object({
  contractAddress: z
    .string()
    .describe('The contract address of the NFT collection to analyze'),
  chainId: z
    .number()
    .optional()
    .describe('The chain ID (defaults to Base Mainnet)'),
});

// Schema for minting a new NFT
export const MintNftSchema = z.object({
  name: z
    .string()
    .describe('The name of the NFT'),
  description: z
    .string()
    .describe('The description of the NFT'),
  imageUrl: z
    .string()
    .describe('URL to the image (IPFS, Arweave, or HTTP)'),
  recipientAddress: z
    .string()
    .optional()
    .describe('The recipient address (defaults to the connected wallet)'),
  attributes: z
    .array(
      z.object({
        trait_type: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      })
    )
    .optional()
    .describe('Optional attributes/traits for the NFT metadata'),
}); 