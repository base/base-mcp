import { generateTool } from '../../utils.js';
import { callContractHandler } from './handlers.js';
import { CallContractSchema } from './schemas.js';

export const callContractTool = generateTool({
  name: 'call_contract',
  description: 'Call a contract function',
  inputSchema: CallContractSchema,
  toolHandler: callContractHandler,
});
