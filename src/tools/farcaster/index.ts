import { generateTool } from '../../utils.js';
import { farcasterUsernameHandler } from './handlers.js';
import { FarcasterUsernameSchema } from './schemas.js';

export const farcasterUsernameTool = generateTool({
    name: 'farcaster_username',
    description: 'Resolve a Farcaster username to an Ethereum address',
    inputSchema: FarcasterUsernameSchema,
    toolHandler: farcasterUsernameHandler,
}); 