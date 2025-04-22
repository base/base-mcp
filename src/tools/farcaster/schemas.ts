import { z } from 'zod';

export const FarcasterUsernameSchema = z.object({
  username: z
    .string()
    .describe('The Farcaster username to resolve to an Ethereum address'),
});
