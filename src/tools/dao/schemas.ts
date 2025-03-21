import { z } from "zod";

/**
 * Schema for creating a new DAO proposal/vote
 */
export const CreateProposalSchema = z.object({
  title: z.string().describe("The title of the proposal"),
  description: z.string().describe("Detailed description of the proposal"),
  options: z.array(z.string()).min(2).describe("Voting options (at least 2)"),
  snapshotBlock: z.number().optional().describe("Block number for the voting power snapshot (optional)"),
  startTime: z.number().optional().describe("Unix timestamp when voting starts (optional, default: immediately)"),
  endTime: z.number().describe("Unix timestamp when voting ends"),
  quorum: z.number().optional().describe("Minimum percentage of total voting power required (optional)"),
  daoAddress: z.string().optional().describe("DAO contract address (optional, default: user's DAO if available)"),
  executionActions: z.array(
    z.object({
      target: z.string().describe("Contract address to call if proposal passes"),
      value: z.string().describe("ETH value to send with the call"),
      signature: z.string().describe("Function signature to call"),
      callData: z.string().describe("ABI-encoded call data"),
    })
  ).optional().describe("Actions to execute if proposal passes (optional)"),
});

/**
 * Schema for getting proposals/votes
 */
export const GetProposalsSchema = z.object({
  daoAddress: z.string().optional().describe("DAO contract address (optional)"),
  status: z.enum(["active", "pending", "closed", "all"]).optional().describe("Filter by proposal status (optional, default: all)"),
  limit: z.number().optional().describe("Maximum number of proposals to return (optional, default: 10)"),
  skip: z.number().optional().describe("Number of proposals to skip (optional, default: 0)"),
});

/**
 * Schema for getting a single proposal details
 */
export const GetProposalDetailsSchema = z.object({
  proposalId: z.string().describe("ID of the proposal to fetch"),
  daoAddress: z.string().optional().describe("DAO contract address (optional)"),
});

/**
 * Schema for casting a vote
 */
export const CastVoteSchema = z.object({
  proposalId: z.string().describe("ID of the proposal to vote on"),
  optionIndex: z.number().describe("Index of the option to vote for"),
  reason: z.string().optional().describe("Reason for the vote (optional)"),
  daoAddress: z.string().optional().describe("DAO contract address (optional)"),
});

/**
 * Schema for creating a new DAO
 */
export const CreateDaoSchema = z.object({
  name: z.string().describe("Name of the DAO"),
  tokenAddress: z.string().optional().describe("Governance token address (optional, if using token-based governance)"),
  members: z.array(
    z.object({
      address: z.string().describe("Member address"),
      votingPower: z.number().describe("Voting power/weight for this member"),
    })
  ).optional().describe("Initial members for multisig/membership DAO (optional)"),
  votingPeriod: z.number().optional().describe("Default voting period in seconds (optional)"),
  votingDelay: z.number().optional().describe("Default delay before voting starts in seconds (optional)"),
  quorumPercentage: z.number().optional().describe("Default minimum quorum percentage (optional)"),
  executionDelay: z.number().optional().describe("Delay before execution in seconds (optional)"),
}); 