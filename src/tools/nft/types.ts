import type { EvmWalletProvider } from '@coinbase/agentkit';

/**
 * NFT record from the Alchemy NFT API.
 *
 * Shapes both v2 and v3 responses: v3 returns `image` as an object with
 * `cachedUrl` / `originalUrl` / ... , whereas v2 returned `media[].gateway`
 * / `media[].raw` and a plain string `image`.
 */
export type NftData = {
  contract?: { address?: string };
  tokenId?: string;
  id?: { tokenId?: string };
  title?: string;
  name?: string;
  description?: string;
  tokenType?: string;
  // v2
  media?: Array<{ gateway?: string; raw?: string }>;
  // v3 returns an object here; v2 returned a plain string
  image?:
    | string
    | {
        cachedUrl?: string;
        thumbnailUrl?: string;
        pngUrl?: string;
        originalUrl?: string;
      };
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
