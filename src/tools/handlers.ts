import {
  erc20Abi,
  formatUnits,
  isAddress,
  parseUnits,
  type Abi,
  type AbiFunction,
  type PublicActions,
  type WalletClient,
} from "viem";
import type { z } from "zod";
import { getMorphoVaults } from "../morpho/index.js";
import type { MorphoVault } from "../morpho/types.js";
import type {
  CallContractSchema,
  Erc20BalanceSchema,
  Erc20TransferSchema,
  GetMorphoVaultsSchema,
  GetOnrampAssetsSchema,
  OnrampSchema,
} from "./schemas.js";
import type { PatchedOnrampConfigResponseData } from "./types.js";
import { getOnrampBuyUrl } from "@coinbase/onchainkit/fund";

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

export async function getOnrampAssetsHandler(
  _wallet: WalletClient,
  args: z.infer<typeof GetOnrampAssetsSchema>,
): Promise<string> {
  const config: PatchedOnrampConfigResponseData = await fetch(
    `https://api.developer.coinbase.com/onramp/v1/buy/options?country=${args.country}&subdivision=${args.subdivision}&networks=base`,
    {
      headers: {
        Authorization: `Bearer ${process.env.COINBASE_PUBLIC_API_KEY}`,
      },
    },
  ).then((res) => res.json());

  return JSON.stringify(config);
}

export async function onrampHandler(
  wallet: WalletClient,
  args: z.infer<typeof OnrampSchema>,
): Promise<string> {
  const { amountUsd, assetId } = args;

  if (!process.env.COINBASE_PROJECT_ID) {
    throw new Error("COINBASE_PROJECT_ID is not set");
  }

  const address = wallet.account?.address;

  if (!address) {
    throw new Error("No address found");
  }

  const onrampUrl = getOnrampBuyUrl({
    projectId: process.env.COINBASE_PROJECT_ID,
    addresses: { [address]: ["base"] }, // Onramp only available on Base
    assets: [assetId],
    presetFiatAmount: amountUsd,
    fiatCurrency: "USD",
    redirectUrl: "",
  });

  return onrampUrl;
}

export async function erc20BalanceHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof Erc20BalanceSchema>,
): Promise<string> {
  const { contractAddress } = args;

  if (!isAddress(contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  const balance = await wallet.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet.account?.address ?? "0x"],
  });

  const decimals = await wallet.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });

  return formatUnits(balance, decimals);
}

export async function erc20TransferHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof Erc20TransferSchema>,
): Promise<string> {
  const { contractAddress, toAddress, amount } = args;

  if (!isAddress(contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  if (!isAddress(toAddress, { strict: false })) {
    throw new Error(`Invalid to address: ${toAddress}`);
  }

  // Get decimals for token
  const decimals = await wallet.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });

  // Format units
  const atomicUnits = parseUnits(amount, decimals);

  const tx = await wallet.simulateContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [toAddress, atomicUnits],
    account: wallet.account,
    chain: wallet.chain,
  });

  const txHash = await wallet.writeContract(tx.request);

  return txHash;
}
