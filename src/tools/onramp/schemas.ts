import { z } from 'zod';

export const GetOnrampAssetsSchema = z.object({
  country: z
    .string()
    .describe(
      "ISO 3166-1 two-digit country code string representing the purchasing user's country of residence, e.g., US.",
    ),
  subdivision: z
    .string()
    .optional()
    .describe(
      "ISO 3166-2 two-digit country subdivision code representing the purchasing user's subdivision of residence within their country, e.g. NY. Required if the country=“US” because certain states (e.g., NY) have state specific asset restrictions.",
    ),
});

export const OnrampSchema = z.object({
  amountUsd: z.number().describe('The amount of funds to onramp'),
  // TODO: add asset id enum
  assetId: z.string().describe('The asset ID to onramp'),
});
