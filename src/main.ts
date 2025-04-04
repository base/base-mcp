import {
  AgentKit,
  basenameActionProvider,
  cdpWalletActionProvider,
  CdpWalletProvider,
  morphoActionProvider,
  walletActionProvider,
} from '@coinbase/agentkit';
import { getMcpTools } from '@coinbase/agentkit-model-context-protocol';
import { Coinbase } from '@coinbase/coinbase-sdk';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import {
  createWalletClient,
  http,
  publicActions,
  type PublicActions,
  type WalletClient,
} from 'viem';
import { mnemonicToAccount } from 'viem/accounts';
import { hashkeyTestnet } from 'viem/chains';
import { chainIdToCdpNetworkId, chainIdToChain } from './chains.js';
import { baseMcpTools, toolToHandler } from './tools/index.js';
import { version } from './version.js';

export async function main() {
  dotenv.config();
  const apiKeyName =
    process.env.COINBASE_API_KEY_ID || process.env.COINBASE_API_KEY_NAME; // Previously, was called COINBASE_API_KEY_NAME
  const privateKey =
    process.env.COINBASE_API_SECRET || process.env.COINBASE_API_PRIVATE_KEY; // Previously, was called COINBASE_API_PRIVATE_KEY
  const seedPhrase = process.env.SEED_PHRASE;
  const chainId = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : hashkeyTestnet.id;

  // TODO: stricter checks for required env vars with better error messaging
  if (!apiKeyName || !privateKey || !seedPhrase) {
    console.error(
      'Please set COINBASE_API_KEY_NAME, COINBASE_API_PRIVATE_KEY, and SEED_PHRASE environment variables',
    );
    process.exit(1);
  }

  const chain = chainIdToChain(chainId);
  if (!chain) {
    throw new Error(
      `Unsupported chainId: ${chainId}. Only Base and Base Sepolia are supported.`,
    );
  }

  const viemClient = createWalletClient({
    account: mnemonicToAccount(seedPhrase),
    chain,
    transport: http(),
  }).extend(publicActions) as WalletClient & PublicActions;

  console.log(apiKeyName, 'apiKeyName');
  console.log(privateKey, 'privateKey');
  console.log(chainId, 'chainId');
  const cdpWalletProvider = await CdpWalletProvider.configureWithWallet({
    mnemonicPhrase: seedPhrase,
    apiKeyName,
    apiKeyPrivateKey: privateKey,
    networkId: chainIdToCdpNetworkId[chainId],
  });

  const agentKit = await AgentKit.from({
    cdpApiKeyName: apiKeyName,
    cdpApiKeyPrivateKey: privateKey,
    walletProvider: cdpWalletProvider,
    actionProviders: [
      basenameActionProvider(),
      morphoActionProvider(),
      walletActionProvider(),
      cdpWalletActionProvider({
        apiKeyName,
        apiKeyPrivateKey: privateKey,
      }),
    ],
  });

  const { tools, toolHandler } = await getMcpTools(agentKit);

  const server = new Server(
    {
      name: 'Base MCP Server',
      version,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  Coinbase.configure({
    apiKeyName,
    privateKey,
    source: 'Base MCP',
    sourceVersion: version,
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('Received ListToolsRequest');
    return {
      tools: [...baseMcpTools.map((tool) => tool.definition), ...tools],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      // Check if the tool is Base MCP tool
      const isBaseMcpTool = baseMcpTools.some(
        (tool) => tool.definition.name === request.params.name,
      );

      if (isBaseMcpTool) {
        const tool = toolToHandler[request.params.name];
        if (!tool) {
          throw new Error(`Tool ${request.params.name} not found`);
        }

        const result = await tool(viemClient, request.params.arguments);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }

      return toolHandler(request.params.name, request.params.arguments);
    } catch (error) {
      throw new Error(`Tool ${request.params.name} failed: ${error}`);
    }
  });

  const transport = new StdioServerTransport();
  console.error('Connecting server to transport...');
  await server.connect(transport);

  console.error('Base MCP Server running on stdio');
}
