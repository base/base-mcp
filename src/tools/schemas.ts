import { z } from "zod";

export const GetMorphoVaultsSchema = z
  .object({
    assetSymbol: z
      .string()
      .optional()
      .describe("Asset symbol by which to filter vaults"),
  })
  .strip()
  .describe("Get the list of vaults from Morpho");

export const CallContractSchema = z.object({
  contractAddress: z.string().describe("The address of the contract to call"),
  functionName: z.string().describe("The name of the function to call"),
  functionArgs: z
    .array(z.string())
    .describe("The arguments to pass to the function"),
  abi: z.string().describe("The ABI of the contract"),
  value: z
    .string()
    .optional()
    .describe("The value of ETH to send with the transaction"),
});

export const GetOnrampAssetsSchema = z.object({
  country: z.string().describe("The country to get onramp assets for"),
  subdivision: z
    .string()
    .optional()
    .describe(
      "The subdivision to get onramp assets for. To get accurate results for the US, you must also provide a subdivision.",
    ),
});

export const OnrampSchema = z.object({
  amountUsd: z.number().describe("The amount of funds to onramp"),
  assetId: z.string().describe("The asset ID to onramp"),
});
