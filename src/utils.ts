import crypto from 'crypto';
import { flaunchActionProvider } from '@coinbase/agentkit';

/**
 * Some AgentKit action providers throw if a key isn't set
 * This function returns a list of action providers that have required env vars
 */
export function getActionProvidersWithRequiredEnvVars() {
  if (process.env.PINATA_JWT) {
    return [flaunchActionProvider()];
  }

  return [];
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
