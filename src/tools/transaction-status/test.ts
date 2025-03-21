/**
 * Tests for the transaction status tool
 *
 * To run this test, you can use the following command:
 * node --loader ts-node/esm src/tools/transaction-status/test.ts
 */

import { fileURLToPath } from 'url';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { transactionStatusHandler } from './handlers.js';

// Example transaction hash to test with
const EXAMPLE_TX_HASH =
  '0xcf0bb80bfc5859cb33353c488045022811e2d412274e1963c75d83a4b038c22d';

// Mock privateKey - DO NOT use this in production
const PRIVATE_KEY =
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

async function testTransactionStatus() {
  try {
    // This is just for testing purposes
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

    // Create a wallet client
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http('https://base.llamarpc.com'),
    });

    // Create a public client
    const publicClient = createPublicClient({
      chain: base,
      transport: http('https://base.llamarpc.com'),
    });

    // Extend wallet client with public methods
    const extendedWallet = {
      ...walletClient,
      ...publicClient,
    };

    // Call the transaction status handler
    console.log('Testing transaction status handler...');

    const result = await transactionStatusHandler(extendedWallet as any, {
      txHash: EXAMPLE_TX_HASH,
    });

    console.log('Result:', JSON.parse(result));
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test (ES module version)
const currentFilePath = fileURLToPath(import.meta.url);
// This checks if this module is the main module
if (process.argv[1] === currentFilePath) {
  testTransactionStatus();
}
