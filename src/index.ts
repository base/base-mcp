import { Coinbase } from "@coinbase/coinbase-sdk";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { version } from "./version.js";
import * as dotenv from "dotenv";
import {
  AgentKit,
  basenameActionProvider,
  compoundActionProvider,
  erc20ActionProvider,
  erc721ActionProvider,
  // farcasterActionProvider, - requires API key
  moonwellActionProvider,
  morphoActionProvider,
  // openseaActionProvider, - requires API key
  pythActionProvider,
  ViemWalletProvider,
  walletActionProvider,
  wethActionProvider,
  wowActionProvider,
} from "@coinbase/agentkit";
import { getMcpTools } from "@coinbase/agentkit-model-context-protocol";
import { mnemonicToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createWalletClient, http } from "viem";
import { baseMcpActionProvider } from "./action-providers/baseMcp/baseMcpActionProvider.js";

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

  const viemWalletProvider = createWalletClient({
    account: mnemonicToAccount(seedPhrase),
    chain: baseSepolia,
    transport: http(),
  });

  const agentKit = await AgentKit.from({
    cdpApiKeyName: apiKeyName,
    cdpApiKeyPrivateKey: privateKey,
    walletProvider: new ViemWalletProvider(viemWalletProvider),
    actionProviders: [
      walletActionProvider(),
      erc20ActionProvider(),
      erc721ActionProvider(),
      basenameActionProvider(),
      // cdpApiActionProvider(),
      compoundActionProvider(),
      // farcasterActionProvider(),
      moonwellActionProvider(),
      morphoActionProvider(),
      // openseaActionProvider(),
      wethActionProvider(),
      pythActionProvider(),
      wowActionProvider(),
      baseMcpActionProvider(),
    ],
  });

  const { tools, toolHandler } = await getMcpTools(agentKit);

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

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      return toolHandler(request.params.name, request.params.arguments);
    } catch (error) {
      throw new Error(`Tool ${name} failed: ${error}`);
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
