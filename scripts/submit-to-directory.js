#!/usr/bin/env node

/**
 * Submit Base MCP to the MCP Directory
 *
 * This script helps you submit your Base MCP to the MCP Directory,
 * making it discoverable by other developers.
 *
 * Usage:
 *   node submit-to-directory.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Get package info
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log(`
=================================================
Submit ${packageJson.name} to the MCP Directory
=================================================

This script will help you submit your MCP server to the
Model Context Protocol Directory, making it discoverable
by other developers.

Before proceeding, make sure:
1. Your package is published to npm
2. Your GitHub repository is public
3. You have a GitHub account

`);

rl.question('Do you want to proceed? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Submission cancelled.');
    rl.close();
    return;
  }

  console.log('\nPreparing submission...\n');

  // Check if package is published to npm
  try {
    const npmInfo = execSync(`npm view ${packageJson.name} --json`, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log('✅ Package found on npm registry');
  } catch (error) {
    console.error(
      '❌ Package not found on npm registry. Please publish your package first:',
    );
    console.error('   npm login');
    console.error('   npm publish');
    rl.close();
    return;
  }

  // Check if GitHub repository exists
  if (!packageJson.repository || !packageJson.repository.url) {
    console.error('❌ No GitHub repository URL found in package.json');
    console.error('   Please add a "repository" field to your package.json');
    rl.close();
    return;
  }

  const repoUrl = packageJson.repository.url;
  console.log(`✅ GitHub repository: ${repoUrl}`);

  // Prepare submission data
  const submissionData = {
    name: packageJson.name,
    description: packageJson.description || '',
    version: packageJson.version,
    repository: repoUrl,
    author: packageJson.author || '',
    license: packageJson.license || '',
    keywords: packageJson.keywords || [],
    tools: [
      'get-address',
      'get-testnet-eth',
      'list-balances',
      'transfer-funds',
      'deploy-contract',
    ],
  };

  // Save submission data to a file
  const submissionFile = path.join(
    process.cwd(),
    'mcp-directory-submission.json',
  );
  fs.writeFileSync(submissionFile, JSON.stringify(submissionData, null, 2));

  console.log(`\n✅ Submission data saved to ${submissionFile}`);
  console.log('\nNext steps:');
  console.log(
    '1. Fork the MCP Directory repository: https://github.com/modelcontextprotocol/directory',
  );
  console.log(
    '2. Add your MCP server to the directory using the data in mcp-directory-submission.json',
  );
  console.log('3. Submit a pull request to the MCP Directory repository');
  console.log('\nThank you for contributing to the MCP ecosystem!');

  rl.close();
});
