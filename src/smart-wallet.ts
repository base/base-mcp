import express from 'express';
import './polyfills.js';
import { EIP1193Provider, Wallets } from '@mobile-wallet-protocol/client';

const metadata = {
  appName: 'Base MCP',
  appDeeplinkUrl: 'http://localhost:8181',
  chainIds: [8453],
  logoUrl: 'https://example.com/logo.png',
};

export function initializeSmartWallet() {
  console.log('initializing smart wallet');
  // Start express server
  const server = express();

  console.error('test');
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(express.static('public'));
  server.listen(8181, () => {
    console.log('Server is running on port 8181');
  });

  const provider = new EIP1193Provider({
    metadata,
    wallet: Wallets.CoinbaseSmartWallet,
  });
}
