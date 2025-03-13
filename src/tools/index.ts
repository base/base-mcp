import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callContractHandler, getMorphoVaultsHandler } from "./handlers.js";

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

export const baseMcpTools: Tool[] = [getMorphoVaultsTool, callContractTool];

// biome-ignore lint/complexity/noBannedTypes: temp
export const toolToHandler: Record<string, Function> = {
  get_morpho_vaults: getMorphoVaultsHandler,
  call_contract: callContractHandler,
};
