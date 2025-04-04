import { ethers } from "ethers";
import { ResolveEnsNameInput, LookupEnsAddressInput } from "./schemas.js";
import { PublicActions, WalletClient } from 'viem';

/**
 * Provider mapping for different networks
 */
const getProvider = (chainId = 1) => {
    const providers: Record<number, ethers.Provider> = {
        1: new ethers.JsonRpcProvider(process.env.ETH_MAINNET_RPC_URL || "https://ethereum.publicnode.com"),
        // Add support for other chains as needed
        5: new ethers.JsonRpcProvider(process.env.ETH_GOERLI_RPC_URL),
        11155111: new ethers.JsonRpcProvider(process.env.ETH_SEPOLIA_RPC_URL),
    };

    if (!providers[chainId]) {
        throw new Error(`Chain ID ${chainId} not supported for ENS resolution`);
    }

    return providers[chainId];
};

/**
 * Resolves an ENS name to its corresponding Ethereum address
 * 
 * @param param0 - Object containing the ENS name to resolve
 * @returns The Ethereum address corresponding to the ENS name, or null if not resolved
 */
export async function resolveEnsName(_wallet: WalletClient & PublicActions, { name, chainId = 1 }: ResolveEnsNameInput): Promise<string> {
    try {
        const provider = getProvider(chainId);
        const address = await provider.resolveName(name);
        if (!address) {
            throw new Error(`Failed to resolve ENS name: ${name}`);
        }
        return address;
    } catch (error) {
        console.error(`Error resolving ENS name ${name}:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to resolve ENS name: ${error.message}`);
        }
        throw new Error(`Failed to resolve ENS name: ${String(error)}`);
    }
}

/**
 * Performs a reverse lookup to find the ENS name for an Ethereum address
 * 
 * @param param0 - Object containing the Ethereum address to lookup
 * @returns The ENS name corresponding to the address, or null if not found
 */
export async function lookupEnsAddress(_wallet: WalletClient & PublicActions, { address, chainId = 1 }: LookupEnsAddressInput): Promise<string> {
    try {
        const provider = getProvider(chainId);
        const ensName = await provider.lookupAddress(address);

        if (!ensName) {
            throw new Error(`Failed to lookup ENS address: ${address}`);
        }

        return ensName;
    } catch (error) {
        console.error(`Error looking up address ${address}:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to lookup ENS address: ${error.message}`);
        }
        throw new Error(`Failed to lookup ENS address: ${String(error)}`);
    }
} 