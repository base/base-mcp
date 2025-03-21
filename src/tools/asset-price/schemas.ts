import { z } from 'zod';

export const AssetPriceSchema = z.object({
  assetSymbols: z
    .array(z.string())
    .describe(
      'Array of asset symbols to retrieve prices for (e.g., ["ETH", "USDC"])',
    ),
  currency: z
    .string()
    .default('USD')
    .describe('The currency in which to return prices (default: USD)'),
  includeMetadata: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Whether to include additional metadata like 24h change, market cap, etc.',
    ),
});

export type AssetPriceParams = z.infer<typeof AssetPriceSchema>;

export interface AssetPrice {
  symbol: string;
  price: string;
  currency: string;
  source?: string;
}

export interface AssetMetadata {
  symbol: string;
  marketCap?: string;
  volume24h?: string;
  priceChange24h?: string;
  priceChangePercentage24h?: string;
  source?: string;
}

export interface AssetPriceResponse {
  prices: AssetPrice[];
  metadata?: AssetMetadata[];
  timestamp: string;
  source: string;
}
