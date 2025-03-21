import { generateTool } from '../../utils.js';
import { callBuilderScoreHandler } from './handlers.js';
import { GetBuilderScoreSchema } from './schemas.js';

export const callBuilderScoreTool = generateTool({
  name: 'get_builder_score',
  description: 'Get the Talent Protocol Builder Score for a specific address',
  inputSchema: GetBuilderScoreSchema,
  toolHandler: callBuilderScoreHandler,
});
