import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
import {
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  isAddress,
  parseUnits,
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import type { z } from 'zod';
import { chainIdToChain } from '../../chains.js';
import { constructBaseScanUrl } from '../utils/index.js';
import { Erc20BalanceSchema, Erc20TransferSchema } from './schemas.js';

export class BaseMcpErc20ActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super('baseMcpErc20', []);
  }

  @CreateAction({
    name: 'erc20_balance',
    description: 'Get the balance of an ERC20 token',
    schema: Erc20BalanceSchema,
  })
  async erc20Balance(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof Erc20BalanceSchema>,
  ) {
    const { contractAddress } = args;

    if (!isAddress(contractAddress, { strict: false })) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    const balance = await walletProvider.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [(walletProvider.getAddress() as `0x${string}`) ?? '0x'],
    });

    const decimals = await walletProvider.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    });

    return formatUnits(balance, decimals);
  }

  @CreateAction({
    name: 'erc20_transfer',
    description: 'Transfer an ERC20 token',
    schema: Erc20TransferSchema,
  })
  async erc20Transfer(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof Erc20TransferSchema>,
  ) {
    const { contractAddress, toAddress, amount } = args;

    if (!isAddress(contractAddress, { strict: false })) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    if (!isAddress(toAddress, { strict: false })) {
      throw new Error(`Invalid to address: ${toAddress}`);
    }

    const decimals = await walletProvider.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    });

    const atomicUnits = parseUnits(amount, decimals);

    const tx = await walletProvider.sendTransaction({
      to: contractAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [toAddress, atomicUnits],
      }),
    });

    const chain =
      chainIdToChain(walletProvider.getNetwork().chainId ?? base.id) ?? base;

    return JSON.stringify({
      hash: tx,
      url: constructBaseScanUrl(chain, tx),
    });
  }

  supportsNetwork(network: Network): boolean {
    return (
      network.chainId === String(base.id) ||
      network.chainId === String(baseSepolia.id)
    );
  }
}

export const baseMcpErc20ActionProvider = () =>
  new BaseMcpErc20ActionProvider();
