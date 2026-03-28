import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
import {
  createPublicClient,
  encodeFunctionData,
  http,
  isAddress,
  type Abi,
  type Hex,
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import type { z } from 'zod';
import { chainIdToChain } from '../../chains.js';
import { SimulateTransactionSchema } from './schemas.js';

export class BaseMcpSimulateActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super('baseMcpSimulate', []);
  }

  @CreateAction({
    name: 'simulate_transaction',
    description:
      'Simulate a transaction without broadcasting it. Returns the expected result, gas estimate, and whether it would revert. Useful for previewing contract calls or ETH transfers before execution.',
    schema: SimulateTransactionSchema,
  })
  async simulateTransaction(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof SimulateTransactionSchema>,
  ) {
    const { to, value, data, abi, functionName, args: fnArgs } = args;

    if (!isAddress(to, { strict: false })) {
      throw new Error(`Invalid target address: ${to}`);
    }

    if (functionName && !abi) {
      throw new Error(
        'abi is required when functionName is provided. Pass the contract ABI as a JSON string.',
      );
    }

    if (abi && !functionName) {
      throw new Error(
        'functionName is required when abi is provided. Specify which function to simulate.',
      );
    }

    let txValue: bigint;
    try {
      txValue = value ? BigInt(value) : 0n;
    } catch {
      throw new Error(
        `Invalid value: "${value}" is not a valid wei amount. Must be a numeric string.`,
      );
    }

    const account = walletProvider.getAddress() as `0x${string}`;
    const chainId = Number(walletProvider.getNetwork().chainId ?? base.id);
    const chain = chainIdToChain(chainId);

    if (!chain) {
      throw new Error(
        `Unsupported chainId: ${chainId}. Only Base and Base Sepolia are supported.`,
      );
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    try {
      if (abi && functionName) {
        let parsedAbi: Abi;
        try {
          parsedAbi = JSON.parse(abi) as Abi;
        } catch {
          throw new Error('Invalid ABI: could not parse JSON');
        }

        const { result } = await publicClient.simulateContract({
          address: to as `0x${string}`,
          abi: parsedAbi,
          functionName,
          args: fnArgs ?? [],
          account,
          value: txValue,
        });

        let gasEstimate: string | undefined;
        try {
          const gas = await publicClient.estimateGas({
            to: to as `0x${string}`,
            data: encodeFunctionData({
              abi: parsedAbi,
              functionName,
              args: fnArgs ?? [],
            }),
            value: txValue,
            account,
          });
          gasEstimate = gas.toString();
        } catch {
          // Simulation succeeded but gas estimation failed — still report the result
        }

        return JSON.stringify({
          success: true,
          ...(gasEstimate && { gasEstimate }),
          result: String(result),
        });
      }

      // Raw call (plain ETH transfer or pre-encoded calldata)
      const callParams = {
        to: to as `0x${string}`,
        data: data ? (data as Hex) : undefined,
        value: txValue,
        account,
      };

      const callResult: { data?: Hex } = await publicClient.call(callParams);

      let gasEstimate: string | undefined;
      try {
        const gas = await publicClient.estimateGas(callParams);
        gasEstimate = gas.toString();
      } catch {
        // Call succeeded but gas estimation failed — still report the result
      }

      return JSON.stringify({
        success: true,
        ...(gasEstimate && { gasEstimate }),
        result: callResult.data ?? '0x',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error during simulation';
      return JSON.stringify({
        success: false,
        error: message,
      });
    }
  }

  supportsNetwork(network: Network): boolean {
    return (
      network.chainId === String(base.id) ||
      network.chainId === String(baseSepolia.id)
    );
  }
}

export const baseMcpSimulateActionProvider = () =>
  new BaseMcpSimulateActionProvider();
