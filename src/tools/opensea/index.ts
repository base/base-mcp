import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
import { Wallet, ethers } from 'ethers';
import { OpenSeaSDK, Chain } from 'opensea-js';
import type { z } from 'zod';
import { base, baseSepolia } from 'viem/chains';
import { GetNftsByAccountSchema, ListNftSchema } from './schemas.js';

/**
 * Configuration options for the BaseMcpOpenseaActionProvider.
 */
export interface BaseMcpOpenseaActionProviderConfig {
  /**
   * OpenSea API Key.
   */
  apiKey?: string;
}

/**
 * Maps chain IDs to OpenSea Chain enum
 */
const chainIdToOpenseaChain = (chainId: number | string): Chain => {
  const id = typeof chainId === 'string' ? parseInt(chainId) : chainId;
  switch (id) {
    case 8453: // Base mainnet
      return Chain.Base;
    case 84532: // Base Sepolia
      return Chain.Base; // Use Base for Sepolia since BaseSepolia might not exist
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

/**
 * Enhanced wallet class that adds signTypedData support
 */
class EnhancedWallet extends Wallet {
  async signTypedData(
    domain: any,
    types: any,
    value: any
  ): Promise<string> {
    // Use _signTypedData which is available in ethers v5
    return await this._signTypedData(domain, types, value);
  }
}

/**
 * BaseMcpOpenseaActionProvider is an action provider for OpenSea marketplace interactions.
 */
export class BaseMcpOpenseaActionProvider extends ActionProvider<EvmWalletProvider> {
  private readonly apiKey: string;

  /**
   * Constructor for the BaseMcpOpenseaActionProvider class.
   *
   * @param config - The configuration options for the BaseMcpOpenseaActionProvider.
   */
  constructor(config: BaseMcpOpenseaActionProviderConfig = {}) {
    super('baseMcpOpensea', []);

    const apiKey = config.apiKey || process.env.OPENSEA_API_KEY;
    if (!apiKey) {
      console.warn('Warning: OPENSEA_API_KEY is not configured. OpenSea functionality will be limited.');
      this.apiKey = '';
    } else {
      this.apiKey = apiKey;
    }
  }

  /**
   * Lists an NFT for sale on OpenSea with full automation.
   *
   * @param walletProvider - The wallet provider to use
   * @param args - The input arguments for the action.
   * @returns A message containing the listing details.
   */
  @CreateAction({
    name: 'opensea_list_nft',
    description: `
This tool will list an NFT for sale on the OpenSea marketplace with full automation.
Base network is supported on mainnet and testnet.

It takes the following inputs:
- contractAddress: The NFT contract address to list
- tokenId: The ID of the NFT to list
- price: The price in ETH for which the NFT will be listed
- expirationDays: (Optional) Number of days the listing should be active for (default: 90)

Important notes:
- The wallet must own the NFT
- Price is in ETH (e.g., 1.5 for 1.5 ETH)
- The tool will handle approvals automatically if needed
- Listing may require gas fees for the first-time approval
  `,
    schema: ListNftSchema,
  })
  async listNft(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof ListNftSchema>,
  ): Promise<string> {
    if (!this.apiKey) {
      return 'Error: OPENSEA_API_KEY is not configured. Please set the OPENSEA_API_KEY environment variable.';
    }

    try {
      const network = walletProvider.getNetwork();
      const chainId = typeof network.chainId === 'string' ? parseInt(network.chainId) : (network.chainId || base.id);
      const walletAddress = walletProvider.getAddress();
      
      // Get the seed phrase from environment variables
      const seedPhrase = process.env.SEED_PHRASE;
      if (!seedPhrase) {
        throw new Error('SEED_PHRASE environment variable is not set. Unable to create wallet for OpenSea SDK.');
      }
      
      // Create an ethers wallet from the seed phrase
      const hdNode = ethers.utils.HDNode.fromMnemonic(seedPhrase);
      const privateKey = hdNode.derivePath("m/44'/60'/0'/0/0").privateKey;
      
      // Create an ethers provider for the correct network
      let rpcUrl: string;
      if (chainId === base.id) {
        rpcUrl = 'https://mainnet.base.org';
      } else if (chainId === baseSepolia.id) {
        rpcUrl = 'https://sepolia.base.org';
      } else {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }
      
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const ethersWallet = new EnhancedWallet(privateKey, provider);
      
      // Verify wallet address matches
      if (ethersWallet.address.toLowerCase() !== walletAddress.toLowerCase()) {
        console.warn(`Warning: Derived wallet address ${ethersWallet.address} differs from provider address ${walletAddress}`);
      }
      
      // Create OpenSeaSDK instance
      const openseaSDK = new OpenSeaSDK(ethersWallet as any, {
        chain: chainIdToOpenseaChain(chainId),
        apiKey: this.apiKey,
      });

      // Create the listing
      const expirationTime = Math.round(Date.now() / 1000 + args.expirationDays * 24 * 60 * 60);
      
      console.error(`Creating OpenSea listing for NFT ${args.contractAddress} token ${args.tokenId}...`);
      console.error(`Wallet address: ${ethersWallet.address}`);
      console.error(`Chain ID: ${chainId}`);
      console.error(`Price: ${args.price} ETH`);
      
      const listing = await openseaSDK.createListing({
        asset: {
          tokenId: args.tokenId,
          tokenAddress: args.contractAddress,
        },
        startAmount: args.price,
        expirationTime,
        accountAddress: ethersWallet.address,
      });

      console.error('Listing created successfully:', listing);

      // Generate OpenSea URL
      const baseUrl = chainId === base.id ? 'https://opensea.io' : 'https://testnets.opensea.io';
      const chain = chainId === base.id ? 'base' : 'base_sepolia';
      const listingUrl = `${baseUrl}/assets/${chain}/${args.contractAddress}/${args.tokenId}`;
      
      return `✅ Successfully listed NFT on OpenSea!

Contract: ${args.contractAddress}
Token ID: ${args.tokenId}
Price: ${args.price} ETH
Expiration: ${args.expirationDays} days
Wallet: ${ethersWallet.address}

View listing: ${listingUrl}

The NFT is now live on OpenSea and available for purchase!`;
    } catch (error) {
      console.error('Error listing NFT:', error);
      // Provide more detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      return `Error listing NFT: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Fetch NFTs of a specific wallet address using OpenSea API.
   *
   * @param walletProvider - The wallet provider to use
   * @param args - The input arguments for the action.
   * @returns A JSON string containing the NFTs or error message
   */
  @CreateAction({
    name: 'opensea_get_nfts',
    description: `
This tool will fetch NFTs owned by a specific wallet address from OpenSea API.

It takes the following inputs:
- accountAddress: (Optional) The wallet address to fetch NFTs for. If not provided, uses the connected wallet address.

The tool will return information about NFTs owned by the specified address.
    `,
    schema: GetNftsByAccountSchema,
  })
  async getNftsByAccount(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetNftsByAccountSchema>,
  ): Promise<string> {
    if (!this.apiKey) {
      return 'Error: OPENSEA_API_KEY is not configured. Please set the OPENSEA_API_KEY environment variable.';
    }

    try {
      const network = walletProvider.getNetwork();
      const chainId = typeof network.chainId === 'string' ? parseInt(network.chainId) : (network.chainId || base.id);
      const address = args.accountAddress || walletProvider.getAddress();
      
      // Use the API approach for fetching NFTs
      const chain = chainId === base.id ? 'base' : 'base_sepolia';
      const apiUrl = `https://api.opensea.io/api/v2/chain/${chain}/account/${address}/nfts`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'accept': 'application/json',
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`OpenSea API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.nfts || data.nfts.length === 0) {
        return `No NFTs found for address ${address} on ${chain}`;
      }

      const formattedNfts = data.nfts.map((nft: any, index: number) => ({
        index: index + 1,
        name: nft.name || 'Unnamed NFT',
        collection: nft.collection,
        tokenId: nft.identifier,
        contractAddress: nft.contract,
        imageUrl: nft.image_url,
        openseaUrl: nft.opensea_url,
      }));

      return JSON.stringify(formattedNfts, null, 2);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return `Error fetching NFTs: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Checks if the Opensea action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the Opensea action provider supports the network, false otherwise.
   */
  supportsNetwork(network: Network): boolean {
    // Only support Base mainnet and Base Sepolia
    return network.chainId === String(base.id) || network.chainId === String(baseSepolia.id);
  }
}

export const baseMcpOpenseaActionProvider = (config?: BaseMcpOpenseaActionProviderConfig) =>
  new BaseMcpOpenseaActionProvider(config);