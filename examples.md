# Base MCP Examples

This document provides examples of how to interact with the Base MCP tools through Claude.

## Basic Wallet Operations

### Getting Your Wallet Address

**You:** What's my wallet address on Base?

**Claude:** Let me get your wallet address for you.

_Claude uses the `get-address` tool_

**Claude:** Your wallet address is: 0x1234567890abcdef1234567890abcdef12345678

### Checking Your Wallet Balance

**You:** Show me my wallet balances.

**Claude:** I'll check your wallet balances for you.

_Claude uses the `list-balances` tool_

**Claude:** Here are your current wallet balances:

- ETH: 0.5 ETH
- USDC: 100 USDC

### Getting Testnet ETH

**You:** I need some testnet ETH for development.

**Claude:** I'll request some testnet ETH for your wallet on Base Sepolia.

_Claude uses the `get-testnet-eth` tool_

**Claude:** I've requested testnet ETH for your wallet. The transaction hash is: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

## Advanced Operations

### Transferring Funds

**You:** Transfer 0.01 ETH to 0x9876543210abcdef9876543210abcdef98765432

**Claude:** I'll set up that transfer for you.

_Claude uses the `transfer-funds` tool with the following parameters:_

- destination: 0x9876543210abcdef9876543210abcdef98765432
- assetId: ETH
- amount: 0.01

**Claude:** I've initiated the transfer of 0.01 ETH to 0x9876543210abcdef9876543210abcdef98765432. The transaction has been submitted to the blockchain.

### Deploying a Smart Contract

**You:** Deploy a simple ERC20 token contract for me.

**Claude:** I'll help you deploy an ERC20 token contract. What would you like to name your token?

**You:** Let's call it "ExampleToken" with symbol "EXT".

**Claude:** I'll prepare the ERC20 token contract for deployment.

_Claude uses the `deploy-contract` tool with the following parameters:_

- constructorArgs: ["ExampleToken", "EXT", "1000000000000000000000000"]
- contractName: "ERC20Token"
- solidityInputJson: _[JSON containing the ERC20 contract source code]_
- solidityVersion: "0.8.20"

**Claude:** Your ERC20 token contract has been deployed successfully! The contract address is: 0xdef1234567890abcdef1234567890abcdef123456

## Morpho Integration

### Getting Morpho Vaults

**You:** Show me the available Morpho vaults for USDC.

**Claude:** I'll check the Morpho vaults for USDC.

_Claude uses the `get_morpho_vaults` tool with the following parameters:_

- assetSymbol: "USDC"

**Claude:** Here are the available Morpho vaults for USDC:

- Vault Name: USDC Yield Source

  - Address: 0xabcdef1234567890abcdef1234567890abcdef12
  - Liquidity: $10,000,000 (10,000,000 USDC)
  - Risk Score: 85/100

- Vault Name: USDC Stability Pool
  - Address: 0x1234567890abcdef1234567890abcdef12345678
  - Liquidity: $5,000,000 (5,000,000 USDC)
  - Risk Score: 92/100

## Contract Interactions

### Calling Contract Functions

**You:** Call the balanceOf function on the contract at 0x1234567890abcdef1234567890abcdef12345678 for my address.

**Claude:** I'll call that contract function for you.

_Claude uses the `call_contract` tool with the following parameters:_

- contractAddress: "0x1234567890abcdef1234567890abcdef12345678"
- functionName: "balanceOf"
- functionArgs: ["0x9876543210abcdef9876543210abcdef98765432"]
- abi: _[JSON containing the contract ABI]_

**Claude:** The balanceOf function returned: 1000000000000000000 (1 token)

### Managing ERC20 Tokens

**You:** What's my balance of the USDC token?

**Claude:** I'll check your USDC balance.

_Claude uses the `erc20_balance` tool with the following parameters:_

- contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" (USDC contract address)

**Claude:** Your USDC balance is: 100.0 USDC

**You:** Transfer 10 USDC to 0x9876543210abcdef9876543210abcdef98765432

**Claude:** I'll set up that USDC transfer for you.

_Claude uses the `erc20_transfer` tool with the following parameters:_

- contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" (USDC contract address)
- toAddress: "0x9876543210abcdef9876543210abcdef98765432"
- amount: "10"

