import { z } from "zod";

/**
 * Schema for resolveEnsName input
 */
export const ResolveEnsNameSchema = z.object({
    name: z.string().describe("The ENS name to resolve (e.g., 'vitalik.eth')"),
    chainId: z.number().optional().describe("Ethereum chain ID. Defaults to 1 (Ethereum mainnet)"),
});

/**
 * Schema for lookupEnsAddress input
 */
export const LookupEnsAddressSchema = z.object({
    address: z.string().describe("The Ethereum address to lookup (e.g., '0x123...')"),
    chainId: z.number().optional().describe("Ethereum chain ID. Defaults to 1 (Ethereum mainnet)"),
});

/**
 * Type for resolveEnsName input
 */
export type ResolveEnsNameInput = z.infer<typeof ResolveEnsNameSchema>;

/**
 * Type for lookupEnsAddress input
 */
export type LookupEnsAddressInput = z.infer<typeof LookupEnsAddressSchema>; 