# Base MCP Server

[![npm version](https://img.shields.io/npm/v/base-mcp.svg)](https://www.npmjs.com/package/base-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides onchain tools for AI applications like Claude Desktop, Cursor and etc., allowing them to interact with the Base blockchain and Coinbase API.

## Overview

This MCP server extends Claude's capabilities by providing tools to:

- Retrieve wallet addresses
- Get testnet ETH (on Base Sepolia)
- List wallet balances
- Transfer funds between wallets
- Deploy smart contracts

The server uses the Coinbase SDK to interact with the Base blockchain and Coinbase services.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Coinbase API credentials (API Key Name and Private Key)
- A wallet seed phrase

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
           "SEED_PHRASE": "your seed phrase here"
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

## Security Considerations

- The configuration file contains sensitive information (API keys and seed phrases). Ensure it's properly secured and not shared.
- Consider using environment variables or a secure credential manager instead of hardcoding sensitive information.
- Be cautious when transferring funds or deploying contracts, as these operations are irreversible on the blockchain.

## Troubleshooting

If you encounter issues:

1. Check that your Coinbase API credentials are correct
2. Verify that your seed phrase is valid
3. Ensure you're on the correct network (Base Sepolia for testnet operations)
4. Check the Claude Desktop logs for any error messages

## License

[MIT License](LICENSE)

## Making Your MCP Discoverable

To make your MCP server discoverable by other developers, follow these steps:

### 1. Publish to npm

```bash
# Login to npm (you'll need an npm account)
npm login

# Publish the package
npm publish
```

This will make your MCP server available on the npm registry, allowing other developers to install it using `npm install base-mcp`.

### 2. Share Your GitHub Repository

Make sure your GitHub repository is public and well-documented. Add the following to enhance discoverability:

- A detailed README (like this one)
- Examples of usage
- Contributing guidelines
- Issue templates

### 3. Add to the MCP Directory

The Model Context Protocol community maintains a directory of available MCP servers. Submit your MCP server to be included in this directory by running:

```bash
npm run submit
```

This script will:

1. Check if your package is published to npm
2. Verify your GitHub repository information
3. Generate a submission file with all the necessary information
4. Guide you through the submission process

Alternatively, you can manually submit by:

1. Visiting the [MCP Directory Repository](https://github.com/modelcontextprotocol/directory)
2. Following the contribution guidelines to add your MCP server

### 4. Promote in Relevant Communities

Share your MCP server in communities where developers using Claude might be active:

- Anthropic Developer Discord
- Claude subreddit
- AI/ML developer forums
- Blockchain and Web3 communities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows the existing style and includes appropriate tests.
