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
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import type { z } from 'zod';
import { chainIdToChain } from '../../chains.js';
import { SimulateTransactionSchema } from './schemas.js';

function constructBaseScanAddressUrl(chainId: number, address: string): string {
  if (chainId === baseSepolia.id) {
    return `https://sepolia.basescan.org/address/${address}`;
  }
  return `https://basescan.org/address/${address}`;
}

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

    const txValue = value ? BigInt(value) : 0n;
    const basescanUrl = constructBaseScanAddressUrl(chain.id, to);

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

        const encodedData = encodeFunctionData({
          abi: parsedAbi,
          functionName,
          args: fnArgs ?? [],
        });

        const gasEstimate = await publicClient.estimateGas({
          to: to as `0x${string}`,
          data: encodedData,
          value: txValue,
          account,
        });

        return JSON.stringify({
          success: true,
          gasEstimate: gasEstimate.toString(),
          result: String(result),
          basescanUrl,
        });
      }

      // Raw call (plain ETH transfer or pre-encoded calldata)
      const callParams = {
        to: to as `0x${string}`,
        data: data ? (data as `0x${string}`) : undefined,
        value: txValue,
        account,
      };

      const callResult = await publicClient.call(callParams);
      const gasEstimate = await publicClient.estimateGas(callParams);

      return JSON.stringify({
        success: true,
        gasEstimate: gasEstimate.toString(),
        result: (callResult as { data?: string }).data ?? '0x',
        basescanUrl,
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
