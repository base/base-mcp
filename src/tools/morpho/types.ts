export type MorphoVault = {
  asset: {
    address: string;
    name: string;
    symbol: string;
  };
  address: string;
  name: string;
  liquidity: {
    usd: number;
    underlying: number;
  };
  metadata: {
    description: string;
    forumLink: string;
  };
  riskAnalysis: Array<{
    provider?: string;
    score?: number;
  }>;
};

export type MorphoVaultsResponse = {
  vaults: {
    items: MorphoVault[];
  };
};
