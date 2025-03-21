import { PublicActions } from 'viem';
import { erc721Abi } from '../contracts/erc721.js';
import { erc1155Abi } from '../contracts/erc1155.js';

/**
 * Detect if a contract is ERC721 or ERC1155 by checking if it supports the respective interface ID
 * @param wallet Viem wallet client with public actions
 * @param contractAddress The contract address to check
 * @returns The detected NFT standard or "UNKNOWN"
 */
export async function detectNftStandard(
  wallet: PublicActions,
  contractAddress: string,
): Promise<'ERC721' | 'ERC1155' | 'UNKNOWN'> {
  try {
    // ERC721 interface ID: 0x80ac58cd
    const isErc721 = await wallet.readContract({
      address: contractAddress as `0x${string}`,
      abi: erc721Abi,
      functionName: 'supportsInterface',
      args: ['0x80ac58cd'],
    });

    if (isErc721) {
      return 'ERC721';
    }

    // ERC1155 interface ID: 0xd9b67a26
    const isErc1155 = await wallet.readContract({
      address: contractAddress as `0x${string}`,
      abi: erc1155Abi,
      functionName: 'supportsInterface',
      args: ['0xd9b67a26'],
    });

    if (isErc1155) {
      return 'ERC1155';
    }

    return 'UNKNOWN';
  } catch (error) {
    console.error(
      `Error detecting NFT standard for ${contractAddress}:`,
      error,
    );
    return 'UNKNOWN';
  }
}

/**
 * Helper function to fetch NFTs from Alchemy API
 * @param ownerAddress The address to fetch NFTs for
 * @param limit Maximum number of NFTs to fetch
 * @returns The NFT data from Alchemy API
 */
export async function fetchNftsFromAlchemy(
  ownerAddress: string,
  limit: number = 50,
): Promise<Record<string, unknown>> {
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY is not set in environment variables');
  }

  try {
    console.info(
      `Fetching NFTs for address: ${ownerAddress} with limit: ${limit}`,
    );

    const baseUrl = 'https://base-mainnet.g.alchemy.com/nft/v3';
    const url = `${baseUrl}/${apiKey}/getNFTsForOwner?owner=${ownerAddress}&withMetadata=true&pageSize=${limit}`;

    console.info(`Making request to: ${baseUrl}/${apiKey.substring(0, 3)}...`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Alchemy API error (${response.status}): ${errorText}`);
      throw new Error(
        `Alchemy API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.info(
      `Received ${data.ownedNfts?.length || 0} NFTs from Alchemy API`,
    );

    return data;
  } catch (error) {
    console.error(`Error fetching NFTs from Alchemy:`, error);
    throw error;
  }
}

/**
 * Format NFT data from Alchemy API into a more usable format
 * @param nftData The raw NFT data from Alchemy API
 * @returns Formatted NFT data
 */
// Define a more specific type for NFT data
type NftData = {
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

export function formatNftData(
  nftData: Record<string, unknown>,
): Array<Record<string, unknown>> {
  if (!nftData || !nftData.ownedNfts || !Array.isArray(nftData.ownedNfts)) {
    return [];
  }

  const ownedNfts = nftData.ownedNfts as Array<NftData>;
  return ownedNfts.map((nft) => {
    return {
      contractAddress: nft.contract?.address || '',
      tokenId: nft.tokenId || nft.id?.tokenId || '',
      title: nft.title || nft.name || 'Unnamed NFT',
      description: nft.description || '',
      tokenType: nft.tokenType || 'UNKNOWN',
      imageUrl:
        nft.media?.[0]?.gateway || nft.media?.[0]?.raw || nft.image || '',
      metadata: nft.metadata || {},
    };
  });
}
