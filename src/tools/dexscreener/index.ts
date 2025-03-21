import { generateTool } from '../../utils.js';
import { tokenPriceHandler } from './handlers.js';
import { TokenPriceSchema } from './schemas.js';

export const tokenPriceTool = generateTool({
  name: 'token_price',
  description: 'Get price of any token',
  inputSchema: TokenPriceSchema,
  toolHandler: tokenPriceHandler,
});
