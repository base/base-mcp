import { getMorphoVaults } from "./index.js";
import type { z } from "zod";
import type { WalletClient } from "viem";
import type { MorphoVault } from "./types.js";
import type { GetMorphoVaultsSchema } from "../schemas.js";

export async function getMorphoVaultsHandler(
  wallet: WalletClient,
  args: z.infer<typeof GetMorphoVaultsSchema>,
): Promise<MorphoVault[]> {
  const vaults = await getMorphoVaults({
    chainId: wallet.chain?.id ?? 8453,
    assetSymbol: args.assetSymbol ?? "",
  });

  return vaults;
}
