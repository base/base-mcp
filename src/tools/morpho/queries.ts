import { gql } from 'graphql-request';

// Get a list of vaults from Morpho
export const GET_VAULTS_QUERY = gql`
  query VaultsQuery($chainId: Int!, $assetSymbol: String!) {
    vaults(
      where: { chainId_in: [$chainId], assetSymbol_in: [$assetSymbol] }
      orderBy: TotalAssetsUsd
      orderDirection: Desc
    ) {
      items {
        asset {
          address
          name
          symbol
        }
        address
        name
        liquidity {
          usd
          underlying
        }
        metadata {
          description
          forumLink
        }
        riskAnalysis {
          provider
          score
        }
      }
    }
  }
`;
