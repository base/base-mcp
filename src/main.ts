import {
  AgentKit,
  basenameActionProvider,
  cdpApiActionProvider,
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
import { english, generateMnemonic } from 'viem/accounts';
import { base } from 'viem/chains';
import { Event, postMetric } from './analytics.js';
import { chainIdToCdpNetworkId, chainIdToChain } from './chains.js';
import { baseMcpContractActionProvider } from './tools/contracts/index.js';
import { baseMcpErc20ActionProvider } from './tools/erc20/index.js';
import { baseMcpMorphoActionProvider } from './tools/morpho/index.js';
import { baseMcpNftActionProvider } from './tools/nft/index.js';
import { baseMcpOnrampActionProvider } from './tools/onramp/index.js';
import { openRouterActionProvider } from './tools/open-router/index.js';
import {
  generateSessionId,
  getActionProvidersWithRequiredEnvVars,
} from './utils.js';
import { version } from './version.js';

export async function main() {
  dotenv.config();
  const apiKeyName =
    process.env.COINBASE_API_KEY_ID || process.env.COINBASE_API_KEY_NAME; // Previously, was called COINBASE_API_KEY_NAME
  const privateKey =
    process.env.COINBASE_API_SECRET || process.env.COINBASE_API_PRIVATE_KEY; // Previously, was called COINBASE_API_PRIVATE_KEY
  const seedPhrase = process.env.SEED_PHRASE;
  const fallbackPhrase = generateMnemonic(english, 256); // Fallback in case user wants read-only operations
  const chainId = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : base.id;

  if (!apiKeyName || !privateKey) {
    console.error(
      'Please set COINBASE_API_KEY_NAME and COINBASE_API_PRIVATE_KEY environment variables',
    );
    process.exit(1);
  }

  const sessionId = generateSessionId();

  postMetric(Event.Initialized, {}, sessionId);

  const chain = chainIdToChain(chainId);
  if (!chain) {
    throw new Error(
      `Unsupported chainId: ${chainId}. Only Base and Base Sepolia are supported.`,
    );
  }

  const cdpWalletProvider = await CdpWalletProvider.configureWithWallet({
    mnemonicPhrase: seedPhrase ?? fallbackPhrase,
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
      cdpApiActionProvider({
        apiKeyName,
        apiKeyPrivateKey: privateKey,
      }),
      ...getActionProvidersWithRequiredEnvVars(),

      // Base MCP Action Providers
      baseMcpMorphoActionProvider(),
      baseMcpContractActionProvider(),
      baseMcpOnrampActionProvider(),
      baseMcpErc20ActionProvider(),
      baseMcpNftActionProvider(),
      openRouterActionProvider(),
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
      tools,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      postMetric(Event.ToolUsed, { toolName: request.params.name }, sessionId);

      // In order for users to use AgentKit tools, they are required to have a SEED_PHRASE and not a ONE_TIME_KEY
      if (!seedPhrase) {
        return {
          content: [
            {
              type: 'text',
              text: 'ERROR: Please set SEED_PHRASE environment variable to use wallet-related operations',
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
