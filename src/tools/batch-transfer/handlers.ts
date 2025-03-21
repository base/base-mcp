import type { PublicActions, WalletClient } from 'viem';
import type { z } from 'zod';
import { BatchTransferSchema } from './schemas.js';
import { mainnet } from 'viem/chains';

export async function batchTransferHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof BatchTransferSchema>,
): Promise<string> {
  const { tokenAddress, recipients } = args;

  try {
    // Check if the wallet account address exists
    const accountAddress = wallet.account?.address;
    if (!accountAddress) {
      throw new Error("No wallet account address found. Please ensure your wallet is connected.");
    }

    const erc20Abi = [
      {
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ];

    const transactions = await Promise.all(
      recipients.map(async ({ address, amount }) => {
        const txHash = await wallet.writeContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [address, BigInt(amount)], 
          chain: mainnet, 
          account: accountAddress, 
        });

        return { address, amount, txHash };
      })
    );

    return JSON.stringify({
      message: 'Batch transfer completed',
      transactions,
    });
  } catch (error) {
    return JSON.stringify({ error: (error as Error).message });
  }
}
