import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

// ESLint settings for the Toonverse client. Run with `npm run lint` from the repository root.
export default [
  // Built files are not linted.
  { ignores: ['dist/'] },

  // ESLint's recommended rules for all JavaScript.
  js.configs.recommended,

  // React rules, and the setting for React 17+'s automatic JSX (no `import React` needed).
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // Rules that catch incorrect use of React hooks.
  reactHooks.configs.flat.recommended,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Security: never render HTML from a string (task 13.7 relies on this rule).
      'react/no-danger': 'error',
      // Toonverse does not use the prop-types library (and is JavaScript, not TypeScript).
      'react/prop-types': 'off',
    },
  },

  // Last: turn off any rule that would disagree with Prettier's formatting.
  prettier,
];
