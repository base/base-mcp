import { generateTool } from '../../utils.js';
import { checkReputationHandler } from './handlers.js';
import { CheckReputationSchema } from './schemas.js';

export const checkReputationTool = generateTool({
  name: 'check_onchain_reputation',
  description: 'Check the onchain reputation of an Ethereum address',
  inputSchema: CheckReputationSchema,
  toolHandler: checkReputationHandler,
});
