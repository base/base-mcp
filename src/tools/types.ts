/**
 * Patches for Onramp
 */

type OnrampPaymentMethod = {
  id: string;
};

type OnrampConfigResponseData = {
  countries: OnrampConfigCountry[];
};

type OnrampConfigCountry = {
  id: string;
  subdivisions: string[];
  paymentMethods: OnrampPaymentMethod[];
};

type TokenNetwork = {
  name: string;
  display_name: string;
  contract_address: string;
  chain_id: string;
  icon_url: string;
};

type TokenInfo = {
  id: string;
  name: string;
  symbol: string;
  networks: TokenNetwork[];
  icon_url: string;
};

export type PatchedOnrampConfigResponseData = OnrampConfigResponseData & {
  purchase_currencies: TokenInfo[];
};

/**
 * OpenRouter types
 */

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
