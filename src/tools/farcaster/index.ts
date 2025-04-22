import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { FarcasterUsernameSchema } from './schemas.js';
import type { NeynarUserResponse } from './types.js';

export class FarcasterActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super('farcaster', []);
  }

  @CreateAction({
    name: 'farcaster_username',
    description: 'Resolve a Farcaster username to an Ethereum address',
    schema: FarcasterUsernameSchema,
  })
  async farcasterUsername(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof FarcasterUsernameSchema>,
  ) {
    const { username } = args;

    // Get Neynar API key from environment variables
    const neynarApiKey = process.env.NEYNAR_API_KEY;

    if (!neynarApiKey) {
      throw new Error('NEYNAR_API_KEY environment variable is not set');
    }

    try {
      // Call Neynar API to search for the user
      const response = await fetch(
        `https://api.neynar.com/v2/farcaster/user/search?q=${encodeURIComponent(username)}`,
        {
          headers: {
            accept: 'application/json',
            'x-api-key': neynarApiKey,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Neynar API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as NeynarUserResponse;

      // Check if any users were found
      if (!data.result.users || data.result.users.length === 0) {
        return JSON.stringify({
          success: false,
          message: `No Farcaster user found with username: ${username}`,
        });
      }

      // Find the user with the matching username (case-insensitive)
      const user = data.result.users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase(),
      );

      if (!user) {
        return JSON.stringify({
          success: false,
          message: `No Farcaster user found with username: ${username}`,
        });
      }

      // Check if the user has any verified Ethereum addresses
      if (
        !user.verified_addresses?.eth_addresses ||
        user.verified_addresses.eth_addresses.length === 0
      ) {
        return JSON.stringify({
          success: false,
          message: `User ${username} has no verified Ethereum addresses`,
        });
      }

      // Return the primary Ethereum address if available, otherwise the first one
      const ethAddress =
        user.verified_addresses.primary?.eth_address ||
        user.verified_addresses.eth_addresses[0];

      return JSON.stringify({
        success: true,
        username: user.username,
        fid: user.fid,
        ethAddress,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: `Error resolving Farcaster username: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  supportsNetwork(network: Network): boolean {
    return network.chainId === String(base.id);
  }
}
