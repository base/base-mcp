import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
import { getOnrampBuyUrl } from '@coinbase/onchainkit/fund';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { GetOnrampAssetsSchema, OnrampSchema } from './schemas.js';
import type { PatchedOnrampConfigResponseData } from './types.js';

export class BaseMcpOnrampActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super('baseMcpOnramp', []);
  }

  @CreateAction({
    name: 'get_onramp_assets',
    description: 'Get the assets available for onramp',
    schema: GetOnrampAssetsSchema,
  })
  async getOnrampAssets(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetOnrampAssetsSchema>,
  ) {
    const config: PatchedOnrampConfigResponseData = await fetch(
      `https://api.developer.coinbase.com/onramp/v1/buy/options?country=${args.country}&subdivision=${args.subdivision}&networks=base`,
      {
        headers: {
          Authorization: `Bearer ${process.env.COINBASE_PUBLIC_API_KEY}`,
        },
      },
    ).then((res) => res.json());

    return JSON.stringify(config);
  }

  @CreateAction({
    name: 'onramp',
    description: 'Onramp a specific asset',
    schema: OnrampSchema,
  })
  async onramp(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof OnrampSchema>,
  ) {
    const { amountUsd, assetId } = args;

    if (!process.env.COINBASE_PROJECT_ID) {
      throw new Error('COINBASE_PROJECT_ID is not set');
    }

    const address = walletProvider.getAddress();

    if (!address) {
      throw new Error('No address found');
    }

    const onrampUrl = getOnrampBuyUrl({
      projectId: process.env.COINBASE_PROJECT_ID,
      addresses: { [address]: ['base'] }, // Onramp only available on Base
      assets: [assetId],
      presetFiatAmount: amountUsd,
      fiatCurrency: 'USD',
      redirectUrl: '',
    });

    return onrampUrl;
  }

  supportsNetwork(network: Network): boolean {
    return network.chainId === String(base.id);
  }
}

export const baseMcpOnrampActionProvider = () =>
  new BaseMcpOnrampActionProvider();
