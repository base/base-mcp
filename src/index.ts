import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { version } from "./version.js";
import * as dotenv from "dotenv";
import type { DeployContractParams, TransferFundsParams } from "./types.js";
import { tools } from "./tools/index.js";

async function main() {
  dotenv.config();
  const apiKeyName = process.env.COINBASE_API_KEY_NAME;
  const privateKey = process.env.COINBASE_API_PRIVATE_KEY;
  const seedPhrase = process.env.SEED_PHRASE;

  if (!apiKeyName || !privateKey || !seedPhrase) {
    console.error(
      "Please set COINBASE_API_KEY_NAME, COINBASE_API_PRIVATE_KEY, and SEED_PHRASE environment variables",
    );
    process.exit(1);
  }

  const server = new Server(
    {
      name: "Base MCP Server",
      version,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  Coinbase.configure({ apiKeyName, privateKey });

  // Initialize wallet with seed phrase
  const wallet = await Wallet.import({
    mnemonicPhrase: seedPhrase,
    networkId: "base-sepolia",
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    console.error("Received CallToolRequest:", request);

    try {
      switch (request.params.name) {
        case "get-address": {
          const address = await wallet.getDefaultAddress();

          return {
            content: [{ type: "text", text: address.getId() }],
          };
        }

        case "get-testnet-eth": {
          const network = wallet.getNetworkId();
          if (network !== "base-sepolia") {
            throw new Error("Network is not base-sepolia");
          }

          const faucet = await wallet.faucet();

          return {
            content: [
              {
                type: "text",
                text: `Faucet request sent: ${faucet.getTransactionHash()}`,
              },
            ],
          };
        }

        case "transfer-funds": {
          const { destination, assetId, amount } = request.params
            .arguments as unknown as TransferFundsParams;

          const transfer = await wallet.createTransfer({
            destination,
            amount,
            assetId,
          });

          await transfer.wait();

          return {
            content: [
              {
                type: "text",
                text: transfer.toString(),
              },
            ],
          };
        }

        case "list-balances": {
          const balances = await wallet.listBalances();
          console.error(" balances:", balances);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(Object.fromEntries(balances)),
              },
            ],
          };
        }

        case "deploy-contract": {
          const {
            constructorArgs,
            contractName,
            solidityInputJson,
            solidityVersion,
          } = request.params.arguments as unknown as DeployContractParams;

          console.error("constructorArgs:", constructorArgs);
          console.error("contractName:", contractName);
          console.error("solidityInputJson:", solidityInputJson);
          console.error("solidityVersion:", solidityVersion);

          try {
            const contract = await wallet.deployContract({
              constructorArgs,
              contractName,
              solidityInputJson,
              solidityVersion,
            });

            await contract.wait();

            return {
              content: [
                {
                  type: "text",
                  text: contract.toString(),
                },
              ],
            };
          } catch (error) {
            console.error("Error deploying contract:", error);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    error:
                      error instanceof Error ? error.message : String(error),
                  }),
                },
              ],
            };
          }
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      console.error("Error calling tool:", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            }),
          },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);
  console.error("Base MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
