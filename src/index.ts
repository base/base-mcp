import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { version } from "./version.js";
import * as dotenv from "dotenv";
import type {
  DeployContractParams,
  DeployMultiTokenParams,
  DeployNftParams,
  DeployTokenParams,
  GetOnrampConfigParams,
  OnrampParams,
  PatchedOnrampConfigResponseData,
  TradeParams,
  TransferFundsParams,
} from "./tools/types.js";
import { tools } from "./tools/index.js";
import { getOnrampBuyUrl } from "@coinbase/onchainkit/fund";

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
  const wallet = await Wallet.import(
    {
      mnemonicPhrase: seedPhrase,
      network_id: Coinbase.networks.BaseMainnet, // ignored
      networkId: Coinbase.networks.BaseMainnet, // also ignored
    },
    Coinbase.networks.BaseMainnet,
  );

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

        case "deploy-nft": {
          const { name, symbol, baseURI } = request.params
            .arguments as unknown as unknown as DeployNftParams;

          const nft = await wallet.deployNFT({
            baseURI,
            name,
            symbol,
          });

          await nft.wait();

          return {
            content: [
              {
                type: "text",
                text: nft.toString(),
              },
            ],
          };
        }

        case "deploy-token": {
          const { name, symbol, totalSupply } = request.params
            .arguments as unknown as DeployTokenParams;

          const token = await wallet.deployToken({
            name,
            symbol,
            totalSupply,
          });

          await token.wait();

          return {
            content: [
              {
                type: "text",
                text: token.toString(),
              },
            ],
          };
        }

        case "deploy-multi-token": {
          const { uri } = request.params
            .arguments as unknown as DeployMultiTokenParams;

          const tokens = await wallet.deployMultiToken({
            uri,
          });

          return {
            content: [
              {
                type: "text",
                text: tokens.toString(),
              },
            ],
          };
        }

        case "get-onramp-assets": {
          const { country, subdivision } = request.params
            .arguments as unknown as GetOnrampConfigParams;

          const config: PatchedOnrampConfigResponseData = await fetch(
            `https://api.developer.coinbase.com/onramp/v1/buy/options?country=${country}&subdivision=${subdivision}&networks=base`,
            {
              headers: {
                Authorization: `Bearer ${process.env.COINBASE_PUBLIC_API_KEY}`,
              },
            },
          ).then((res) => res.json());

          console.error("config:", config);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(config.purchase_currencies),
              },
            ],
          };
        }

        case "onramp": {
          const { amountUsd, assetId } = request.params
            .arguments as unknown as OnrampParams;

          const address = (await wallet.getDefaultAddress()).getId();

          if (!process.env.COINBASE_PROJECT_ID) {
            throw new Error("COINBASE_PROJECT_ID is not set");
          }

          const onrampUrl = getOnrampBuyUrl({
            projectId: process.env.COINBASE_PROJECT_ID,
            addresses: { [address]: ["base"] }, // Onramp only available on Base
            assets: [assetId],
            presetFiatAmount: amountUsd,
            fiatCurrency: "USD",
            redirectUrl: "",
          });

          return {
            content: [
              {
                type: "text",
                text: onrampUrl,
              },
            ],
          };
        }

        case "trade": {
          const { amount, fromAssetId, toAssetId } = request.params
            .arguments as unknown as TradeParams;

          const trade = await wallet.createTrade({
            amount,
            fromAssetId,
            toAssetId,
          });

          await trade.wait();

          return {
            content: [
              {
                type: "text",
                text: trade.toString(),
              },
            ],
          };
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
