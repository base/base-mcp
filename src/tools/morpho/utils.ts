import { base } from 'viem/chains';
import { morphoApiClient } from './graphql.js';
import { GET_VAULTS_QUERY } from './queries.js';
import type { MorphoVaultsResponse } from './types.js';

export async function getMorphoVaults({
  chainId = base.id,
  assetSymbol,
}: {
  chainId?: number;
  assetSymbol: string;
}) {
  const data = await morphoApiClient.request<MorphoVaultsResponse>(
    GET_VAULTS_QUERY,
    {
      chainId,
      assetSymbol,
    },
  );

  return data.vaults.items;
}
