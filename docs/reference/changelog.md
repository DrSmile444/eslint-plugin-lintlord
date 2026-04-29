# Changelog

## 1.1.0

### ESLint config modernisation & TypeScript 6 support

- Extended peer dependency support to TypeScript 6 (`^4 || ^5 || ^6`)
- Upgraded `@typescript-eslint/*` packages to 8.59.1 (supports TypeScript up to 6.x)
- Overhauled `.eslint/` configuration to mirror the `typescript-boilerplate` structure:
  - New `typescript/` subdirectory with dedicated configs for `tseslint-rules`, `naming`, `overrides`, `overrides-test`, `project`, and an aggregator `typescript.eslint.mjs`
  - New plugins integrated: `eslint-plugin-jsdoc`, `eslint-plugin-promise`, `eslint-plugin-regexp`, `eslint-plugin-depend`
  - Factory functions (`createNodeConfig`, `createTypescriptConfig`, `createProjectConfig`, `createImportAliasConfig`, `createOrderedImportsConfig`) for reusable config composition
  - TSConfig auto-discovery via `resolveTsconfigPath()` with a candidate list
  - New `scripts.eslint.mjs` override for build/dev scripts under `scripts/` and `docs/`
  - `considerDefaultExhaustiveForUnions: true` on `switch-exhaustiveness-check` so `default` clauses satisfy the rule
- Source code fixes for the new strict ruleset:
  - All AST node type comparisons updated to use `AST_NODE_TYPES.*` enum values
  - Replaced `||` with `??` (nullish coalescing) throughout the rule utilities
  - Removed dead-code guards that TypeScript type guarantees make impossible
  - Added JSDoc `@param` / `@returns` tags to all exported and non-trivial functions

## 1.0.0

### 🎉 Initial Release

- Added `no-inline-interface-object-types` rule
  - Detects inline object type literals in interface properties, function/method/arrow params, and return types
  - Provides intelligent autofix that extracts inline types to named interfaces
  - Smart naming strategy based on context (parent interface, function name, class name, etc.)
  - Conservative singularization for array property names
  - Name collision deduplication with numeric suffixes
  - Configurable: enable/disable per check category, set minimum members, toggle autofix
- Added `recommended` config (all rules at `warn`)
- Added `strict` config (all rules at `error` with autofix)
- Full VitePress documentation site
- Comprehensive test suite with 40+ test cases
