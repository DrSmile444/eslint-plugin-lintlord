# Getting Started

## Installation

```bash
npm install eslint-plugin-lintlord --save-dev
```

### Peer dependencies

Make sure you have ESLint and a TypeScript parser installed:

```bash
npm install eslint @typescript-eslint/parser typescript --save-dev
```

## Quick Setup (Flat Config — ESLint v9+)

```js
// eslint.config.mjs
import lintlord from 'eslint-plugin-lintlord';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      lintlord,
    },
    rules: {
      'lintlord/no-inline-interface-object-types': 'warn',
    },
  },
];
```

### Using a built-in config

```js
// eslint.config.mjs
import lintlord from 'eslint-plugin-lintlord';

export default [
  // "recommended" — safe way to refactor with a mix of "warn" and "error" rules, no autofix
  lintlord.configs.recommended,

  // or "strict" — all rules at "error" with autofix
  // lintlord.configs.strict,
];
```

## Legacy `.eslintrc` (ESLint v8)

See [Legacy .eslintrc](/usage/eslintrc) for configuration with the `.eslintrc` format.

## What's next?

- Browse all [Rules](/rules/)
- Learn about [Flat Config usage](/usage/flat-config) in detail
