import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      'scripts/**',
      '.yarn/**',
      '**/*.json',
      '**/*.md',
    ],
  },
  {
    rules: {
      // Disallow console.log but allow console.error, console.warn, and console.info
      'no-console': ['error', { allow: ['error', 'warn', 'info'] }],

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  // Make sure Prettier config is last to override other formatting rules
  prettierConfig,
];
