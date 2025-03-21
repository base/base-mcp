import type { PublicActions, WalletClient } from 'viem';
import { formatGwei, formatUnits, isAddress } from 'viem';
import { getBalance, getCode } from 'viem/actions';
import { base } from 'viem/chains';
import type { z } from 'zod';
import type {
  GetAddressTransactionsSchema,
  GetContractInfoSchema,
} from './schemas.js';

// Etherscan API endpoint for all supported chains
const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';

// Helper function to handle Etherscan API requests using V2 API
async function makeEtherscanRequest(
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
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
    const response = await fetch(
      `${ETHERSCAN_API_URL}?${queryParams.toString()}`,
    );

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
    throw new Error(
      `Failed to fetch from Etherscan API: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getAddressTransactionsHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof GetAddressTransactionsSchema>,
): Promise<string> {
  // Get chain ID from args or wallet
  const chainId = args.chainId ?? wallet.chain?.id ?? base.id;

  // Validate address
  if (!isAddress(args.address, { strict: false })) {
    throw new Error(`Invalid address: ${args.address}`);
  }

  // Request parameters for normal transactions
  const txParams: Record<string, string> = {
    chainid: chainId.toString(),
    module: 'account',
    action: 'txlist',
    address: args.address,
    startblock: (args.startblock ?? 0).toString(),
    endblock: (args.endblock ?? 'latest').toString(),
    page: (args.page ?? 1).toString(),
    offset: (args.offset ?? 5).toString(),
    sort: args.sort ?? 'desc',
  };

  // API call to get 'normal' transaction data
  const txData = await makeEtherscanRequest(txParams);

  // Get ERC20 token transfers data within block range and map to transaction hash
  const tokenTransfersByHash: Record<
    string,
    Array<Record<string, string>>
  > = {};
  if (
    txData.status === '1' &&
    Array.isArray(txData.result) &&
    txData.result.length > 0
  ) {
    // Find min and max block numbers based on sort order
    const blockNumbers = txData.result.map((tx: Record<string, string>) =>
      parseInt(tx.blockNumber),
    );

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
      startblock: (minBlock - 1).toString(),
      endblock: (maxBlock + 1).toString(),
      page: '1',
      offset: '100',
      sort: args.sort ?? 'desc',
    };

    // API call to get ERC20 token transfer data
    const tokenTxData = await makeEtherscanRequest(tokenTxParams);

    if (tokenTxData.status === '1' && Array.isArray(tokenTxData.result)) {
      // Map token transfers that match transaction hashes
      const txHashes = new Set(
        txData.result.map((tx: Record<string, string>) => tx.hash),
      );

      tokenTxData.result.forEach((tokenTx: Record<string, string>) => {
        if (txHashes.has(tokenTx.hash)) {
          if (!tokenTransfersByHash[tokenTx.hash]) {
            tokenTransfersByHash[tokenTx.hash] = [];
          }

          tokenTransfersByHash[tokenTx.hash].push({
            from: tokenTx.from,
            contractAddress: tokenTx.contractAddress,
            to: tokenTx.to,
            value:
              formatUnits(
                BigInt(tokenTx.value),
                parseInt(tokenTx.tokenDecimal),
              ) +
              ' ' +
              tokenTx.tokenSymbol,
            tokenName: tokenTx.tokenName,
          });
        }
      });
    }
  }

  // Format the transaction data
  if (txData.status === '1' && Array.isArray(txData.result)) {
    const filteredResults = txData.result.map((tx: Record<string, string>) => {
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
        tokenTransfers: tokenTransfersByHash[tx.hash] || [],
      };

      return result;
    });

    // Add debug information to the response
    return JSON.stringify(filteredResults);
  }

  return JSON.stringify(txData);
}

export async function getContractInfoHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof GetContractInfoSchema>,
): Promise<string> {
  // Get chain ID from args or wallet
  const chainId = args.chainId ?? wallet.chain?.id ?? base.id;

  // Validate address
  if (!isAddress(args.address, { strict: false })) {
    throw new Error(`Invalid address: ${args.address}`);
  }

  // Check if address is a contract
  const code = await getCode(wallet, { address: args.address });
  if (code === '0x') {
    throw new Error(`Address is not a contract: ${args.address}`);
  }

  // Get ETH balance of contract
  const ethBalance = await getBalance(wallet, { address: args.address });

  // Request parameters for contract source code
  const sourceCodeParams: Record<string, string> = {
    chainid: chainId.toString(),
    module: 'contract',
    action: 'getsourcecode',
    address: args.address,
  };

  // API call to get contract source code data
  const sourceCodeData = await makeEtherscanRequest(sourceCodeParams);

  // Request parameters for contract creation info
  const creationParams: Record<string, string> = {
    chainid: chainId.toString(),
    module: 'contract',
    action: 'getcontractcreation',
    contractaddresses: args.address,
  };

  // API call to get contract creation data
  const creationData = await makeEtherscanRequest(creationParams);

  // Extract and format the required information
  const result = {
    contractName: null as string | null,
    contractAddress: args.address,
    abi: null as string | null,
    contractCreator: null as string | null,
    txHash: null as string | null,
    timestamp: null as string | null,
    ethBalance: formatUnits(ethBalance, 18) + ' ETH',
  };

  if (
    sourceCodeData.status === '1' &&
    Array.isArray(sourceCodeData.result) &&
    sourceCodeData.result.length > 0
  ) {
    const sourceCode = sourceCodeData.result[0];
    result.abi = sourceCode.ABI;
    result.contractName = sourceCode.ContractName;
  }

  if (
    creationData.status === '1' &&
    Array.isArray(creationData.result) &&
    creationData.result.length > 0
  ) {
    const creation = creationData.result[0];
    result.contractCreator = creation.contractCreator;
    result.txHash = creation.txHash;

    // Convert timestamp to human-readable date
    if (creation.timestamp) {
      const date = new Date(parseInt(creation.timestamp) * 1000);
      result.timestamp = date.toISOString() + ' UTC';
    }
  }

  return JSON.stringify(result);
}
