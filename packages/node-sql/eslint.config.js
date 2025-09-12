const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off', // Allow require() for dynamic imports
      
      // General rules
      'no-console': 'off',
      'no-unused-vars': 'off', // Use TypeScript version instead
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Import rules
      'no-undef': 'off', // TypeScript handles this
      
      // Disable import rules that aren't available
      'import/extensions': 'off',
      'import/first': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '*.d.ts',
    ],
  },
);