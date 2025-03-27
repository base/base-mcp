import { callContractTool } from './contracts/index.js';
import { erc20BalanceTool, erc20TransferTool } from './erc20/index.js';
import { getMorphoVaultsTool } from './morpho/index.js';
import { analyzeNftCollectionTool, mintNftTool } from './nft/index.js';
import { getOnrampAssetsTool, onrampTool } from './onramp/index.js';
import { buyOpenRouterCreditsTool } from './open-router/index.js';
import type { ToolHandler, ToolWithHandler } from './types.js';
import {
  createProposalTool,
  getProposalsTool,
  getProposalDetailsTool,
  castVoteTool,
  createDaoTool
} from "./dao/index.js";

export const baseMcpTools: ToolWithHandler[] = [
  getMorphoVaultsTool,
  callContractTool,
  getOnrampAssetsTool,
  onrampTool,
  erc20BalanceTool,
  erc20TransferTool,
  buyOpenRouterCreditsTool,
  analyzeNftCollectionTool,
  mintNftTool,
  createProposalTool,
  getProposalsTool,
  getProposalDetailsTool,
  castVoteTool,
  createDaoTool,
];

export const toolToHandler: Record<string, ToolHandler> = baseMcpTools.reduce<
  Record<string, ToolHandler>
>((acc, tool) => {
  acc[tool.definition.name] = tool.handler;
  return acc;
}, {});
