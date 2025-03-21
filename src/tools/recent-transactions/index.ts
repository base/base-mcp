import { generateTool } from '../../utils.js';
import { recentTransactionsHandler } from './handlers.js';
import { RecentTransactionsSchema } from './schemas.js';

/**
 * Recent Transactions Tool
 * Fetches the latest transactions for a given wallet address
 */
export const recentTransactionsTool = generateTool({
  name: 'recent_transactions',
  description: 'Fetch the latest transactions for a given wallet address',
  inputSchema: RecentTransactionsSchema,
  toolHandler: recentTransactionsHandler,
});
