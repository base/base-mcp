/**
 * BaseMcp Action Provider
 *
 * This file contains the implementation of the BaseMcpActionProvider,
 * which provides actions for baseMcp operations.
 *
 * @module baseMcp
 */

import "reflect-metadata";
import type { z } from "zod";
import {
  ActionProvider,
  CreateAction,
  type EvmWalletProvider,
  type Network,
} from "@coinbase/agentkit";
import { GetMorphoVaultsSchema } from "./schemas.js";
import { base, baseSepolia } from "viem/chains";
import { getMorphoVaults } from "../../morpho/index.js";

/**
 * BaseMcpActionProvider provides actions for baseMcp operations.
 *
 * @description
 * This provider is designed to work with EvmWalletProvider for blockchain interactions.
 * It supports all evm networks.
 */
export class BaseMcpActionProvider extends ActionProvider<EvmWalletProvider> {
  /**
   * Constructor for the BaseMcpActionProvider.
   */
  constructor() {
    super("baseMcp", []);
  }

  /**
   * @description
   * Fetch a list of pools from Morpho
   *
   * @param wallet - The wallet provider instance for blockchain interactions
   * @param args - The arguments for the action
   * @returns A promise that resolves to a list of vaults
   */
  @CreateAction({
    name: "get_morpho_vaults",
    description: `
      Get the list of vaults from Morpho.

      If no asset symbol is provided, all vaults will be returned.

      A successful response will return a JSON payload similar to:

      [
        {
          "asset": {
            "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            "name": "USD Coin",
            "symbol": "USDC"
          },
          "address": "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
          "name": "Spark USDC Vault",
          "liquidity": {
            "usd": 31338556.21737191,
            "underlying": 31343395324176
          },
          "metadata": {
            "description": "Spark Liquidity Layer USDC Automated Market Operations Vault. This vault is open to others. Rulesets are defined by SparkDAO.",
            "forumLink": ""
          },
          "riskAnalysis": []
        },
        ...
  ]
    `,
    schema: GetMorphoVaultsSchema,
  })
  async getMorphoVaults(
    wallet: EvmWalletProvider,
    args: z.infer<typeof GetMorphoVaultsSchema>,
  ): Promise<string> {
    const vaults = await getMorphoVaults({
      // chainId: Number(wallet.getNetwork().chainId),
      chainId: 8453,
      assetSymbol: args.assetSymbol ?? "",
    });

    return JSON.stringify(vaults);
  }

  /**
   * Checks if this provider supports the given network.
   *
   * @param network - The network to check support for
   * @returns True if the network is supported
   */
  supportsNetwork(network: Network): boolean {
    return (
      network.chainId === String(base.id) ||
      network.chainId === String(baseSepolia.id)
    );
  }
}

/**
 * Factory function to create a new BaseMcpActionProvider instance.
 *
 * @returns A new BaseMcpActionProvider instance
 */
export const baseMcpActionProvider = () => new BaseMcpActionProvider();
