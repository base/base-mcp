import { z } from 'zod';

export const CheckReputationSchema = z.object({
  address: z
    .string()
    .describe('The Ethereum address to check CDP onchain reputation for'),
});
