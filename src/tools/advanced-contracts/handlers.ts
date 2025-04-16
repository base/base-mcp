import { ethers } from 'ethers';
import { BaseProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { 
  BatchTransactionSchema,
  ContractEventSubscriptionSchema,
  ContractCallSchema,
  GasOptimizationSchema,
  ABIValidationSchema
} from './schemas.js';

export class AdvancedContractHandler {
  private provider: BaseProvider;
  private wallet: ethers.Wallet;

  constructor(provider: BaseProvider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
  }

  async executeBatchTransactions(params: typeof BatchTransactionSchema._type) {
    const { transactions, gasLimit, maxFeePerGas, maxPriorityFeePerGas } = params;
    
    // Prepare batch transaction
    const batchTx = await Promise.all(
      transactions.map(async (tx) => {
        const nonce = await this.wallet.getTransactionCount();
        return {
          ...tx,
          nonce,
          gasLimit: gasLimit || await this.estimateGas(tx),
          maxFeePerGas,
          maxPriorityFeePerGas,
        };
      })
    );

    // Execute batch transaction
    const batchReceipt = await this.wallet.sendTransaction(batchTx[0]);
    return batchReceipt;
  }

  async subscribeToContractEvents(params: typeof ContractEventSubscriptionSchema._type) {
    const { contractAddress, eventName } = params;
    
    const contract = new Contract(
      contractAddress,
      ['event ' + eventName],
      this.provider
    );

    return new Promise((resolve, reject) => {
      contract.on(eventName, (...args: unknown[]) => {
        resolve({ event: eventName, args });
      });

      // Set up error handling
      contract.on('error', (error: Error) => {
        reject(error);
      });
    });
  }

  async executeContractCall(params: typeof ContractCallSchema._type) {
    const { contractAddress, abi, functionName, args, value, gasLimit } = params;
    
    const contract = new Contract(contractAddress, abi, this.wallet);
    
    // Prepare transaction options
    const txOptions: Record<string, unknown> = {};
    if (value) txOptions.value = ethers.utils.parseEther(value);
    if (gasLimit) txOptions.gasLimit = ethers.BigNumber.from(gasLimit);

    // Execute contract call
    const tx = await contract[functionName](...(args || []), txOptions);
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  }

  async optimizeGas(params: typeof GasOptimizationSchema._type) {
    const { strategy, maxGasPrice } = params;
    
    const feeData = await this.provider.getFeeData();
    
    let gasPrice: ethers.BigNumber;
    switch (strategy) {
      case 'fast':
        gasPrice = feeData.maxFeePerGas || feeData.gasPrice || ethers.BigNumber.from(0);
        break;
      case 'medium':
        gasPrice = feeData.maxPriorityFeePerGas || feeData.gasPrice || ethers.BigNumber.from(0);
        break;
      case 'slow':
        gasPrice = feeData.gasPrice || ethers.BigNumber.from(0);
        break;
    }

    if (maxGasPrice) {
      const maxGas = ethers.utils.parseUnits(maxGasPrice, 'gwei');
      if (gasPrice.gt(maxGas)) {
        gasPrice = maxGas;
      }
    }

    return {
      gasPrice: gasPrice.toString(),
      strategy,
    };
  }

  async validateABI(params: typeof ABIValidationSchema._type) {
    const { abi, bytecode, validateConstructor, validateFunctions, validateEvents } = params;
    
    const validationResults = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
    };

    try {
      // Validate ABI structure
      if (!Array.isArray(abi)) {
        validationResults.isValid = false;
        validationResults.errors.push('ABI must be an array');
        return validationResults;
      }

      // Validate constructor if bytecode is provided
      if (validateConstructor && bytecode) {
        const constructorAbi = abi.find(item => item.type === 'constructor');
        if (!constructorAbi) {
          validationResults.warnings.push('No constructor found in ABI');
        }
      }

      // Validate functions
      if (validateFunctions) {
        const functions = abi.filter(item => item.type === 'function');
        for (const func of functions) {
          if (!func.name || !func.inputs || !func.outputs) {
            validationResults.errors.push(`Invalid function definition: ${func.name || 'unnamed'}`);
          }
        }
      }

      // Validate events
      if (validateEvents) {
        const events = abi.filter(item => item.type === 'event');
        for (const event of events) {
          if (!event.name || !event.inputs) {
            validationResults.errors.push(`Invalid event definition: ${event.name || 'unnamed'}`);
          }
        }
      }

      validationResults.isValid = validationResults.errors.length === 0;
      return validationResults;
    } catch (error: unknown) {
      validationResults.isValid = false;
      validationResults.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
      return validationResults;
    }
  }

  private async estimateGas(tx: Record<string, unknown>): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas(tx);
      return gasEstimate.toString();
    } catch (error: unknown) {
      throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 