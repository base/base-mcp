import { z } from 'zod';

export const CallContractSchema = z.object({
  contractAddress: z.string().describe('The address of the contract to call'),
  functionName: z.string().describe('The name of the function to call'),
  functionArgs: z
    .array(z.string())
    .describe('The arguments to pass to the function'),
  abi: z.string().describe('The ABI of the contract'),
  value: z
    .string()
    .describe('The value of ETH to send with the transaction')
    .optional(),
});
