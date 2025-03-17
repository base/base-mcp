#!/usr/bin/env node

/**
 * Test script for Base MCP Server
 *
 * This script tests the Base MCP server by running it and sending a request to get the wallet address.
 * It helps verify that the server is configured correctly and can be used with Claude.
 *
 * Usage:
 *   node test-mcp.js
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config();

// Check if required environment variables are set
const requiredEnvVars = [
  'COINBASE_API_KEY_NAME',
  'COINBASE_API_PRIVATE_KEY',
  'SEED_PHRASE',
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);
if (missingEnvVars.length > 0) {
  console.error(
    `Error: Missing required environment variables: ${missingEnvVars.join(', ')}`,
  );
  console.error(
    'Please make sure these variables are set in your .env file or environment.',
  );
  process.exit(1);
}

// Path to the built MCP server
const serverPath = path.join(__dirname, 'build', 'index.js');

// Check if the server file exists
if (!fs.existsSync(serverPath)) {
  console.error(`Error: Server file not found at ${serverPath}`);
  console.error(
    'Please make sure you have built the project with "npm run build".',
  );
  process.exit(1);
}

console.log('Starting Base MCP server test...');

// Start the MCP server
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env,
});

// Handle server output
server.stderr.on('data', (data) => {
  console.log(`[Server Log] ${data.toString().trim()}`);
});

// Wait for server to start
setTimeout(() => {
  console.log('\nSending test request to get wallet address...');

  // Send a request to get the wallet address
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'listTools',
    params: {},
  };

  server.stdin.write(`${JSON.stringify(request)}\n`);

  // Listen for response
  server.stdout.on('data', (data) => {
    try {
      const response = JSON.parse(data.toString().trim());
      console.log('\nServer response:');
      console.log(JSON.stringify(response, null, 2));

      if (response.result?.tools) {
        console.log(
          '\n✅ Test successful! The Base MCP server is working correctly.',
        );
        console.log('Available tools:');
        for (const tool of response.result.tools) {
          console.log(`- ${tool.name}: ${tool.description}`);
        }
      } else {
        console.log('\n❌ Test failed. Unexpected response from server.');
      }

      // Now try to get the wallet address
      console.log('\nTesting get-address tool...');
      const addressRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'callTool',
        params: {
          name: 'get-address',
          arguments: {},
        },
      };

      server.stdin.write(`${JSON.stringify(addressRequest)}\n`);

      // We'll handle this response in the next data event
    } catch (error) {
      console.error('Error parsing server response:', error);
    }
  });

  // Set a timeout to terminate the test
  setTimeout(() => {
    console.log('\nTest complete. Terminating server.');
    server.kill();
    process.exit(0);
  }, 5000);
}, 2000);

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle server exit
server.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Server exited with code ${code}`);
    process.exit(1);
  }
});
