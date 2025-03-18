import type { WalletClient } from 'viem';
import type { z } from 'zod';
import { GetMorphoVaultsSchema } from './schemas.js';
import { getMorphoVaults } from './utils.js';

export async function getMorphoVaultsHandler(
  wallet: WalletClient,
  args: z.infer<typeof GetMorphoVaultsSchema>,
): Promise<string> {
  const vaults = await getMorphoVaults({
    chainId: wallet.chain?.id,
    assetSymbol: args.assetSymbol ?? '',
  });

  return JSON.stringify(vaults);
}
