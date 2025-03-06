import type { Coinbase } from "@coinbase/coinbase-sdk";

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
