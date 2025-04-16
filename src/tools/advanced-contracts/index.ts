import { Tool } from '../types';
import { AdvancedContractHandler } from './handlers';
import {
  BatchTransactionSchema,
  ContractEventSubscriptionSchema,
  ContractCallSchema,
  GasOptimizationSchema,
  ABIValidationSchema
} from './schemas';

export const advancedContractTools: Tool[] = [
  {
    name: 'execute-batch-transactions',
    description: 'Execute multiple transactions in a batch with optimized gas usage',
    parameters: BatchTransactionSchema,
    handler: async (params, context) => {
      const handler = new AdvancedContractHandler(context.provider, context.wallet);
      return await handler.executeBatchTransactions(params);
    }
  },
  {
    name: 'subscribe-contract-events',
    description: 'Subscribe to contract events with filtering capabilities',
    parameters: ContractEventSubscriptionSchema,
    handler: async (params, context) => {
      const handler = new AdvancedContractHandler(context.provider, context.wallet);
      return await handler.subscribeToContractEvents(params);
    }
  },
  {
    name: 'execute-contract-call',
    description: 'Execute a contract call with advanced options and gas optimization',
    parameters: ContractCallSchema,
    handler: async (params, context) => {
      const handler = new AdvancedContractHandler(context.provider, context.wallet);
      return await handler.executeContractCall(params);
    }
  },
  {
    name: 'optimize-gas',
    description: 'Optimize gas usage based on different strategies',
    parameters: GasOptimizationSchema,
    handler: async (params, context) => {
      const handler = new AdvancedContractHandler(context.provider, context.wallet);
      return await handler.optimizeGas(params);
    }
  },
  {
    name: 'validate-abi',
    description: 'Validate contract ABI with comprehensive checks',
    parameters: ABIValidationSchema,
    handler: async (params, context) => {
      const handler = new AdvancedContractHandler(context.provider, context.wallet);
      return await handler.validateABI(params);
    }
  }
]; 