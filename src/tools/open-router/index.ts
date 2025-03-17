import { generateTool } from '../../utils.js';
import { buyOpenRouterCreditsHandler } from './handlers.js';
import { BuyOpenRouterCreditsSchema } from './schemas.js';

export const buyOpenRouterCreditsTool = generateTool({
  name: 'buy_openrouter_credits',
  description: 'Buy OpenRouter credits with USDC',
  inputSchema: BuyOpenRouterCreditsSchema,
  toolHandler: buyOpenRouterCreditsHandler,
});
