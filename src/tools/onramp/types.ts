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
