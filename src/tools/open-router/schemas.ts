import { z } from 'zod';

export const BuyOpenRouterCreditsSchema = z.object({
  amountUsd: z.number().describe('The amount of credits to buy, in USD'),
});
