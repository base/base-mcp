import { generateTool } from '../../utils.js';
import { getOnrampAssetsHandler, onrampHandler } from './handlers.js';
import { GetOnrampAssetsSchema, OnrampSchema } from './schemas.js';

export const getOnrampAssetsTool = generateTool({
  name: 'get_onramp_assets',
  description: 'Get the assets available for onramp',
  inputSchema: GetOnrampAssetsSchema,
  toolHandler: getOnrampAssetsHandler,
});

export const onrampTool = generateTool({
  name: 'onramp',
  description: 'Onramp a specific asset',
  inputSchema: OnrampSchema,
  toolHandler: onrampHandler,
});
