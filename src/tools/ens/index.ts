// import { resolveEnsName, lookupEnsAddress } from "./handlers";
import { generateTool } from '../../utils.js';
import { lookupEnsAddress, resolveEnsName } from './handlers.js';
import { LookupEnsAddressSchema, ResolveEnsNameSchema } from "./schemas.js";

/**
 * Tool for resolving ENS (Ethereum Name Service) names and addresses
 */
export const ensTools = {
    /**
     * Resolves an ENS name to its corresponding Ethereum address
     * @example
     * // Returns "0x123...abc"
     * await resolveEnsName({ name: "vitalik.eth" });
     */
    resolveEnsName: generateTool({
        name: "resolve_ens_name",
        description: "Resolves an ENS name to its corresponding Ethereum address",
        inputSchema: ResolveEnsNameSchema,
        toolHandler: resolveEnsName,
    }),

    /**
     * Performs a reverse lookup to find the ENS name for an Ethereum address
     * @example
     * // Returns "vitalik.eth"
     * await lookupEnsAddress({ address: "0x123...abc" });
     */
    lookupEnsAddress: generateTool({
        name: "lookup_ens_address",
        description: "Performs a reverse lookup to find the ENS name for an Ethereum address",
        inputSchema: LookupEnsAddressSchema,
        toolHandler: lookupEnsAddress,
    }),
}; 