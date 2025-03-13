import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callContractHandler, getMorphoVaultsHandler } from "./handlers.js";
import { Coinbase } from "@coinbase/coinbase-sdk";

const getMorphoVaultsTool: Tool = {
  name: "get_morpho_vaults",
  description: "Get the vaults for a given asset",
  inputSchema: {
    type: "object",
    properties: {
      assetSymbol: {
        type: "string",
        description: "Asset symbol by which to filter vaults",
      },
    },
  },
};

export type GetMorphoVaultsToolParams = {
  assetSymbol: string;
};

const callContractTool: Tool = {
  name: "call_contract",
  description: "Call a contract function",
  inputSchema: {
    type: "object",
    properties: {
      contractAddress: {
        type: "string",
        description: "The address of the contract to call",
      },
      functionName: {
        type: "string",
        description: "The name of the function to call",
      },
      functionArgs: {
        type: "array",
        description: "The arguments to pass to the function",
        items: {
          type: "string",
        },
      },
      abi: {
        type: "string",
        description: "The ABI of the contract",
      },
    },
  },
};

const getOnrampAssetsTool: Tool = {
  name: "get-onramp-assets",
  description:
    "Get the assets available for onramping in a given country / subdivision",
  inputSchema: {
    type: "object",
    properties: {
      country: {
        type: "string",
        description:
          "ISO 3166-1 two-digit country code string representing the purchasing user's country of residence, e.g., US.",
      },
      subdivision: {
        type: "string",
        description:
          "ISO 3166-2 two-digit country subdivision code representing the purchasing user's subdivision of residence within their country, e.g. NY. Required if the country=“US” because certain states (e.g., NY) have state specific asset restrictions.",
      },
    },
  },
};

const onrampTool: Tool = {
  name: "onramp",
  description: "Get a URL for onramping funds",
  inputSchema: {
    type: "object",
    properties: {
      amountUsd: {
        type: "number",
        description: "The amount of funds to onramp",
      },
      assetId: {
        type: "string",
        enum: Object.values(Coinbase.assets),
        description: "The asset ID to onramp",
      },
    },
  },
};

export const baseMcpTools: Tool[] = [
  getMorphoVaultsTool,
  callContractTool,
  getOnrampAssetsTool,
  onrampTool,
];

// biome-ignore lint/complexity/noBannedTypes: temp
export const toolToHandler: Record<string, Function> = {
  get_morpho_vaults: getMorphoVaultsHandler,
  call_contract: callContractHandler,
};
