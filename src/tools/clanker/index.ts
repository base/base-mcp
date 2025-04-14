import { generateTool } from '../../utils.js';
import { clankerDeployHandler } from './handlers.js';
import { ClankerDeploySchema } from './schemas.js';

export const clankerTool = generateTool({
  name: 'deploy_clanker_token',
  description: 'Deploy a new token using the Clanker SDK',
  inputSchema: ClankerDeploySchema,
  toolHandler: clankerDeployHandler,
}); 