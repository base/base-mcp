import {
  erc721Abi,
  isAddress,
  type PublicActions,
  type WalletClient,
} from 'viem';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { constructBaseScanUrl } from '../utils/index.js';
import { Erc721BalanceSchema, Erc721TransferSchema } from './schemas.js';

export async function erc721BalanceHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof Erc721BalanceSchema>,
): Promise<string> {
  const { contractAddress } = args;

  if (!isAddress(contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  const balance = await wallet.readContract({
    address: contractAddress,
    abi: erc721Abi,
    functionName: 'balanceOf',
    args: [wallet.account?.address ?? '0x'],
  });

  return balance.toString();
}

export async function erc721TransferHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof Erc721TransferSchema>,
): Promise<string> {
  const { contractAddress, toAddress, tokenId } = args;

  if (!isAddress(contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  if (!isAddress(toAddress, { strict: false })) {
    throw new Error(`Invalid to address: ${toAddress}`);
  }

  const tx = await wallet.simulateContract({
    address: contractAddress,
    abi: erc721Abi,
    functionName: 'transferFrom',
    args: [wallet.account?.address ?? '0x', toAddress, BigInt(tokenId)],
    account: wallet.account,
    chain: wallet.chain,
  });

  const txHash = await wallet.writeContract(tx.request);

  return JSON.stringify({
    hash: txHash,
    url: constructBaseScanUrl(wallet.chain ?? base, txHash),
  });
} 