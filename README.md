# Base MCP Server 🔵

![OpenRouter Integration](public/OpenRouter.gif)

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

## Extending Base MCP with 3P Protocols, Tools, and Data Sources

Base MCP is designed to be extensible, allowing you to add your own third-party protocols, tools, and data sources. This section provides an overview of how to extend the Base MCP server with new capabilities.

### Adding New Tools

If you want to add a new tool to the Base MCP server, follow these steps:

1. Create a new directory in the `src/tools` directory for your tool
2. Implement the tool following the existing patterns:
   - `index.ts`: Define and export your tools
   - `schemas.ts`: Define input schemas for your tools
   - `handlers.ts`: Implement the functionality of your tools
3. Add your tool to the list of available tools in `src/tools/index.ts`
4. Add documentation for your tool in the README.md
5. Add examples of how to use your tool in examples.md
6. Write tests for your tool

### Project Structure

The Base MCP server follows this structure for tools:

```
src/
├── tools/
│   ├── index.ts (exports toolsets)
│   ├── [TOOL_NAME]/ <-------------------------- ADD DIR HERE
│   │   ├── index.ts (defines and exports tools)
│   │   ├── schemas.ts (defines input schema)
│   │   └── handlers.ts (implements tool functionality)
│   └── utils/ (shared tool utilities)
```

### Best Practices for Tool Development

When developing new tools for Base MCP:

- Follow the existing code style and patterns
- Ensure your tool has a clear, focused purpose
- Provide comprehensive input validation
- Include detailed error handling
- Write thorough documentation
- Add examples demonstrating how to use your tool
- Include tests for your tool

For more detailed information on contributing to Base MCP, including adding new tools and protocols, see the [CONTRIBUTING.md](CONTRIBUTING.md) file.

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

Once the package is installed, you can configure clients with the following command:

```bash
base-mcp --init
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

You can easily access this file via the Claude Desktop app by navigating to Claude > Settings > Developer > Edit Config.

2. Add the following configuration:

   ```json
   {
     "mcpServers": {
       "base-mcp": {
         "command": "npx",
         "args": ["base-mcp@latest"],
         "env": {
           "COINBASE_API_KEY_NAME": "your_api_key_name",
           "COINBASE_API_PRIVATE_KEY": "your_private_key",
           "SEED_PHRASE": "your seed phrase here",
           "COINBASE_PROJECT_ID": "your_project_id",
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

### analyze_nft_collection

Analyze an NFT collection for floor price, volume, rarity, and other metrics.

Parameters:

- `contractAddress`: The contract address of the NFT collection to analyze
- `chainId`: (Optional) The chain ID (defaults to Base Mainnet)

Example query to Claude:

> "Analyze the NFT collection at 0x1234567890abcdef1234567890abcdef12345678."

### mint_nft

Mint a new NFT with specified metadata and image.

Parameters:

- `name`: The name of the NFT
- `description`: The description of the NFT
- `imageUrl`: URL to the image (IPFS, Arweave, or HTTP)
- `recipientAddress`: (Optional) The recipient address (defaults to the connected wallet)
- `attributes`: (Optional) Attributes/traits for the NFT metadata, array of objects with trait_type and value

Example query to Claude:

> "Mint a new NFT called 'Cosmic Explorer' with the description 'A journey through the stars' using the image at https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1."

### create_dao

Create a new DAO with specified governance settings.

Parameters:

- `name`: Name of the DAO
- `tokenAddress`: (Optional) Governance token address (for token-based governance)
- `members`: (Optional) Initial members for multisig/membership DAO, array of objects with address and votingPower
- `votingPeriod`: (Optional) Default voting period in seconds
- `votingDelay`: (Optional) Default delay before voting starts in seconds
- `quorumPercentage`: (Optional) Default minimum quorum percentage
- `executionDelay`: (Optional) Delay before execution in seconds

Example query to Claude:

> "Create a new DAO called 'Community Treasury' with a 3-day voting period and 4% quorum requirement."

### create_dao_proposal

Create a new proposal for DAO voting.

Parameters:

- `title`: The title of the proposal
- `description`: Detailed description of the proposal
- `options`: Voting options (at least 2)
- `endTime`: Unix timestamp when voting ends
- `daoAddress`: DAO contract address
- `snapshotBlock`: (Optional) Block number for the voting power snapshot
- `startTime`: (Optional) Unix timestamp when voting starts (default: immediately)
- `quorum`: (Optional) Minimum percentage of total voting power required
- `executionActions`: (Optional) Actions to execute if proposal passes

Example query to Claude:

> "Create a proposal in our DAO at 0x1234... titled 'Increase Developer Fund' with the description 'We should allocate more funds to support developers' with options 'For' and 'Against', ending in 5 days."

### list_dao_proposals

List all proposals for a DAO, with optional filtering by status.

Parameters:

- `daoAddress`: DAO contract address
- `status`: (Optional) Filter by proposal status: "active", "pending", "closed", or "all"
- `limit`: (Optional) Maximum number of proposals to return (default: 10)
- `skip`: (Optional) Number of proposals to skip (default: 0)

Example query to Claude:

> "Show me all active proposals in our DAO at 0x1234..."

### get_dao_proposal_details

Get detailed information about a specific DAO proposal, including votes and actions.

Parameters:

- `proposalId`: ID of the proposal to fetch
- `daoAddress`: DAO contract address

Example query to Claude:

> "Show me the details of proposal 0x1234 in our DAO at 0x5678..."

### cast_dao_vote

Cast a vote on a DAO proposal.

Parameters:

- `proposalId`: ID of the proposal to vote on
- `optionIndex`: Index of the option to vote for
- `daoAddress`: DAO contract address
- `reason`: (Optional) Reason for the vote

Example query to Claude:

> "Vote 'For' on proposal 0x1234 in our DAO with the reason 'This will help grow our community'."

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

For detailed guidelines on contributing to Base MCP, including:

- Reporting bugs
- Suggesting enhancements
- Development setup
- Coding standards
- **Adding new tools, protocols, and data sources** (see also the [Extending Base MCP](#extending-base-mcp-with-3p-protocols-tools-and-data-sources) section above)
- Testing requirements
- Documentation standards

Please refer to our comprehensive [CONTRIBUTING.md](CONTRIBUTING.md) guide.

Basic contribution steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows the existing style and includes appropriate tests.
