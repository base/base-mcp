import type { PublicActions, WalletClient } from 'viem';
import type { z } from 'zod';
import { Clanker } from 'clanker-sdk';
import { ClankerDeploySchema } from './schemas.js';

/**
 * Deploys a new token using the Clanker SDK
 * @param {WalletClient & PublicActions} wallet - The wallet client for deployment
 * @param {z.infer<typeof ClankerDeploySchema>} args - The deployment arguments
 * @returns {Promise<string>} A JSON string containing deployment results
 * @throws {Error} If deployment fails or initialization errors occur
 */
export async function clankerDeployHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof ClankerDeploySchema>,
): Promise<string> {
  try {
    console.log('Initializing Clanker SDK...');
    const clanker = new Clanker({
      wallet,
      publicClient: wallet,
    });

    console.log(`Deploying token with name: ${args.name}, symbol: ${args.symbol}`);
    const tokenAddress = await clanker.deployToken({
      name: args.name,
      symbol: args.symbol,
      image: args.image,
    });

    console.log(`Token deployed successfully at address: ${tokenAddress}`);
    return JSON.stringify({
      success: true,
      message: 'Token deployed successfully!',
      tokenAddress,
      details: {
        name: args.name,
        symbol: args.symbol,
        image: args.image,
      }
    });
  } catch (error) {
    console.error('Error deploying token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return JSON.stringify({
      success: false,
      message: `Failed to deploy token: ${errorMessage}`,
      error: errorMessage
    });
  }
} 