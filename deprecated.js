#!/usr/bin/env node

const message = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   base-mcp has been DEPRECATED.                              ║
║                                                              ║
║   For the new Base AI Agents docs and tools, visit:          ║
║   https://docs.base.org/ai-agents                            ║
║                                                              ║
║   Do not use this package. It is no longer maintained.        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

console.warn(message);
process.exit(0);
