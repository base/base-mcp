import { PublicActions, WalletClient } from 'viem';
import { erc721Abi } from '../contracts/erc721.js';
import { erc1155Abi } from '../contracts/erc1155.js';
import {
  detectNftStandard,
  fetchNftsFromAlchemy,
  formatNftData,
} from './utils.js';

/**
 * List NFTs owned by a specific address
 * @param wallet Viem wallet client with public actions
 * @param ownerAddress The address to list NFTs for
 * @param limit Maximum number of NFTs to return
 * @returns Array of NFTs owned by the address
 */
export async function listNfts(
  wallet: PublicActions,
  ownerAddress: string,
  limit: number = 50,
): Promise<Array<Record<string, unknown>>> {
  try {
    // Fetch NFTs from Alchemy API
    const nftData = await fetchNftsFromAlchemy(ownerAddress, limit);

    // Format the NFT data
    const formattedNfts = formatNftData(nftData);

    return formattedNfts;
  } catch (error) {
    console.error(`Error listing NFTs for ${ownerAddress}:`, error);
    throw new Error(
      `Failed to list NFTs: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Transfer an NFT from one address to another
 * @param wallet Viem wallet client with public actions
 * @param contractAddress The NFT contract address
 * @param tokenId The token ID to transfer
 * @param toAddress The recipient address
 * @param amount The amount to transfer (only used for ERC1155)
 * @returns Transaction hash
 */
export async function transferNft(
  wallet: WalletClient & PublicActions,
  contractAddress: string,
  tokenId: string,
  toAddress: string,
  amount: string = '1',
): Promise<string> {
  try {
    // Detect the NFT standard
    const nftStandard = await detectNftStandard(wallet, contractAddress);

    if (nftStandard === 'UNKNOWN') {
      throw new Error(
        `Contract at ${contractAddress} does not implement a supported NFT standard`,
      );
    }

    // Get the wallet address
    const [fromAddress] = await wallet.getAddresses();

    // Convert addresses and values to the correct format
    const contractAddressHex = contractAddress as `0x${string}`;
    const toAddressHex = toAddress as `0x${string}`;
    const tokenIdBigInt = BigInt(tokenId);
    const amountBigInt = BigInt(amount);

    let hash: `0x${string}`;

    if (nftStandard === 'ERC721') {
      // Transfer ERC721 NFT
      hash = await wallet.writeContract({
        address: contractAddressHex,
        abi: erc721Abi,
        functionName: 'safeTransferFrom',
        args: [fromAddress, toAddressHex, tokenIdBigInt],
        chain: null,
        account: fromAddress,
      });
    } else {
      // Transfer ERC1155 NFT
      hash = await wallet.writeContract({
        address: contractAddressHex,
        abi: erc1155Abi,
        functionName: 'safeTransferFrom',
        args: [fromAddress, toAddressHex, tokenIdBigInt, amountBigInt, '0x'],
        chain: null,
        account: fromAddress,
      });
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
