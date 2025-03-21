import { generateTool } from '../../utils.js';
import { getAddressTransactionsHandler } from './handlers.js';
import { GetAddressTransactionsSchema } from './schemas.js';

export const getAddressTransactionsTool = generateTool({
  name: 'etherscan_address_transactions',
  description: 'Gets a list of transactions for an address using Etherscan API',
  inputSchema: GetAddressTransactionsSchema,
  toolHandler: getAddressTransactionsHandler,
});
