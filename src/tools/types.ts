/**
 * Patches for Onramp
 */

import type {
  OnrampConfigResponseData,
  OnrampOptionsResponseData,
} from "@coinbase/onchainkit/fund";

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

export type PatchedOnrampConfigResponseData = OnrampOptionsResponseData & {
  purchase_currencies: TokenInfo[];
};
