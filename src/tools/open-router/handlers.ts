import {
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  type Account,
  type PublicActions,
  type WalletClient,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { base } from 'viem/chains';
import type { z } from 'zod';
import { USDC_ADDRESS, USDC_DECIMALS } from '../../lib/constants.js';
import { COINBASE_COMMERCE_ABI } from '../../lib/contracts/coinbase-commerce.js';
import type { OpenRouterTransferIntentResponse } from '../types.js';
import {
  checkToolSupportsChain,
  constructBaseScanUrl,
} from '../utils/index.js';
import type { BuyOpenRouterCreditsSchema } from './schemas.js';

export async function buyOpenRouterCreditsHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof BuyOpenRouterCreditsSchema>,
): Promise<string> {
  const { amountUsd } = args;

  checkToolSupportsChain({
    chainId: wallet.chain?.id,
    supportedChains: [base],
  });

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const address = wallet.account?.address;

  if (!address) {
    throw new Error('No address found');
  }

  // Ensure user has enough USDC for txn
  const usdcBalance = await wallet.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  });

  const parsedUnits = formatUnits(usdcBalance, USDC_DECIMALS);

  if (Number(parsedUnits) < amountUsd) {
    throw new Error('Insufficient USDC balance');
  }

  const response = await fetch(
    'https://openrouter.ai/api/v1/credits/coinbase',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountUsd,
        sender: address,
        chain_id: base.id, // only Base supported
      }),
    },
  );
  const responseJSON: OpenRouterTransferIntentResponse = await response.json();
  const {
    data: {
      web3_data: {
        transfer_intent: { call_data },
      },
    },
  } = responseJSON;

  console.error(responseJSON);

  // Generate transactions based off intent
  const atomicUnits =
    BigInt(call_data.recipient_amount) + BigInt(call_data.fee_amount);

  const approvalTxCalldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [
      responseJSON.data.web3_data.transfer_intent.metadata
        .contract_address as `0x${string}`,
      atomicUnits,
    ],
  });

  const transferTokenPreApprovedTxCalldata = encodeFunctionData({
    abi: COINBASE_COMMERCE_ABI,
    functionName: 'transferTokenPreApproved',
    args: [
      {
        id: call_data.id as `0x${string}`,
        deadline: BigInt(
          Math.floor(new Date(call_data.deadline).getTime() / 1000),
        ),
        recipient: call_data.recipient as `0x${string}`,
        recipientAmount: BigInt(call_data.recipient_amount),
        recipientCurrency: call_data.recipient_currency as `0x${string}`,
        refundDestination: call_data.refund_destination as `0x${string}`,
        feeAmount: BigInt(call_data.fee_amount),
        operator: call_data.operator as `0x${string}`,
        signature: call_data.signature as `0x${string}`,
        prefix: call_data.prefix as `0x${string}`,
      },
    ],
  });

  const approval = await wallet.sendTransaction({
    to: USDC_ADDRESS,
    data: approvalTxCalldata,
    account: wallet.account as Account,
    chain: wallet.chain,
  });

  await waitForTransactionReceipt(wallet, {
    hash: approval,
  });

  const transfer = await wallet.sendTransaction({
    to: responseJSON.data.web3_data.transfer_intent.metadata
      .contract_address as `0x${string}`,
    data: transferTokenPreApprovedTxCalldata,
    account: wallet.account as Account,
    chain: wallet.chain,
  });

  const { transactionHash } = await waitForTransactionReceipt(wallet, {
    hash: transfer,
  });

  return JSON.stringify({
    hash: transactionHash,
    url: constructBaseScanUrl(wallet.chain ?? base, transactionHash),
  });
}
