# OpenSea Integration for Base MCP

This module provides OpenSea marketplace integration for the Base MCP server.

## Features

- **opensea_list_nft**: Prepare NFT listings for OpenSea marketplace
- **opensea_get_nfts**: Fetch NFTs owned by a wallet address from OpenSea API

## Configuration

Set the following environment variable:

```bash
OPENSEA_API_KEY=your_opensea_api_key
```

You can obtain an API key from [OpenSea Developer Portal](https://docs.opensea.io/reference/api-keys).

## Usage

The OpenSea integration is automatically loaded when the `OPENSEA_API_KEY` environment variable is set.

### List NFT

Prepares an NFT for listing on OpenSea:

```javascript
{
  "contractAddress": "0x...",
  "tokenId": "1",
  "price": 0.5,  // Price in ETH
  "expirationDays": 90  // Optional, defaults to 90 days
}
```

### Get NFTs by Account

Fetches NFTs owned by a specific address:

```javascript
{
  "accountAddress": "0x..."  // Optional, uses connected wallet if not provided
}
```

## Supported Networks

- Base Mainnet (chain ID: 8453)
- Base Sepolia (chain ID: 84532)

## Note

Full automated listing through the OpenSea SDK requires additional wallet configuration that is not directly compatible with the current EvmWalletProvider interface. The current implementation provides:

1. NFT listing preparation with direct links to OpenSea
2. NFT fetching using OpenSea's REST API

For complete automation of listings, consider using the OpenSea SDK directly with a compatible wallet provider.