import crypto from 'crypto';
import { flaunchActionProvider } from '@coinbase/agentkit';
import { farcasterActionProvider } from './tools/farcaster/index.js';

/**
 * Some AgentKit action providers throw if a key isn't set
 * This function returns a list of action providers that have required env vars
 */
export function getActionProvidersWithRequiredEnvVars() {
  const providers = [];

  if (process.env.PINATA_JWT) {
    providers.push(flaunchActionProvider());
  }

  if (process.env.NEYNAR_API_KEY) {
    providers.push(farcasterActionProvider());
  }

  return providers;
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
