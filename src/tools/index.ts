import { farcasterUsernameTool } from './farcaster/index.js';
import { buyOpenRouterCreditsTool } from './open-router/index.js';
import type { ToolHandler, ToolWithHandler } from './types.js';

export const baseMcpTools: ToolWithHandler[] = [
  buyOpenRouterCreditsTool,
  farcasterUsernameTool,
];

export const toolToHandler: Record<string, ToolHandler> = baseMcpTools.reduce<
  Record<string, ToolHandler>
>((acc, tool) => {
  acc[tool.definition.name] = tool.handler;
  return acc;
}, {});
