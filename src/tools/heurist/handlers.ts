import {
  erc20Abi,
  formatUnits,
  parseUnits,
  type PublicActions,
  type WalletClient,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { base } from 'viem/chains';
import type { z } from 'zod';
import {
  checkToolSupportsChain,
  constructBaseScanUrl,
} from '../utils/index.js';
import { BuyHeuristCreditsSchema, MINIMUM_AMOUNTS, SUPPORTED_TOKENS } from './schemas.js';

// Heurist Contract ABI (partial, just what we need)
const HEURIST_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'creditedAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'purchaseCredits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      }
    ],
    name: 'isAcceptedToken',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      }
    ],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

// Heurist contract address on Base
const HEURIST_CONTRACT_ADDRESS = '0x59d944b7ff8c432ff395683f5c95d97ca0237986' as const;

// Token decimals mapping
const TOKEN_DECIMALS = {
  USDC: 6,  // USDC typically has 6 decimals
  HEU: 18,  // HEU has 18 decimals (standard ERC20)
  WETH: 18, // WETH has 18 decimals
} as const;

export async function buyHeuristCreditsHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof BuyHeuristCreditsSchema>,
): Promise<string> {
  const { tokenSymbol, amount } = args;

  // Check if we're on Base chain
  checkToolSupportsChain({
    chainId: wallet.chain?.id,
    supportedChains: [base],
  });

  const address = wallet.account?.address;
  if (!address) {
    throw new Error('No wallet address found');
  }

  // Get token address
  const tokenAddress = SUPPORTED_TOKENS[tokenSymbol];
  const decimals = TOKEN_DECIMALS[tokenSymbol];
  
  // Check if the token is accepted by the contract
  let isTokenAccepted = false;
  try {
    isTokenAccepted = await wallet.readContract({
      address: HEURIST_CONTRACT_ADDRESS,
      abi: HEURIST_CONTRACT_ABI,
      functionName: 'isAcceptedToken',
      args: [tokenAddress],
    });
  } catch {
    // Silently continue - will fail later if token is not accepted
  }

  if (isTokenAccepted === false) {
    // We got a valid response that the token is not accepted
    throw new Error(`${tokenSymbol} (${tokenAddress}) is not currently accepted by the Heurist contract. Please try another token.`);
  }
  
  // For small amounts, ensure they meet minimum requirements
  // The contract might have minimum purchase amounts
  let adjustedAmount = amount;
  const minimumAmount = MINIMUM_AMOUNTS[tokenSymbol];
  
  if (amount < minimumAmount) {
    adjustedAmount = minimumAmount;
    // Silently adjust the amount to meet minimum requirements
  }
  
  // Convert amount to token units
  const amountInTokenUnits = parseUnits(adjustedAmount.toString(), decimals);

  // Check user's token balance
  const tokenBalance = await wallet.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  });

  if (tokenBalance < amountInTokenUnits) {
    const formattedBalance = formatUnits(tokenBalance, decimals);
    throw new Error(
      `Insufficient ${tokenSymbol} balance. You have ${formattedBalance} ${tokenSymbol}, but ${adjustedAmount} ${tokenSymbol} is required.`
    );
  }

  // Check if token is approved for the contract
  const allowance = await wallet.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, HEURIST_CONTRACT_ADDRESS],
  });

  // Approve token if needed
  if (allowance < amountInTokenUnits) {
    const approveTxHash = await wallet.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [HEURIST_CONTRACT_ADDRESS, amountInTokenUnits],
      chain: wallet.chain ?? undefined,
      account: wallet.account ?? null,
    });

    await waitForTransactionReceipt(wallet, {
      hash: approveTxHash,
    });

    // Token approved for Heurist contract
  }

  // Call purchaseCredits function
  try {
    const txHash = await wallet.writeContract({
      address: HEURIST_CONTRACT_ADDRESS,
      abi: HEURIST_CONTRACT_ABI,
      functionName: 'purchaseCredits',
      args: [tokenAddress, address, amountInTokenUnits],
      chain: wallet.chain ?? undefined,
      account: wallet.account ?? null,
    });

    await waitForTransactionReceipt(wallet, {
      hash: txHash,
    });

    const txUrl = constructBaseScanUrl(base, txHash);
    
    return `Successfully purchased Heurist API credits with ${adjustedAmount} ${tokenSymbol}. Transaction: ${txUrl}

You can check your credits balance and manage your API keys by visiting https://www.heurist.ai/credits and connecting with the same wallet address (${address}) that you used for this purchase.`;
  } catch (error) {
    // Error details for debugging but comply with linter rules
    
    if (error instanceof Error) {
      // Try with slightly more gas
      if (error.message.includes('execution reverted')) {
        throw new Error(`Transaction failed: The contract rejected the transaction. This might be due to:\n1. The contract not accepting this specific token currently\n2. The amount being too small or too large (try at least 1 USDC or equivalent)\n3. A temporary issue with the contract\n\nPlease try again with a different token or larger amount.`);
      } else if (error.message.includes('insufficient funds')) {
        throw new Error(`Transaction failed: Insufficient funds for gas. Please ensure you have enough ETH for transaction fees.`);
      }
      throw new Error(`Transaction failed: ${error.message}`);
    }
    
    throw new Error('Transaction failed for an unknown reason. Please try again with a different token or amount.');
  }
} 