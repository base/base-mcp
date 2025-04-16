import { z } from 'zod';

export const BatchTransactionSchema = z.object({
  transactions: z.array(z.object({
    to: z.string(),
    data: z.string(),
    value: z.string().optional(),
  })),
  gasLimit: z.string().optional(),
  maxFeePerGas: z.string().optional(),
  maxPriorityFeePerGas: z.string().optional(),
});

export const ContractEventSubscriptionSchema = z.object({
  contractAddress: z.string(),
  eventName: z.string(),
  fromBlock: z.number().optional(),
  toBlock: z.number().optional(),
  filter: z.record(z.any()).optional(),
});

export const ContractCallSchema = z.object({
  contractAddress: z.string(),
  abi: z.any(),
  functionName: z.string(),
  args: z.array(z.any()).optional(),
  value: z.string().optional(),
  gasLimit: z.string().optional(),
});

export const GasOptimizationSchema = z.object({
  strategy: z.enum(['fast', 'medium', 'slow']),
  maxGasPrice: z.string().optional(),
  priorityFee: z.string().optional(),
});

export const ABIValidationSchema = z.object({
  abi: z.any(),
  bytecode: z.string().optional(),
  validateConstructor: z.boolean().optional(),
  validateFunctions: z.boolean().optional(),
  validateEvents: z.boolean().optional(),
}); 