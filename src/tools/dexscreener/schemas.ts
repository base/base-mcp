import { z } from "zod";

export const TokenPriceSchema = z.object({
    contractAddress: z.string().describe("The contract address for which to get the price"),
});

export const TokenInfoQuerySchema = z.object({
    contractAddress: z.string().describe("The contract address of the token for which to get information"),
});