import { z } from 'zod';

export const SimulateTransactionSchema = z.object({
  to: z.string().describe('The target contract or recipient address'),
  value: z
    .string()
    .optional()
    .describe('The amount of ETH to send in wei (default: 0)'),
  data: z
    .string()
    .optional()
    .describe('Raw calldata hex string (e.g. 0xa9059cbb...)'),
  abi: z
    .string()
    .optional()
    .describe(
      'ABI JSON string of the target contract (required when using functionName)',
    ),
  functionName: z
    .string()
    .optional()
    .describe(
      'The function to simulate (requires abi). If omitted, a raw call is performed using data.',
    ),
  args: z
    .array(z.string())
    .optional()
    .describe('Arguments for the function call (used with functionName)'),
});
