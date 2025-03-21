import { generateTool } from '../../utils.js';
import {
  getAddressTransactionsHandler,
  getContractInfoHandler,
} from './handlers.js';
import {
  GetAddressTransactionsSchema,
  GetContractInfoSchema,
} from './schemas.js';

export const getAddressTransactionsTool = generateTool({
  name: 'etherscan_address_transactions',
  description: 'Gets a list of transactions for an address using Etherscan API',
  inputSchema: GetAddressTransactionsSchema,
  toolHandler: getAddressTransactionsHandler,
});

export const getContractInfoTool = generateTool({
  name: 'etherscan_contract_info',
  description: 'Gets contract information using Etherscan API',
  inputSchema: GetContractInfoSchema,
  toolHandler: getContractInfoHandler,
});
