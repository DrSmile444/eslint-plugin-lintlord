# Changelog

## 1.2.0

### TypeScript 6 support

- Extended peer dependency support to TypeScript 6 (`^4 || ^5 || ^6`)
- Upgraded `@typescript-eslint/*` packages to 8.59.1 (supports TypeScript up to 6.x)

---

## 1.1.0 — 2026-03-12

### ✨ New Rule: `prefer-logger`

- Added [`prefer-logger`](/rules/prefer-logger) rule
  - `log-only` mode (default): flags `console.log` as a debug tool and suggests replacing it with `console.info` for intentional output
  - `all` mode: bans every `console.*` call, enforcing a dedicated logger (e.g. pino, winston)
  - Provides a one-click suggestion to upgrade `console.log` → `console.info` in `log-only` mode
  - Included in `recommended` config at `warn` with `mode: 'log-only'`
  - Included in `strict` config at `error` with `mode: 'all'`

---

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
