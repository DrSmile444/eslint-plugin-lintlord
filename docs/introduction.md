# Introduction

**eslint-plugin-lintlord** is a collection of practical ESLint rules designed to enforce cleaner, more maintainable TypeScript code patterns. Each rule addresses a real-world problem that developers encounter daily.

## Why Lintlord?

TypeScript gives you powerful type system features, but with great power comes great responsibility. It's easy to end up with:

- **Inline object types** scattered across interfaces, making them impossible to reuse
- **Deeply nested type literals** that hurt readability
- **Inconsistent type extraction** where some types are named and others aren't

Lintlord rules help you maintain consistency by catching these patterns automatically and providing intelligent fixes.

## Philosophy

1. **Every rule solves a real problem** — no theoretical rules that don't improve real codebases
2. **Autofix when possible** — rules should fix problems, not just report them
3. **Configurable** — every rule has options to match your team's preferences
4. **Well-tested** — comprehensive test suites ensure reliability
5. **Well-documented** — clear examples of what's allowed and what's not

## Current Rules

| Rule | Description |
|------|-------------|
| [no-inline-interface-object-types](/rules/no-inline-interface-object-types) | Disallow inline `{ ... }` object type literals and extract them to named interfaces |

## Getting Started

See the [Getting Started](/getting-started) guide for installation and configuration.

