import type { EvmWalletProvider } from '@coinbase/agentkit';
import { encodeFunctionData, erc721Abi as viem_erc721Abi } from 'viem';
import { erc1155Abi } from '../../lib/contracts/erc1155.js';
import type {
  FetchNftsParams,
  FormattedNft,
  NftData,
  TransferNftParams,
} from './types.js';

// Extend viem's ERC721 ABI with supportsInterface function
const erc721Abi = [
  ...viem_erc721Abi,
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Format NFT data from Alchemy API into a more usable format
 * @param nftData The raw NFT data from Alchemy API
 * @returns Formatted NFT data
 */
export function formatNftData({
  nftData,
}: {
  nftData: Record<string, unknown>;
}): Array<FormattedNft> {
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

/**
 * Detect if a contract is ERC721 or ERC1155 by checking if it supports the respective interface ID
 * @param wallet Viem wallet client with public actions
 * @param contractAddress The contract address to check
 * @returns The detected NFT standard or "UNKNOWN"
 */
export async function detectNftStandard(
  wallet: EvmWalletProvider,
  contractAddress: `0x${string}`,
): Promise<'ERC721' | 'ERC1155' | 'UNKNOWN'> {
  try {
    // ERC721 interface ID: 0x80ac58cd
    const isErc721 = await wallet.readContract({
      address: contractAddress,
      abi: erc721Abi,
      functionName: 'supportsInterface',
      args: ['0x80ac58cd'],
    });

    if (isErc721) {
      return 'ERC721';
    }

    // ERC1155 interface ID: 0xd9b67a26
    const isErc1155 = await wallet.readContract({
      address: contractAddress,
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
export async function fetchNftsFromAlchemy({
  ownerAddress,
  limit = 50,
}: FetchNftsParams): Promise<Record<string, unknown>> {
  // Access environment variables safely
  const apiKey =
    typeof process !== 'undefined' ? process.env.ALCHEMY_API_KEY : undefined;

  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY is not set in environment variables');
  }

  try {
    const baseUrl = 'https://base-mainnet.g.alchemy.com/nft/v3';
    const url = `${baseUrl}/${apiKey}/getNFTsForOwner?owner=${ownerAddress}&withMetadata=true&pageSize=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Alchemy API error (${response.status}): ${errorText}`);
      throw new Error(
        `Alchemy API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching NFTs from Alchemy:`, error);
    throw error;
  }
}

/**
 * Transfer an NFT from one address to another
 * @param wallet Wallet client with public actions
 * @param contractAddress Address of the NFT contract
 * @param tokenId ID of the token to transfer
 * @param toAddress Address to transfer the NFT to
 * @param amount Amount of tokens to transfer (for ERC1155)
 * @returns Transaction hash
 */
export async function detectStandardAndTransferNft({
  wallet,
  contractAddress,
  tokenId,
  toAddress,
  amount = '1',
}: TransferNftParams): Promise<`0x${string}`> {
  try {
    // Detect the NFT standard
    const nftStandard = await detectNftStandard(wallet, contractAddress);

    if (nftStandard === 'UNKNOWN') {
      throw new Error(
        `Contract at ${contractAddress} does not implement a supported NFT standard`,
      );
    }

    // Get the wallet address
    const fromAddress = wallet.getAddress() as `0x${string}`;

    // Convert values to the correct format
    const tokenIdBigInt = BigInt(tokenId);
    const amountBigInt = BigInt(amount);

    let hash: `0x${string}`;

    if (nftStandard === 'ERC721') {
      // Transfer ERC721 NFT
      hash = await wallet.sendTransaction({
        to: contractAddress,
        data: encodeFunctionData({
          abi: erc721Abi,
          functionName: 'safeTransferFrom',
          args: [fromAddress, toAddress, tokenIdBigInt],
        }),
      });
    } else {
      // Transfer ERC1155 NFT
      hash = await wallet.sendTransaction({
        to: contractAddress,
        data: encodeFunctionData({
          abi: erc1155Abi,
          functionName: 'safeTransferFrom',
          args: [fromAddress, toAddress, tokenIdBigInt, amountBigInt, '0x'],
        }),
      });
    }

    // Ensure the hash is in the correct format
    if (!hash.startsWith('0x')) {
      throw new Error(`Invalid transaction hash format: ${hash}`);
    }
    return hash;
  } catch (error) {
    console.error(
      `Error transferring NFT ${tokenId} from contract ${contractAddress}:`,
      error,
    );
    throw new Error(
      `Failed to transfer NFT: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
