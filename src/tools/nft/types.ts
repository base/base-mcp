import type { EvmWalletProvider } from '@coinbase/agentkit';

/**
 * Define a more specific type for NFT data
 */
export type NftData = {
  contract?: { address?: string };
  tokenId?: string;
  id?: { tokenId?: string };
  title?: string;
  name?: string;
  description?: string;
  tokenType?: string;
  media?: Array<{ gateway?: string; raw?: string }>;
  image?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Formatted NFT data structure
 */
export type FormattedNft = {
  contractAddress: string;
  tokenId: string;
  title: string;
  description: string;
  tokenType: string;
  imageUrl: string;
  metadata: Record<string, unknown>;
};

/**
 * Parameters for fetching NFTs
 */
export type FetchNftsParams = {
  ownerAddress: string;
  limit?: number;
};

/**
 * Parameters for transferring NFTs
 */
export type TransferNftParams = {
  wallet: EvmWalletProvider;
  contractAddress: `0x${string}`;
  tokenId: string;
  toAddress: `0x${string}`;
  amount?: string;
};
