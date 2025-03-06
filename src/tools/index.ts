import { Coinbase } from "@coinbase/coinbase-sdk";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

// Tool definitions
const getAddressTool: Tool = {
  name: "get-address",
  description: "Get the address for the wallet",
  inputSchema: {
    type: "object",
  },
};

const getTestnetEthTool: Tool = {
  name: "get-testnet-eth",
  description:
    "Get the testnet ETH balance for the wallet. Can only be called on Base Sepolia",
  inputSchema: {
    type: "object",
  },
};

const listBalancesTool: Tool = {
  name: "list-balances",
  description: "List all balances for a wallet",
  inputSchema: {
    type: "object",
  },
};

const transferFundsTool: Tool = {
  name: "transfer-funds",
  description: "Transfer funds from one wallet to another",
  inputSchema: {
    type: "object",
    properties: {
      destination: {
        type: "string",
        description: "The address to which to transfer funds",
      },
      assetId: {
        type: "string",
        enum: Object.values(Coinbase.assets),
        description: "The asset ID to transfer",
      },
      amount: {
        type: "number",
        description: "The amount of funds to transfer",
      },
    },
  },
};

const deployContractTool: Tool = {
  name: "deploy-contract",
  description: "Deploy a contract",
  inputSchema: {
    type: "object",
    properties: {
      constructorArgs: {
        type: "array",
        description: "The arguments for the contract constructor",
        items: {
          type: "string",
        },
      },
      contractName: {
        type: "string",
        description: "The name of the contract to deploy",
      },
      solidityInputJson: {
        type: "string",
        description:
          "The JSON input for the Solidity compiler containing contract source and settings",
      },
      solidityVersion: {
        type: "string",
        description: "The version of the solidity compiler",
      },
    },
  },
};

export const tools = [
  getAddressTool,
  getTestnetEthTool,
  listBalancesTool,
  transferFundsTool,
  deployContractTool,
];
