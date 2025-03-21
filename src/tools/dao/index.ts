import { generateTool } from "../../utils.js";
import {
  createProposalHandler,
  getProposalsHandler,
  getProposalDetailsHandler,
  castVoteHandler,
  createDaoHandler,
} from "./handlers.js";
import {
  CreateProposalSchema,
  GetProposalsSchema,
  GetProposalDetailsSchema,
  CastVoteSchema,
  CreateDaoSchema,
} from "./schemas.js";

/**
 * Tool for creating a new DAO proposal
 */
export const createProposalTool = generateTool({
  name: "create_dao_proposal",
  description: "Create a new proposal for DAO voting",
  inputSchema: CreateProposalSchema,
  toolHandler: createProposalHandler,
});

/**
 * Tool for listing DAO proposals
 */
export const getProposalsTool = generateTool({
  name: "list_dao_proposals",
  description: "List all proposals for a DAO, with optional filtering by status",
  inputSchema: GetProposalsSchema,
  toolHandler: getProposalsHandler,
});

/**
 * Tool for getting detailed information about a specific proposal
 */
export const getProposalDetailsTool = generateTool({
  name: "get_dao_proposal_details",
  description: "Get detailed information about a specific DAO proposal, including votes and actions",
  inputSchema: GetProposalDetailsSchema,
  toolHandler: getProposalDetailsHandler,
});

/**
 * Tool for casting a vote on a proposal
 */
export const castVoteTool = generateTool({
  name: "cast_dao_vote",
  description: "Cast a vote on a DAO proposal",
  inputSchema: CastVoteSchema,
  toolHandler: castVoteHandler,
});

/**
 * Tool for creating a new DAO
 */
export const createDaoTool = generateTool({
  name: "create_dao",
  description: "Create a new DAO with specified governance settings",
  inputSchema: CreateDaoSchema,
  toolHandler: createDaoHandler,
}); 