import {
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  isAddress,
  parseUnits,
  type Abi,
  type AbiFunction,
  type Account,
  type PublicActions,
  type WalletClient,
} from "viem";
import type { z } from "zod";
import { getMorphoVaults } from "../morpho/index.js";
import type { MorphoVault } from "../morpho/types.js";
import type {
  BuyOpenRouterCreditsSchema,
  CallContractSchema,
  Erc20BalanceSchema,
  Erc20TransferSchema,
  GetMorphoVaultsSchema,
  GetOnrampAssetsSchema,
  OnrampSchema,
} from "./schemas.js";
import type {
  OpenRouterTransferIntentResponse,
  PatchedOnrampConfigResponseData,
} from "./types.js";
import { getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { base } from "viem/chains";
import { USDC_ADDRESS, USDC_DECIMALS } from "../lib/constants.js";
import { COINBASE_COMMERCE_ABI } from "../lib/contracts/coinbase-commerce.js";
import { waitForTransactionReceipt } from "viem/actions";

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

export async function buyOpenRouterCreditsHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof BuyOpenRouterCreditsSchema>,
): Promise<string> {
  const { amountUsd } = args;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const address = wallet.account?.address;

  if (!address) {
    throw new Error("No address found");
  }

  // Ensure user has enough USDC for txn
  const usdcBalance = await wallet.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });

  const parsedUnits = formatUnits(usdcBalance, USDC_DECIMALS);

  if (Number(parsedUnits) < amountUsd) {
    throw new Error("Insufficient USDC balance");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/credits/coinbase",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountUsd,
        sender: address,
        chain_id: base.id, // only Base supported
      }),
    },
  );
  const responseJSON: OpenRouterTransferIntentResponse = await response.json();
  const {
    data: {
      web3_data: {
        transfer_intent: { call_data },
      },
    },
  } = responseJSON;

  console.error(responseJSON);

  // Generate transactions based off intent
  const atomicUnits =
    BigInt(call_data.recipient_amount) + BigInt(call_data.fee_amount);

  const approvalTxCalldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [
      responseJSON.data.web3_data.transfer_intent.metadata
        .contract_address as `0x${string}`,
      atomicUnits,
    ],
  });

  const transferTokenPreApprovedTxCalldata = encodeFunctionData({
    abi: COINBASE_COMMERCE_ABI,
    functionName: "transferTokenPreApproved",
    args: [
      {
        id: call_data.id as `0x${string}`,
        deadline: BigInt(
          Math.floor(new Date(call_data.deadline).getTime() / 1000),
        ),
        recipient: call_data.recipient as `0x${string}`,
        recipientAmount: BigInt(call_data.recipient_amount),
        recipientCurrency: call_data.recipient_currency as `0x${string}`,
        refundDestination: call_data.refund_destination as `0x${string}`,
        feeAmount: BigInt(call_data.fee_amount),
        operator: call_data.operator as `0x${string}`,
        signature: call_data.signature as `0x${string}`,
        prefix: call_data.prefix as `0x${string}`,
      },
    ],
  });

  const approval = await wallet.sendTransaction({
    to: USDC_ADDRESS,
    data: approvalTxCalldata,
    account: wallet.account as Account,
    chain: wallet.chain,
  });

  await waitForTransactionReceipt(wallet, {
    hash: approval,
  });

  const transfer = await wallet.sendTransaction({
    to: responseJSON.data.web3_data.transfer_intent.metadata
      .contract_address as `0x${string}`,
    data: transferTokenPreApprovedTxCalldata,
    account: wallet.account as Account,
    chain: wallet.chain,
  });

  const { transactionHash } = await waitForTransactionReceipt(wallet, {
    hash: transfer,
  });

  return transactionHash;
}
