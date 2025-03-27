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

## NFT Operations

### Analyzing an NFT Collection

**You:** Analyze the NFT collection at 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D.

**Claude:** I'll analyze that NFT collection for you.

_Claude uses the `analyze_nft_collection` tool with the following parameters:_

- contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"

**Claude:** I've analyzed the NFT collection.

Collection Name: Bored Ape Yacht Club
Symbol: BAYC
Total Supply: 10,000

Market Data:
- Floor Price: 30.5 ETH
- 24h Volume: 250 ETH
- 7d Volume: 1,850 ETH
- Unique Holders: 6,400
- Listed for Sale: 485

Rarity Analysis:
- Most Common Traits: Brown background, Black fur, Sleepy eyes
- Rarest Traits: Solid gold fur, Laser eyes, King's crown
- Collection Traits with Highest Value: Gold fur, Laser eyes, Robot features

### Minting a New NFT

**You:** Mint a new NFT called "Digital Dreamscape" with the description "A surreal landscape of digital imagination" using the image at https://example.com/nft-image.jpg.

**Claude:** I'll mint that NFT for you.

_Claude uses the `mint_nft` tool with the following parameters:_

- name: "Digital Dreamscape"
- description: "A surreal landscape of digital imagination"
- imageUrl: "https://example.com/nft-image.jpg"

**Claude:** I've minted your "Digital Dreamscape" NFT successfully! The transaction has been submitted to the blockchain.

Transaction Hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

Your NFT has been minted to your wallet address. You can view it on [BaseScan](https://basescan.org/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890) or any NFT marketplace that supports Base.

## DAO Governance

### Creating a DAO

**You:** Create a new DAO called "Community Fund" for managing our treasury with a 3-day voting period and 5% quorum.

**Claude:** I'll create the DAO for you with those settings.

_Claude uses the `create_dao` tool with the following parameters:_

- name: "Community Fund"
- votingPeriod: 259200
- quorumPercentage: 5

**Claude:** I've created the "Community Fund" DAO successfully. The DAO is deployed at address 0x742a1fb11f68b532db9c6494376c4e7a4fef4f24.

Your DAO has the following settings:
- Governance Type: Membership-based
- Voting Period: 3 days
- Quorum: 5%
- Voting Delay: 1 day
- Execution Delay: 2 days

You are set as the initial admin. You can now create proposals and manage the DAO.

### Creating a Proposal

**You:** Create a proposal in our Community Fund DAO titled "Fund Developer Grants" with the description "Allocate 10,000 USDC to support developers building on our platform" with options "For" and "Against", ending in 5 days.

**Claude:** I'll create that proposal for your DAO.

_Claude uses the `create_dao_proposal` tool with the following parameters:_

- title: "Fund Developer Grants"
- description: "Allocate 10,000 USDC to support developers building on our platform"
- options: ["For", "Against"]
- endTime: [timestamp 5 days from now]
- daoAddress: "0x742a1fb11f68b532db9c6494376c4e7a4fef4f24"

**Claude:** Your proposal has been created successfully in the Community Fund DAO. The proposal ID is 0x3d7c9e6f.

Here's a summary of your proposal:
- Title: Fund Developer Grants
- Description: Allocate 10,000 USDC to support developers building on our platform
- Voting Options: For, Against
- Voting ends: [date 5 days from now]

Members can now cast their votes until the end date.

### Viewing Proposals

**You:** Show me all active proposals in our Community Fund DAO.

**Claude:** I'll check the active proposals in your DAO.

_Claude uses the `list_dao_proposals` tool with the following parameters:_

- daoAddress: "0x742a1fb11f68b532db9c6494376c4e7a4fef4f24"
- status: "active"

**Claude:** There are 2 active proposals in the Community Fund DAO:

1. **Fund Developer Grants** (ID: 0x3d7c9e6f)
   - Description: Allocate 10,000 USDC to support developers building on our platform
   - Voting ends: [date 5 days from now]
   - Current votes: For: 100,000 (67%), Against: 50,000 (33%)
   - Quorum: 75% reached (100,000/150,000 required)

2. **Treasury diversification** (ID: 0x1234)
   - Description: Proposal to diversify treasury holdings across stablecoins
   - Voting ends: [date 2 days from now]
   - Current votes: For: 100,000 (63%), Against: 50,000 (31%), Abstain: 10,000 (6%)
   - Quorum: 100% reached (160,000/100,000 required)

### Viewing Proposal Details

**You:** Show me more details about the Fund Developer Grants proposal.

**Claude:** I'll get the detailed information for that proposal.

_Claude uses the `get_dao_proposal_details` tool with the following parameters:_

- proposalId: "0x3d7c9e6f"
- daoAddress: "0x742a1fb11f68b532db9c6494376c4e7a4fef4f24"

**Claude:** Here are the details for the "Fund Developer Grants" proposal (ID: 0x3d7c9e6f):

**Basic Information:**
- Title: Fund Developer Grants
- Description: Allocate 10,000 USDC to support developers building on our platform
- Status: Active
- Created by: 0xabcd...1234
- Start time: [date]
- End time: [date 5 days from creation]

**Voting Progress:**
- For: 100,000 votes (67%)
- Against: 50,000 votes (33%)
- Voter participation: 65% of eligible voters
- Quorum requirement: 150,000 votes (75% reached)

**Top Voters:**
- 0xaaaa...1111: 50,000 votes (For)
- 0xdddd...4444: 50,000 votes (Against)
- 0xbbbb...2222: 30,000 votes (For)
- 0xcccc...3333: 20,000 votes (For)

**Actions if Passed:**
- Transfer 10,000 USDC from treasury to developer grants wallet (0x9876...5432)

### Casting a Vote

**You:** I want to vote "For" on the Fund Developer Grants proposal because I believe supporting developers is crucial for our ecosystem growth.

**Claude:** I'll cast your vote on the proposal.

_Claude uses the `cast_dao_vote` tool with the following parameters:_

- proposalId: "0x3d7c9e6f"
- optionIndex: 1
- reason: "I believe supporting developers is crucial for our ecosystem growth"
- daoAddress: "0x742a1fb11f68b532db9c6494376c4e7a4fef4f24"

**Claude:** Your vote has been cast successfully on the "Fund Developer Grants" proposal.

Vote details:
- Your vote: For
- Proposal ID: 0x3d7c9e6f
- Reason: "I believe supporting developers is crucial for our ecosystem growth"

Your voting power has been added to the tally, and your vote is now recorded on-chain.

## Tips for Effective Use

1. **Be specific in your requests** - Provide all necessary details when asking Claude to perform blockchain operations.

2. **Verify sensitive operations** - Double-check addresses and amounts when transferring funds or deploying contracts.

3. **Use testnet for experiments** - Always use the Base Sepolia testnet for experimentation and development before moving to mainnet.

4. **Keep your configuration secure** - Remember that your Claude Desktop configuration contains sensitive information. Keep it secure and don't share it.

5. **Understand gas costs** - Be aware that blockchain transactions require gas fees. Make sure you have enough ETH to cover these fees.

6. **Verify contract interactions** - When interacting with smart contracts, verify the contract address and function parameters before confirming transactions.

7. **Use onramp responsibly** - When onramping funds, be aware of any fees or limits that may apply.
