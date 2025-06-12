import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import securityPlugin from 'eslint-plugin-security';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
      security: securityPlugin,
    },
    rules: {
      // Enable Prettier as an ESLint rule
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      'func-names': 'off',
    },
  },
];
