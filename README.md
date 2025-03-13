# Base MCP Server 🔵 

[![npm version](https://img.shields.io/npm/v/base-mcp.svg)](https://www.npmjs.com/package/base-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides onchain tools for AI applications like Claude Desktop and Cursor, allowing them to interact with the Base Network and Coinbase API.

## Overview

This MCP server extends any MCP client's capabilities by providing tools to do anything on Base:

- Retrieve wallet addresses
- List wallet balances
- Transfer funds between wallets
- Deploy smart contracts 
- Interact with Morpho vaults for onchain lending
- Call contract functions 
- Onramp funds via [Coinbase](https://www.coinbase.com/developer-platform/products/onramp)
- Manage ERC20 tokens
- Buy [OpenRouter](http://openrouter.ai/) credits with USDC

The server interacts with Base, powered by Base Developer Tools and [AgentKit](https://github.com/coinbase/agentkit). 

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Coinbase API credentials (API Key Name and Private Key)
- A wallet seed phrase
- Coinbase Project ID (for onramp functionality)
- Optional: OpenRouter API Key (for buying OpenRouter credits)

## Installation

### Option 1: Install from npm (Recommended)

```bash
# Install globally
npm install -g base-mcp

# Or install locally in your project
npm install base-mcp
```

### Option 2: Install from Source

1. Clone this repository:

   ```bash
   git clone https://github.com/base/base-mcp.git
   cd base-mcp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Optionally, link it globally:
   ```bash
   npm link
   ```

## Configuration

Create a `.env` file with your credentials:

```
# Coinbase API credentials
# You can obtain these from the Coinbase Developer Portal: https://cdp.coinbase.com/
COINBASE_API_KEY_NAME=your_api_key_name
COINBASE_API_PRIVATE_KEY=your_private_key

# Wallet seed phrase (12 or 24 words)
# This is the mnemonic phrase for your wallet
SEED_PHRASE=your seed phrase here

# Coinbase Project ID (for onramp functionality)
# You can obtain this from the Coinbase Developer Portal
COINBASE_PROJECT_ID=your_project_id

# OpenRouter API Key (optional for buying OpenRouter credits)
# You can obtain this from https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Testing

Test the MCP server to verify it's working correctly:

```bash
npm test
```

This script will verify that your MCP server is working correctly by testing the connection and available tools.

## Examples

See the [examples.md](examples.md) file for detailed examples of how to interact with the Base MCP tools through Claude.

## Integration with Claude Desktop

To add this MCP server to Claude Desktop:

1. Create or edit the Claude Desktop configuration file at:

   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add the following configuration:

   ```json
   {
     "mcpServers": {
       "base-mcp": {
         "command": "node",
         "args": ["/path/to/base-mcp/build/index.js"],
         "env": {
           "COINBASE_API_KEY_NAME": "your_api_key_name",
           "COINBASE_API_PRIVATE_KEY": "your_private_key",
           "SEED_PHRASE": "your seed phrase here",
           "COINBASE_PROJECT_ID": "your_project_id",
           "COINBASE_PUBLIC_API_KEY": "your_public_api_key",
           "OPENROUTER_API_KEY": "your_openrouter_api_key"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

3. Restart Claude Desktop for the changes to take effect.

## Available Tools

### get-address

Retrieves the address for your wallet.

Example query to Claude:

> "What's my wallet address?"

### get-testnet-eth

Gets testnet ETH for your wallet. This can only be called on the Base Sepolia network.

Example query to Claude:

> "Can you get me some testnet ETH for my wallet?"

### list-balances

Lists all balances for your wallet.

Example query to Claude:

> "Show me my wallet balances."

### transfer-funds

Transfers funds from your wallet to another address.

Parameters:

- `destination`: The address to which to transfer funds
- `assetId`: The asset ID to transfer
- `amount`: The amount of funds to transfer

Example query to Claude:

> "Transfer 0.01 ETH to 0x1234567890abcdef1234567890abcdef12345678."

### deploy-contract

Deploys a smart contract to the blockchain.

Parameters:

- `constructorArgs`: The arguments for the contract constructor
- `contractName`: The name of the contract to deploy
- `solidityInputJson`: The JSON input for the Solidity compiler containing contract source and settings
- `solidityVersion`: The version of the solidity compiler

Example query to Claude:

> "Deploy a simple ERC20 token contract for me."

### get_morpho_vaults

Gets the vaults for a given asset on Morpho.

Parameters:

- `assetSymbol`: Asset symbol by which to filter vaults (optional)

Example query to Claude:

> "Show me the available Morpho vaults for USDC."

### call_contract

Calls a contract function on the blockchain.

Parameters:

- `contractAddress`: The address of the contract to call
- `functionName`: The name of the function to call
- `functionArgs`: The arguments to pass to the function
- `abi`: The ABI of the contract
- `value`: The value of ETH to send with the transaction (optional)

Example query to Claude:

> "Call the balanceOf function on the contract at 0x1234567890abcdef1234567890abcdef12345678."

### get_onramp_assets

Gets the assets available for onramping in a given country/subdivision.

Parameters:

- `country`: ISO 3166-1 two-digit country code string representing the purchasing user's country of residence
- `subdivision`: ISO 3166-2 two-digit country subdivision code (required for US)

Example query to Claude:

> "What assets can I onramp in the US, specifically in New York?"

### onramp

Gets a URL for onramping funds via Coinbase.

Parameters:

- `amountUsd`: The amount of funds to onramp
- `assetId`: The asset ID to onramp

Example query to Claude:

> "I want to onramp $100 worth of ETH."

### erc20_balance

Gets the balance of an ERC20 token.

Parameters:

- `contractAddress`: The address of the ERC20 contract

Example query to Claude:

> "What's my balance of the token at 0x1234567890abcdef1234567890abcdef12345678?"

### erc20_transfer

Transfers an ERC20 token to another address.

Parameters:

- `contractAddress`: The address of the ERC20 contract
- `toAddress`: The address of the recipient
- `amount`: The amount of tokens to transfer

Example query to Claude:

> "Transfer 10 USDC to 0x1234567890abcdef1234567890abcdef12345678."

### buy_openrouter_credits

Buys OpenRouter credits with USDC.

Parameters:

- `amountUsd`: The amount of credits to buy, in USD

Example query to Claude:

> "Buy $20 worth of OpenRouter credits."

## Security Considerations

- The configuration file contains sensitive information (API keys and seed phrases). Ensure it's properly secured and not shared.
- Consider using environment variables or a secure credential manager instead of hardcoding sensitive information.
- Be cautious when transferring funds or deploying contracts, as these operations are irreversible on the blockchain.
- When using the onramp functionality, ensure you're on a secure connection.
- Verify all transaction details before confirming, especially when transferring funds or buying credits.

## Troubleshooting

If you encounter issues:

1. Check that your Coinbase API credentials are correct
2. Verify that your seed phrase is valid
3. Ensure you're on the correct network (Base Mainnet)
4. Check the Claude Desktop logs for any error messages

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows the existing style and includes appropriate tests.
