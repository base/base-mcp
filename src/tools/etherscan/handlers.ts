import type { PublicActions, WalletClient } from 'viem';
import { base } from 'viem/chains';
import { formatUnits, formatGwei } from 'viem';
import type { z } from 'zod';
import type { GetAddressTransactionsSchema } from './schemas.js';

// Etherscan API endpoint for all supported chains
const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';

// Helper function to handle Etherscan API requests using V2 API
async function makeEtherscanRequest(
  params: Record<string, string>,
): Promise<any> {
  // Add API key if available
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (apiKey) {
    params.apikey = apiKey;
  } else {
    throw new Error('ETHERSCAN_API_KEY is not set');
  }
 
  // Build query string
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value);
  });

  try {
    const response = await fetch(`${ETHERSCAN_API_URL}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle Etherscan API errors
    if (data.status === '0' && data.message === 'NOTOK') {
      throw new Error(`Etherscan API error: ${data.result}`);
    }
    
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch from Etherscan API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getAddressTransactionsHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof GetAddressTransactionsSchema>,
): Promise<any> {
  // Get chain ID from args or wallet
  const chainId = args.chainId ?? wallet.chain?.id ?? base.id;
    
  // Request parameters for normal transactions
  const txParams: Record<string, string> = {
    chainid: chainId.toString(),
    module: 'account',
    action: 'txlist',
    address: args.address,
    startblock: (args.startblock ?? 0).toString(),
    endblock: (args.endblock ?? "latest").toString(),
    page: (args.page ?? 1).toString(),
    offset: (args.offset ?? 5).toString(),
    sort: args.sort ?? 'desc',
  };
  
  // API call to get 'normal' transaction data
  const txData = await makeEtherscanRequest(txParams);
  
  // Get ERC20 token transfers data within block range and map to transaction hash
  const tokenTransfersByHash: Record<string, any[]> = {};
  if (txData.status === '1' && Array.isArray(txData.result) && txData.result.length > 0) {
    
    // Find min and max block numbers based on sort order
    const blockNumbers = txData.result.map((tx: any) => parseInt(tx.blockNumber));

    let minBlock: number;
    let maxBlock: number;
    if (args.sort === 'asc') {
      minBlock = blockNumbers[0];
      maxBlock = blockNumbers[blockNumbers.length - 1];
    } else {
      minBlock = blockNumbers[blockNumbers.length - 1];
      maxBlock = blockNumbers[0];
    }
    
    // Request parameters for ERC20 token transfers
    const tokenTxParams: Record<string, string> = {
      chainid: chainId.toString(),
      module: 'account',
      action: 'tokentx',
      address: args.address,
      startblock: (minBlock-1).toString(),
      endblock: (maxBlock+1).toString(),
      page: '1',
      offset: '100', 
      sort: args.sort ?? 'desc',
    };
    
    // API call to get ERC20 token transfer data
    const tokenTxData = await makeEtherscanRequest(tokenTxParams);
    
    if (tokenTxData.status === '1' && Array.isArray(tokenTxData.result)) {
      
      // Map token transfers that match transaction hashes
      const txHashes = new Set(txData.result.map((tx: any) => tx.hash));

      tokenTxData.result.forEach((tokenTx: any) => {
        if (txHashes.has(tokenTx.hash)) {
          if (!tokenTransfersByHash[tokenTx.hash]) {
            tokenTransfersByHash[tokenTx.hash] = [];
          }
          
          tokenTransfersByHash[tokenTx.hash].push({
            from: tokenTx.from,
            contractAddress: tokenTx.contractAddress,
            to: tokenTx.to,
            value: formatUnits(BigInt(tokenTx.value), tokenTx.tokenDecimal) + ' ' + tokenTx.tokenSymbol,
            tokenName: tokenTx.tokenName,
          });
        }
      });
    }
  }
  
  // Format the transaction data
  if (txData.status === '1' && Array.isArray(txData.result)) {
    const filteredResults = txData.result.map((tx: any) => {
      // Convert Unix timestamp to human-readable date
      const date = new Date(parseInt(tx.timeStamp) * 1000);
      const formattedDate = date.toISOString();
      
      // Calculate paid fee in ETH 
      const feeWei = BigInt(tx.gasUsed) * BigInt(tx.gasPrice);
      const feeInEth = formatUnits(feeWei, 18);
      
      const result = {
        timeStamp: formattedDate + ' UTC',
        hash: tx.hash,
        nonce: tx.nonce,
        from: tx.from,
        to: tx.to,
        value: formatUnits(BigInt(tx.value), 18) + ' ETH',
        gasPrice: formatGwei(BigInt(tx.gasPrice)) + ' gwei',
        isError: tx.isError,
        txreceipt_status: tx.txreceipt_status,
        input: tx.input,
        contractAddress: tx.contractAddress,
        feeInEth: feeInEth + ' ETH',
        methodId: tx.methodId,
        functionName: tx.functionName,
        tokenTransfers: tokenTransfersByHash[tx.hash] || []
      };
      
      return result;
    });
    
    // Add debug information to the response
    return filteredResults;
  }
  
  return txData;
}
