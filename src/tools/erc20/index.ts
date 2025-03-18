import { generateTool } from '../../utils.js';
import { erc20BalanceHandler, erc20TransferHandler } from './handlers.js';
import { Erc20BalanceSchema, Erc20TransferSchema } from './schemas.js';

export const erc20BalanceTool = generateTool({
  name: 'erc20_balance',
  description: 'Get the balance of an ERC20 token',
  inputSchema: Erc20BalanceSchema,
  toolHandler: erc20BalanceHandler,
});

export const erc20TransferTool = generateTool({
  name: 'erc20_transfer',
  description: 'Transfer an ERC20 token',
  inputSchema: Erc20TransferSchema,
  toolHandler: erc20TransferHandler,
});
