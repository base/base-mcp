import crypto from 'crypto';
import { flaunchActionProvider } from '@coinbase/agentkit';
import { baseMcpOpenseaActionProvider } from './tools/opensea/index.js';

/**
 * Some AgentKit action providers throw if a key isn't set
 * This function returns a list of action providers that have required env vars
 */
export function getActionProvidersWithRequiredEnvVars() {
  const providers = [];
  
  if (process.env.PINATA_JWT) {
    providers.push(flaunchActionProvider());
  }
  
  if (process.env.OPENSEA_API_KEY) {
    providers.push(baseMcpOpenseaActionProvider());
  }

  return providers;
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
