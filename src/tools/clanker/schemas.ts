import { z } from 'zod';

/**
 * Schema for deploying a new token using the Clanker SDK
 * @property {string} name - The name of the token (e.g., "My Token")
 * @property {string} symbol - The token symbol (e.g., "MTK")
 * @property {string} image - IPFS URI for the token image
 */
export const ClankerDeploySchema = z.object({
  name: z.string()
    .min(1, "Token name cannot be empty")
    .max(50, "Token name cannot exceed 50 characters")
    .describe('The name of the token to deploy'),
  symbol: z.string()
    .min(1, "Token symbol cannot be empty")
    .max(10, "Token symbol cannot exceed 10 characters")
    .regex(/^[A-Z0-9]+$/, "Token symbol must contain only uppercase letters and numbers")
    .describe('The symbol of the token'),
  image: z.string()
    .startsWith('ipfs://', "Image URI must start with 'ipfs://'")
    .describe('The IPFS URI for the token image'),
}); 