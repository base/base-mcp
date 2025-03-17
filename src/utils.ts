import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { WalletClient } from 'viem';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ToolHandler } from './tools/types.js';

type GenerateToolParams = {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  toolHandler: ToolHandler;
};

function simplifySchema(schema: any): any {
  const result = { ...schema };
  delete result.$schema;
  delete result.$ref;
  delete result.definitions;

  return result;
}

export function generateTool({
  name,
  description,
  inputSchema: zodSchema,
  toolHandler,
}: GenerateToolParams): {
  definition: Tool;
  handler: ToolHandler;
} {
  const rawSchema = zodToJsonSchema(zodSchema);
  const inputSchema = simplifySchema(rawSchema);

  return {
    definition: {
      name,
      description,
      inputSchema,
    },
    handler: toolHandler,
  };
}
