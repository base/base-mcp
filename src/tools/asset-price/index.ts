import { generateTool } from '../../utils.js';
import { assetPriceHandler } from './handlers.js';
import { AssetPriceSchema } from './schemas.js';

/**
 * Tool for retrieving current prices of crypto assets
 */
export const assetPriceTool = generateTool({
  name: 'asset_price',
  description: 'Get current prices of crypto assets in a specified currency',
  inputSchema: AssetPriceSchema,
  toolHandler: assetPriceHandler,
});
