import { generateTool } from '../../utils.js';
import { getMorphoVaultsHandler } from './handlers.js';
import { GetMorphoVaultsSchema } from './schemas.js';

export const getMorphoVaultsTool = generateTool({
  name: 'get_morpho_vaults',
  description: 'Get the vaults available for a particular asset on Morpho',
  inputSchema: GetMorphoVaultsSchema,
  toolHandler: getMorphoVaultsHandler,
});
