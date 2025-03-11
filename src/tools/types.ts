import type { Coinbase } from "@coinbase/coinbase-sdk";
import type { OnrampConfigResponseData } from "@coinbase/onchainkit/fund";

export type TransferFundsParams = {
  destination: string;
  assetId: string;
  amount: number;
};

export type DeployContractParams = {
  constructorArgs: string[];
  contractName: string;
  solidityInputJson: string;
  solidityVersion: string;
};

export type DeployNftParams = {
  name: string;
  symbol: string;
  baseURI: string;
};

export type DeployTokenParams = {
  name: string;
  symbol: string;
  totalSupply: number;
};

export type DeployMultiTokenParams = {
  uri: string;
};

export type GetOnrampConfigParams = {
  country: string;
  subdivision?: string;
};

export type OnrampParams = {
  amountUsd: number;
  assetId: string;
};

/**
 * Patches for Onramp
 */

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

export type TradeParams = {
  /** Amount of the from asset */
  amount: number;
  fromAssetId: string;
  toAssetId: string;
};
