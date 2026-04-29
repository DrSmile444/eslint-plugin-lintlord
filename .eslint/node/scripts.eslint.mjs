import { defineConfig } from 'eslint/config';

/**
 * @description ESLint overrides for CLI scripts under scripts/ and the VitePress docs site under docs/.
 * These are build/dev tools, not production code, so console output, process.exit(),
 * and devDependency imports are all expected here.
 * @author Dmytro Vakulenko
 */
export default defineConfig([
  {
    name: 'scripts/overrides',
    files: ['scripts/**/*'],
    rules: {
      'no-console': 'off',
      'lintlord/prefer-logger': 'off',
      'n/no-process-exit': 'off',
      'n/no-unpublished-import': 'off',
      // Scripts target the current Node runtime, not the package.json engines range
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unsupported-features/es-builtins': 'off',

      // Scripts are build tools; relaxed JSDoc requirements
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-yields': 'off',

      // Pre-existing patterns in scripts that predate the strict rules
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-conversion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      'promise/always-return': 'off',
      // Pre-existing regex patterns — not rewritten here
      'regexp/no-super-linear-backtracking': 'off',
      'security/detect-unsafe-regex': 'off',
      // Intentional empty callbacks (e.g. .catch(() => {}) to suppress errors)
      '@typescript-eslint/no-empty-function': 'off',
      // @tailwind directives inside JSDoc example blocks are not real JSDoc tags
      'jsdoc/check-tag-names': 'off',
    },
  },
  {
    name: 'docs/overrides',
    files: ['docs/**/*'],
    rules: {
      // VitePress config and theme files import devDependencies
      'n/no-unpublished-import': 'off',
      'import/no-extraneous-dependencies': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unsupported-features/es-builtins': 'off',
      // Docs config files are not library code — minimal JSDoc required
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
    },
  },
]);
