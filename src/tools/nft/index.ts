import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
import { isAddress } from 'viem';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { chainIdToChain } from '../../chains.js';
import { constructBaseScanUrl } from '../utils/index.js';
import { ListNftsSchema, TransferNftSchema } from './schemas.js';
import {
  detectStandardAndTransferNft,
  fetchNftsFromAlchemy,
  formatNftData,
} from './utils.js';

export class BaseMcpNftActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super('baseMcpNft', []);
  }

  @CreateAction({
    name: 'list_nfts',
    description: 'List NFTs owned by a specific address',
    schema: ListNftsSchema,
  })
  async listNfts(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof ListNftsSchema>,
  ) {
    try {
      // Validate owner address
      if (!isAddress(args.ownerAddress)) {
        throw new Error(`Invalid owner address: ${args.ownerAddress}`);
      }

      // Fetch NFTs from Alchemy API
      const nftData = await fetchNftsFromAlchemy({
        ownerAddress: args.ownerAddress,
        limit: args.limit,
      });

      // Format the NFT data
      const nfts = formatNftData({
        nftData,
      });

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

  @CreateAction({
    name: 'transfer_nft',
    description: 'Transfer an NFT to another address',
    schema: TransferNftSchema,
  })
  async transferNft(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof TransferNftSchema>,
  ) {
    try {
      // Validate addresses
      if (!isAddress(args.contractAddress)) {
        throw new Error(`Invalid contract address: ${args.contractAddress}`);
      }

      if (!isAddress(args.toAddress)) {
        throw new Error(`Invalid recipient address: ${args.toAddress}`);
      }

      // // Execute the transfer
      const txHash = await detectStandardAndTransferNft({
        wallet: walletProvider,
        contractAddress: args.contractAddress,
        tokenId: args.tokenId,
        toAddress: args.toAddress,
        amount: args.amount,
      });

      const chain =
        chainIdToChain(walletProvider.getNetwork().chainId ?? base.id) ?? base;

      const txUrl = constructBaseScanUrl(chain, txHash);

      return `NFT transfer initiated!\n\nTransaction: ${txUrl}\n\nPlease wait for the transaction to be confirmed.`;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      return `Error transferring NFT: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  supportsNetwork(network: Network): boolean {
    return network.chainId === String(base.id);
  }
}

export const baseMcpNftActionProvider = () => new BaseMcpNftActionProvider();
