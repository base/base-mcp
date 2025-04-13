import { ExternalAddress } from '@coinbase/coinbase-sdk';
import { isAddress } from 'viem';
import type { PublicActions, WalletClient } from 'viem';
import type { z } from 'zod';
import { CheckReputationSchema } from './schemas.js';

export async function checkReputationHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof CheckReputationSchema>,
): Promise<string> {
  const { address } = args;

  // Validate the address format
  if (!isAddress(address, { strict: false })) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }

  const externalAddress = new ExternalAddress('base-mainnet', address);
  const reputation = await externalAddress.reputation();

  return `Reputation score: ${reputation.score}, Metadata: ${JSON.stringify(reputation.metadata)}`;
}
