import { generateTool } from '../../utils.js';
import { analyzeNftCollectionHandler, mintNftHandler } from './handlers.js';
import { AnalyzeNftCollectionSchema, MintNftSchema } from './schemas.js';

// Tool for analyzing NFT collections
export const analyzeNftCollectionTool = generateTool({
  name: 'analyze_nft_collection',
  description: 'Analyze an NFT collection for floor price, volume, rarity, and other metrics',
  inputSchema: AnalyzeNftCollectionSchema,
  toolHandler: analyzeNftCollectionHandler,
});

// Tool for minting new NFTs
export const mintNftTool = generateTool({
  name: 'mint_nft',
  description: 'Mint a new NFT with specified metadata and image',
  inputSchema: MintNftSchema,
  toolHandler: mintNftHandler,
}); 