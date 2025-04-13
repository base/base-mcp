import { z } from 'zod';

export const SUPPORTED_TOKENS = {
  USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  HEU: '0xef22cb48b8483df6152e1423b19df5553bbd818b',
  WETH: '0x4200000000000000000000000000000000000006',
} as const;

// Define minimum amounts per token to avoid transaction failures
export const MINIMUM_AMOUNTS = {
  USDC: 1,    // Minimum 1 USDC
  HEU: 10,    // Minimum 10 HEU
  WETH: 0.001, // Minimum 0.001 WETH
} as const;

export const BuyHeuristCreditsSchema = z.object({
  tokenSymbol: z.enum(['USDC', 'HEU', 'WETH']).describe('The token to use for payment'),
  amount: z.number().positive()
    .refine(
      (_val) => true, // Will be validated in handler
      {
        message: 'Amount must be greater than minimum required for the selected token',
      }
    )
    .describe('The amount of tokens to spend (minimum: 1 USDC, 10 HEU, or 0.001 WETH). Credits will be allocated to your wallet address.'),
}); 