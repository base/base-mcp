# ERC721 NFT Support for Base MCP Server

## Overview
This PR adds comprehensive ERC721 (NFT) functionality to the MCP server, enabling interaction with any NFT collection on the Base chain. The implementation follows the same robust pattern as our existing ERC20 tools while adapting to the unique characteristics of non-fungible tokens.

## New Features

### 1. ERC721 Balance Check
- **Tool Name**: `erc721_balance`
- **Purpose**: Query the number of NFTs owned by an address from any ERC721 collection
- **Input Parameters**:
  - `contractAddress`: The ERC721 collection's contract address
- **Output**: Returns the total number of NFTs owned by the querying address
- **Example Use Case**: Checking how many NFTs a user owns from a specific collection

### 2. ERC721 Transfer
- **Tool Name**: `erc721_transfer`
- **Purpose**: Transfer a specific NFT to another address
- **Input Parameters**:
  - `contractAddress`: The ERC721 collection's contract address
  - `toAddress`: The recipient's address
  - `tokenId`: The specific NFT's unique identifier
- **Output**: Returns transaction hash and BaseScan URL for verification
- **Example Use Case**: Transferring a specific NFT to another wallet

## Technical Implementation

### Contract Integration
- Uses the standard ERC721 ABI from viem
- Supports all ERC721-compliant contracts on Base chain
- Implements proper address validation for both contract and recipient addresses

### Security Features
- Input validation using Zod schemas
- Address format verification
- Transaction simulation before execution
- Proper error handling for invalid inputs

### Chain Support
- Currently implemented for Base chain
- Uses BaseScan for transaction verification
- Ready for potential multi-chain expansion

## Testing
- All new functionality has been tested with:
  - Valid contract addresses
  - Invalid contract addresses
  - Valid/invalid recipient addresses
  - Various token IDs

## Usage Examples

### Checking NFT Balance
```typescript
const result = await erc721BalanceHandler(wallet, {
  contractAddress: "0x..." // NFT collection address
});
// Returns: "5" (if user owns 5 NFTs from this collection)
```

### Transferring an NFT
```typescript
const result = await erc721TransferHandler(wallet, {
  contractAddress: "0x...", // NFT collection address
  toAddress: "0x...",      // Recipient address
  tokenId: "123"           // Specific NFT to transfer
});
// Returns: { hash: "0x...", url: "https://basescan.org/..." }
```

## Future Enhancements
1. Add support for NFT metadata queries
2. Implement batch transfer functionality
3. Add support for ERC721Enumerable extensions
4. Add approval management tools
5. Support for other chains beyond Base

## Breaking Changes
None. This is a purely additive feature that doesn't affect existing functionality.

## Dependencies
- viem: For blockchain interaction
- zod: For input validation
- Base chain configuration

## Related Issues
Closes #XXX (if there's a related issue)

## Checklist
- [x] Added new ERC721 tools
- [x] Implemented proper error handling
- [x] Added input validation
- [x] Added transaction simulation
- [x] Added BaseScan integration
- [x] Updated documentation 