import { isAddress, type PublicActions, type WalletClient } from 'viem';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { constructBaseScanUrl } from '../utils/index.js';
import { ListNftsSchema, TransferNftSchema } from './schemas.js';

export async function listNftsHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof ListNftsSchema>,
): Promise<string> {
  try {
    // Import the listNfts function dynamically to avoid circular dependencies
    const { listNfts } = await import('../../lib/nft/index.js');

    // Validate owner address
    if (!isAddress(args.ownerAddress)) {
      throw new Error(`Invalid owner address: ${args.ownerAddress}`);
    }

    console.info(`Listing NFTs for address: ${args.ownerAddress}`);

    // Get NFTs for the address
    const nfts = await listNfts(wallet, args.ownerAddress, args.limit);

    // Format the result
    if (nfts.length === 0) {
      return 'No NFTs found for this address.';
    }

    const formattedNfts = nfts
      .map((nft, index) => {
        return `${index + 1}. ${nft.title} (${nft.tokenType})
  Contract: ${nft.contractAddress}
  Token ID: ${nft.tokenId}
  ${nft.imageUrl ? `Image: ${nft.imageUrl}` : ''}`;
      })
      .join('\n\n');

    return `Found ${nfts.length} NFTs:\n\n${formattedNfts}`;
  } catch (error) {
    console.error('Error listing NFTs:', error);
    return `Error listing NFTs: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function transferNftHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof TransferNftSchema>,
): Promise<string> {
  try {
    // Import the transferNft function dynamically to avoid circular dependencies
    const { transferNft } = await import('../../lib/nft/index.js');

    // Validate addresses
    if (!isAddress(args.contractAddress)) {
      throw new Error(`Invalid contract address: ${args.contractAddress}`);
    }

    if (!isAddress(args.toAddress)) {
      throw new Error(`Invalid recipient address: ${args.toAddress}`);
    }

    console.info(
      `Transferring NFT ${args.tokenId} from contract ${args.contractAddress} to ${args.toAddress}`,
    );

    // Execute the transfer
    const txHash = await transferNft(
      wallet,
      args.contractAddress,
      args.tokenId,
      args.toAddress,
      args.amount,
    );

    // Construct transaction URL
    const txUrl = constructBaseScanUrl(
      wallet.chain ?? base,
      txHash as `0x${string}`,
    );

    return `NFT transfer initiated!\n\nTransaction: ${txUrl}\n\nPlease wait for the transaction to be confirmed.`;
  } catch (error) {
    console.error('Error transferring NFT:', error);
    return `Error transferring NFT: ${error instanceof Error ? error.message : String(error)}`;
  }
}
