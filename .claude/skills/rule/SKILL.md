---
name: rule
description: Use this skill when adding a new ESLint rule to this repository. It covers rule implementation, exports, tests, documentation, changelog, README, version bumping, and final verification.
version: 1.0.0
---

# Skill: Add a New Rule

Use this skill when the task is to add a brand new ESLint rule to `eslint-plugin-lintlord`.

This skill is intentionally focused on the repository work needed to ship a rule. Do not repeat generic TypeScript guidance unless the task specifically needs it.

## Scope

A new rule is not complete until all of these are done:

- The rule exists under `src/rules/`
- The rule is exported from the plugin entrypoints
- The rule is covered with tests and the checks pass
- Documentation is updated across `docs/`
- `docs/reference/changelog.md` is updated
- `README.md` is updated
- `package.json` version is bumped
- `npm run format:md` is run after Markdown edits

## Repository shape to follow

Mirror the existing rule structure:

- `src/rules/<rule-name>/index.ts`
- `src/rules/<rule-name>/rule.ts`
- `src/rules/<rule-name>/types.ts`
- add `utils.ts` only if the rule actually needs reusable helpers
- `tests/rules/<rule-name>/<rule-name>.spec.ts`
- `docs/rules/<rule-name>.md`

Use `src/rules/no-inline-interface-object-types/` and `tests/rules/no-inline-interface-object-types/` as the reference implementation for file shape and test style.

## Mandatory workflow

### 1. Inspect current plugin entrypoints before editing

Read these files first:

- `package.json`
- `src/index.ts`
- `src/rules/index.ts`
- `docs/.vitepress/config.ts`
- `docs/rules/index.md`
- `docs/reference/changelog.md`
- `README.md`

Also search for current single-rule assumptions and explicit references to the existing rule name across `docs/`, `README.md`, and `src/`.

### 2. Create the rule implementation

Add the new rule under `src/rules/<rule-name>/`.

Implementation requirements:

- Keep the public export shape consistent with existing rules
- Define `RULE_NAME` in `rule.ts`
- Use `ESLintUtils.RuleCreator` with the docs URL pattern:
  `https://drsmile444.github.io/eslint-plugin-lintlord/rules/${name}`
- Keep schema, messages, and default options explicit
- Add `types.ts` for option and message-id types when the rule has options or non-trivial types
- Prefer a small `utils.ts` only when logic is large enough to justify separate testing

### 3. Export the rule from the plugin

Update both plugin export layers:

- `src/rules/index.ts`
- `src/index.ts`

`src/index.ts` must stay in sync with the published package:

- add the rule to the `rules` object
- include the rule in `recommended`
- include the rule in `strict`
- if the rule supports autofix, configure `strict` accordingly
- keep `pluginVersion` synchronized with `package.json`

### 4. Add tests that prove the rule works

Create `tests/rules/<rule-name>/<rule-name>.spec.ts`.

Minimum coverage expectations:

- valid cases
- invalid cases
- every option
- suggestions if the rule offers suggestions
- autofix output if the rule is fixable
- edge cases that could regress naming, ordering, comments, exports, or collisions

Test style:

- use `@typescript-eslint/rule-tester`
- match the existing suite organization with `describe(...)` sections
- make invalid cases assert exact messages and exact fixed output
- add separate utility tests only when logic is split into reusable helpers

The rule is not done until `npm test` passes.

### 5. Update documentation everywhere users discover rules

At minimum update:

- `docs/rules/<rule-name>.md` with purpose, invalid examples, valid examples, options, and configuration examples
- `docs/rules/index.md`
- `docs/.vitepress/config.ts`
- `docs/index.md`
- `docs/introduction.md`

Also review and update these when the new rule changes examples or rule lists:

- `docs/getting-started.md`
- `docs/usage/flat-config.md`
- `docs/usage/eslintrc.md`

Do not leave stale text like "ships one rule" or "current rule" anywhere in docs or README.

### 6. Update changelog and README

Required updates:

- add a new entry to `docs/reference/changelog.md`
- update `README.md` rule overview, usage snippets, config summaries, and any text that assumes the plugin has only one rule

For changelog entries:

- include the new version
- include the date in `YYYY-MM-DD` format
- summarize the new rule and any notable docs or config changes

### 7. Bump the version

Bump `package.json` after implementation and docs updates are complete.

Versioning rule for a new rule:

- default to a `minor` bump because a new rule is a backward-compatible feature
- use `major` only if the task explicitly introduces a breaking published change

After bumping `package.json`, sync the same version in `src/index.ts`.

### 8. Format and verify everything

Run these commands from the repo root:

```bash
npm run format:md
npm run typecheck
npm run lint
npm test
npm run build
npm run docs:build
```

If any command fails, fix the root cause before finishing.

## Definition of done

Do not stop early. A new rule is complete only when all of the following are true:

- [ ] Rule files created under `src/rules/<rule-name>/`
- [ ] Rule exported from `src/rules/index.ts`
- [ ] Plugin entrypoint updated in `src/index.ts`
- [ ] Tests added under `tests/rules/<rule-name>/`
- [ ] `npm test` passes
- [ ] Docs page added under `docs/rules/<rule-name>.md`
- [ ] Rules index and VitePress navigation updated
- [ ] Plugin-level docs and README updated
- [ ] `docs/reference/changelog.md` updated
- [ ] `package.json` version bumped
- [ ] `src/index.ts` plugin version synced
- [ ] `npm run format:md` run
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run docs:build` passes
