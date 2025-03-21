import { generateTool } from '../../utils.js';
import { erc721BalanceHandler, erc721TransferHandler } from './handlers.js';
import { Erc721BalanceSchema, Erc721TransferSchema } from './schemas.js';

export const erc721BalanceTool = generateTool({
  name: 'erc721_balance',
  description: 'Get the balance of NFTs owned by an address',
  inputSchema: Erc721BalanceSchema,
  toolHandler: erc721BalanceHandler,
});

export const erc721TransferTool = generateTool({
  name: 'erc721_transfer',
  description: 'Transfer an NFT to another address',
  inputSchema: Erc721TransferSchema,
  toolHandler: erc721TransferHandler,
}); 