**Claude:** I've initiated the transfer of 10 USDC to 0x9876543210abcdef9876543210abcdef98765432. The transaction hash is: 0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210

## NFT Operations

### Listing NFTs

**You:** Show me the NFTs owned by 0x89A93a48C6Ef8085B9d07e46AaA96DFDeC717040.

**Claude:** I'll check what NFTs are owned by that address.

_Claude uses the `list_nfts` tool with the following parameters:_

- ownerAddress: 0x89A93a48C6Ef8085B9d07e46AaA96DFDeC717040

**Claude:** I found 1 NFT owned by 0x89A93a48C6Ef8085B9d07e46AaA96DFDeC717040:

1. Owl (ERC1155)
   Contract: 0x3F06FcF75f45F1bb61D56D68fA7b3F32763AA15c
   Token ID: 56090175025510453004781233574040052668718235229192064098345825090519343038548

### Transferring an NFT

**You:** Transfer my NFT with contract 0x3F06FcF75f45F1bb61D56D68fA7b3F32763AA15c and token ID 56090175025510453004781233574040052668718235229192064098345825090519343038548 to 0x1234567890abcdef1234567890abcdef12345678.

**Claude:** I'll set up that NFT transfer for you.

_Claude uses the `transfer_nft` tool with the following parameters:_

- contractAddress: 0x3F06FcF75f45F1bb61D56D68fA7b3F32763AA15c
- tokenId: 56090175025510453004781233574040052668718235229192064098345825090519343038548
- toAddress: 0x1234567890abcdef1234567890abcdef12345678
- amount: 1

**Claude:** I've initiated the transfer of your Owl NFT to 0x1234567890abcdef1234567890abcdef12345678. The transaction hash is: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

## Onramp and Payments

### Checking Available Onramp Assets

**You:** What assets can I onramp in the US, specifically in New York?

**Claude:** I'll check what assets are available for onramping in New York.

_Claude uses the `get_onramp_assets` tool with the following parameters:_

- country: "US"
- subdivision: "NY"

**Claude:** Here are the assets available for onramping in New York, US:

- ETH
- USDC
- DAI
- WBTC

### Onramping Funds

**You:** I want to onramp $100 worth of ETH.

**Claude:** I'll generate an onramp link for you.

_Claude uses the `onramp` tool with the following parameters:_

- amountUsd: 100
- assetId: "eth"

**Claude:** Here's your onramp link to purchase $100 worth of ETH: https://onramp.coinbase.com/buy?appId=abc123&destinationWallets=[address]&presetFiatAmount=100

### Buying OpenRouter Credits

**You:** Buy $20 worth of OpenRouter credits.

**Claude:** I'll set up the purchase of OpenRouter credits for you.

_Claude uses the `buy_openrouter_credits` tool with the following parameters:_

- amountUsd: 20

**Claude:** I've initiated the purchase of $20 worth of OpenRouter credits using your USDC. The transaction hash is: 0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234

## Farcaster Operations

### Resolving a Farcaster Username to an Ethereum Address

**You:** What's the Ethereum address for the Farcaster user "dwr"?

**Claude:** I'll look up that Farcaster username for you.

_Claude uses the `farcaster_username` tool with the following parameters:_

- username: dwr

**Claude:** I found the Ethereum address for the Farcaster user "dwr":

- Username: dwr
- FID: 5650
- Ethereum Address: 0x6a0d25cbb5aa86595f4d29a18999ff2f5d6be4ea

This address is verified on their Farcaster profile and can be used for transactions or verification.

## Tips for Effective Use

1. **Be specific in your requests** - Provide all necessary details when asking Claude to perform blockchain operations.

2. **Verify sensitive operations** - Double-check addresses and amounts when transferring funds or deploying contracts.

3. **Use testnet for experiments** - Always use the Base Sepolia testnet for experimentation and development before moving to mainnet.

4. **Keep your configuration secure** - Remember that your Claude Desktop configuration contains sensitive information. Keep it secure and don't share it.

5. **Understand gas costs** - Be aware that blockchain transactions require gas fees. Make sure you have enough ETH to cover these fees.

6. **Verify contract interactions** - When interacting with smart contracts, verify the contract address and function parameters before confirming transactions.

7. **Use onramp responsibly** - When onramping funds, be aware of any fees or limits that may apply.
