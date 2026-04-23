import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
import {
  encodeFunctionData,
  isAddress,
  type Abi,
  type AbiFunction,
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import type { z } from 'zod';
import { chainIdToChain } from '../../chains.js';
import { constructBaseScanUrl } from '../utils/index.js';
import { CallContractSchema } from './schemas.js';

export class BaseMcpContractActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super('baseMcpContract', []);
  }

  @CreateAction({
    name: 'call_contract',
    description: 'Call a contract function',
    schema: CallContractSchema,
  })
  async callContract(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof CallContractSchema>,
  ) {
    let abi: Abi;
    try {
      abi = JSON.parse(args.abi) as Abi;
    } catch (error) {
      throw new Error(`Invalid ABI: ${error}`);
    }

    if (!Array.isArray(abi)) {
      throw new Error('Invalid ABI: expected a JSON array of ABI items');
    }

    if (!isAddress(args.contractAddress, { strict: false })) {
      throw new Error(`Invalid contract address: ${args.contractAddress}`);
    }

    const functionAbi = abi.find(
      (item) => 'name' in item && item.name === args.functionName,
    ) as AbiFunction | undefined;

    if (!functionAbi) {
      throw new Error(
        `Function "${args.functionName}" not found in the provided ABI`,
      );
    }

    const chain = chainIdToChain(Number(walletProvider.getNetwork().chainId));
    if (!chain) {
      throw new Error(
        `Unsupported chainId: ${walletProvider.getNetwork().chainId}`,
      );
    }

    if (
      functionAbi.stateMutability === 'view' ||
      functionAbi.stateMutability === 'pure'
    ) {
      const tx = await walletProvider.readContract({
        address: args.contractAddress,
        abi,
        functionName: args.functionName,
        args: args.functionArgs,
      });

      return String(tx);
    }

    const tx = await walletProvider.sendTransaction({
      to: args.contractAddress,
      data: encodeFunctionData({
        abi,
        functionName: args.functionName,
        args: args.functionArgs,
      }),
      value: BigInt(args.value ?? 0),
    });

    const link = constructBaseScanUrl(chain, tx);

    return JSON.stringify({
      hash: tx,
      url: link,
    });
  }

  supportsNetwork(network: Network): boolean {
    return (
      network.chainId === String(base.id) ||
      network.chainId === String(baseSepolia.id)
    );
  }
}

export const baseMcpContractActionProvider = () =>
  new BaseMcpContractActionProvider();
