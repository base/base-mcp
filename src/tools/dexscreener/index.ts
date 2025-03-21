import { generateTool } from '../../utils.js';
import { tokenInfoQueryHandler, tokenPriceHandler } from './handlers.js';
import { TokenInfoQuerySchema, TokenPriceSchema } from './schemas.js';

export const tokenPriceTool = generateTool({
  name: 'token_price',
  description: 'Get price of any token',
  inputSchema: TokenPriceSchema,
  toolHandler: tokenPriceHandler,
});

export const tokenInfoQuery = generateTool({
  name: 'token_info_query',
  description: 'Get the information of any token built on base',
  inputSchema: TokenInfoQuerySchema,
  toolHandler: tokenInfoQueryHandler,
});
