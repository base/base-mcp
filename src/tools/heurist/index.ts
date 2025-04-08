import { generateTool } from '../../utils.js';
import { buyHeuristCreditsHandler } from './handlers.js';
import { BuyHeuristCreditsSchema } from './schemas.js';

export const buyHeuristCreditsTool = generateTool({
  name: 'buy_heurist_credits',
  description: 'Purchase Heurist API credits with cryptocurrency on Base chain',
  inputSchema: BuyHeuristCreditsSchema,
  toolHandler: buyHeuristCreditsHandler,
}); 