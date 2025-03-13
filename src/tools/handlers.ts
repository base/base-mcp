import {
  isAddress,
  type Abi,
  type AbiFunction,
  type PublicActions,
  type WalletClient,
} from "viem";
import type { z } from "zod";
import { getMorphoVaults } from "../morpho/index.js";
import type { MorphoVault } from "../morpho/types.js";
import type { CallContractSchema, GetMorphoVaultsSchema } from "./schemas.js";

export async function getMorphoVaultsHandler(
  wallet: WalletClient,
  args: z.infer<typeof GetMorphoVaultsSchema>,
): Promise<MorphoVault[]> {
  const vaults = await getMorphoVaults({
    chainId: wallet.chain?.id ?? 8453,
    assetSymbol: args.assetSymbol ?? "",
  });

  return vaults;
}

export async function callContractHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof CallContractSchema>,
): Promise<string> {
  let abi: string | Abi = args.abi;
  try {
    abi = JSON.parse(abi) as Abi;
  } catch (error) {
    throw new Error(`Invalid ABI: ${error}`);
  }

  if (!isAddress(args.contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${args.contractAddress}`);
  }
  let functionAbi: AbiFunction | undefined;

  try {
    functionAbi = abi.find(
      (item) => "name" in item && item.name === args.functionName,
    ) as AbiFunction;
  } catch (error) {
    throw new Error(`Invalid function name: ${args.functionName}`);
  }

  if (
    functionAbi.stateMutability === "view" ||
    functionAbi.stateMutability === "pure"
  ) {
    const tx = await wallet.readContract({
      address: args.contractAddress,
      abi,
      functionName: args.functionName,
      args: args.functionArgs,
    });

    return String(tx);
  }

  const tx = await wallet.simulateContract({
    account: wallet.account,
    abi,
    address: args.contractAddress,
    functionName: args.functionName,
    value: BigInt(args.value ?? 0),
    args: args.functionArgs,
  });

  const txHash = await wallet.writeContract(tx.request);

  return txHash;
}
