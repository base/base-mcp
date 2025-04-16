import {
  ActionProvider,
  CreateAction,
  type EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { GetMorphoVaultsSchema } from './schemas.js';
import { getMorphoVaults } from './utils.js';

export class BaseMcpMorphoActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super('baseMcpMorpho', []);
  }

  @CreateAction({
    name: 'get_morpho_vaults',
    description: 'Get the vaults available for a particular asset on Morpho',
    schema: GetMorphoVaultsSchema,
  })
  async getMorphoVaults(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetMorphoVaultsSchema>,
  ) {
    /**
     * walletProvider isn't being passed. When it's logged, it's the value that `args` should be, { assetSymbol: 'ETH' }
     */
    console.error(' walletProvider:', walletProvider);
    const vaults = await getMorphoVaults({
      chainId: Number(walletProvider.getNetwork().chainId),
      assetSymbol: args.assetSymbol ?? '',
    });

    return JSON.stringify(vaults);
  }

  supportsNetwork(network: Network): boolean {
    return network.chainId === String(base.id);
  }
}

export const baseMcpMorphoActionProvider = () =>
  new BaseMcpMorphoActionProvider();
