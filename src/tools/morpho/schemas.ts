import { z } from 'zod';

export const GetMorphoVaultsSchema = z
  .object({
    assetSymbol: z
      .string()
      .optional()
      .describe('Asset symbol by which to filter vaults'),
  })
  .strip()
  .describe('Get the list of vaults from Morpho');
