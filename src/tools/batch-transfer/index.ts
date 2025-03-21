import { generateTool } from '../../utils.js';
import { batchTransferHandler } from './handlers.js';
import { BatchTransferSchema } from './schemas.js';

export const batchTransferTool = generateTool({
  name: 'erc20_batch_transfer',
  description: 'Batch transfer ERC20 tokens to multiple recipients in one transaction.',
  inputSchema: BatchTransferSchema,
  toolHandler: batchTransferHandler,
});
