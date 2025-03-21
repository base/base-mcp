import { generateTool } from '../../utils.js';
import { transactionStatusHandler } from './handlers.js';
import { TransactionStatusSchema } from './schemas.js';

/**
 * Transaction Status Tool
 * Allows checking the status and details of a transaction by its hash
 */
export const transactionStatusTool = generateTool({
  name: 'transaction_status',
  description: 'Check the status of a previously submitted transaction',
  inputSchema: TransactionStatusSchema,
  toolHandler: transactionStatusHandler,
}); 