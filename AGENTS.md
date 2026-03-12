# AGENTS.md

## Setup

- Node: 22.x
- Package mgr: npm
- Install: `npm install`
- Build: `npm run build`
- Test (unit, vitest): `npm test`
- Lint (type-aware): `npm lint`
- Typecheck: `npm run typecheck`

## Coding conventions

- TypeScript strict mode
- ESM first (type: module)
- ESLint rules are authoritative; fix before commit
- Commits: Conventional Commits; PRs must pass CI

## Tests

- Unit: Vitest with @typescript-eslint/rule-tester
- Each rule has its own test file in `tests/rules/<rule-name>/`
- Cover valid + invalid cases, autofix, suggestions, all options
- Run `npm test` to execute all tests

## Quick repo health checks

- `npm run typecheck && npm test`
- `npm run build` (ensures all packages compile)
