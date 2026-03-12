# Changelog

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
