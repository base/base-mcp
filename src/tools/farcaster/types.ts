export type NeynarUserResponse = {
  result: {
    users: {
      fid: number;
      username: string;
      verified_addresses: {
        eth_addresses: string[];
        primary: {
          eth_address: string;
        };
      };
    }[];
  };
};
