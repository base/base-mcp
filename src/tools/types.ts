/**
 * OpenRouter types
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { PublicActions, WalletClient } from 'viem';

export type OpenRouterTransferIntentResponse = {
  data: {
    id: string;
    created_at: string;
    expires_at: string;
    web3_data: {
      transfer_intent: {
        metadata: {
          chain_id: number;
          contract_address: string;
          sender: string;
        };
        call_data: {
          recipient_amount: string;
          deadline: string;
          recipient: string;
          recipient_currency: string;
          refund_destination: string;
          fee_amount: string;
          id: string;
          operator: string;
          signature: string;
          prefix: string;
        };
      };
    };
  };
};

export type ToolHandler = (
  wallet: WalletClient & PublicActions,
  // TODO: fix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any,
) => Promise<string>;

export type ToolWithHandler = {
  definition: Tool;
  handler: ToolHandler;
};
