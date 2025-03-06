# Base MCP Examples

This document provides examples of how to interact with the Base MCP tools through Claude.

## Basic Wallet Operations

### Getting Your Wallet Address

**You:** What's my wallet address on Base?

**Claude:** Let me get your wallet address for you.

*Claude uses the `get-address` tool*

**Claude:** Your wallet address is: 0x1234567890abcdef1234567890abcdef12345678

### Checking Your Wallet Balance

**You:** Show me my wallet balances.

**Claude:** I'll check your wallet balances for you.

*Claude uses the `list-balances` tool*

**Claude:** Here are your current wallet balances:
- ETH: 0.5 ETH
- USDC: 100 USDC

### Getting Testnet ETH

**You:** I need some testnet ETH for development.

**Claude:** I'll request some testnet ETH for your wallet on Base Sepolia.

*Claude uses the `get-testnet-eth` tool*

**Claude:** I've requested testnet ETH for your wallet. The transaction hash is: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

## Advanced Operations

### Transferring Funds

**You:** Transfer 0.01 ETH to 0x9876543210abcdef9876543210abcdef98765432

**Claude:** I'll set up that transfer for you.

*Claude uses the `transfer-funds` tool with the following parameters:*
- destination: 0x9876543210abcdef9876543210abcdef98765432
- assetId: ETH
- amount: 0.01

**Claude:** I've initiated the transfer of 0.01 ETH to 0x9876543210abcdef9876543210abcdef98765432. The transaction has been submitted to the blockchain.

### Deploying a Smart Contract

**You:** Deploy a simple ERC20 token contract for me.

**Claude:** I'll help you deploy an ERC20 token contract. What would you like to name your token?

**You:** Let's call it "ExampleToken" with symbol "EXT".

**Claude:** I'll prepare the ERC20 token contract for deployment.

*Claude uses the `deploy-contract` tool with the following parameters:*
- constructorArgs: ["ExampleToken", "EXT", "1000000000000000000000000"]
- contractName: "ERC20Token"
- solidityInputJson: *[JSON containing the ERC20 contract source code]*
- solidityVersion: "0.8.20"

**Claude:** Your ERC20 token contract has been deployed successfully! The contract address is: 0xdef1234567890abcdef1234567890abcdef123456

## Tips for Effective Use

1. **Be specific in your requests** - Provide all necessary details when asking Claude to perform blockchain operations.

2. **Verify sensitive operations** - Double-check addresses and amounts when transferring funds or deploying contracts.

3. **Use testnet for experiments** - Always use the Base Sepolia testnet for experimentation and development before moving to mainnet.

4. **Keep your configuration secure** - Remember that your Claude Desktop configuration contains sensitive information. Keep it secure and don't share it.
