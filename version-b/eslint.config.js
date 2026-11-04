// ESLint flat config for version B's browser scripts (IIFEs concatenated by Gulp, no modules)
// and the Node tooling (gulpfile, scripts, tests).
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['public/**', 'vendor/**', 'node_modules/**', 'storage/**', 'test-results/**'] },
  js.configs.recommended,
  {
    files: ['resources/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: { ...globals.browser, jQuery: 'readonly' },
    },
    rules: {
      strict: ['error', 'function'],
      'no-var': 'off',
      eqeqeq: 'error',
      'no-implicit-globals': 'error',
    },
  },
  {
    files: ['gulpfile.mjs', 'scripts/**/*.mjs', 'tests/js/**/*.mjs', 'eslint.config.js', 'e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.node } },
  },
];
