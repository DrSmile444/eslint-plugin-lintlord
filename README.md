<p align="center">
  <img src="docs/public/logo.svg" alt="eslint-plugin-lintlord logo" width="160" />
</p>

<h1 align="center">ESLint Plugin Lintlord</h1>

<p align="center">
  Practical ESLint rules for TypeScript teams that want cleaner types, reusable contracts, and code that is easier to review.
</p>

<p align="center">
  <a href="https://drsmile444.github.io/eslint-plugin-lintlord/">Documentation</a> •
  <a href="#installation">Install</a> •
  <a href="#usage">Usage</a> •
  <a href="#rule-overview">Rule overview</a>
</p>

---

## Why

TypeScript makes it easy to write inline object types:

```ts
interface LogsData {
  events: Array<{ name: string; createdAt: string }>;
}

function handleUpdate(params: { id: string; dryRun: boolean }) {}
```

That style is convenient at first, but it scales poorly:

- **Shapes become hard to reuse** when the same object structure appears in multiple places.
- **Types get harder to scan** because important contracts are buried inside properties, parameters, and return types.
- **Refactoring is less ergonomic** because named interfaces are easier to jump to, rename, and discuss in code review.
- **Consistency drifts over time** when some shapes are extracted and others stay inline.

`eslint-plugin-lintlord` exists to enforce a simple rule with a practical payoff: when an object shape matters, give it a name.

It is a good fit for teams that want:

- More readable TypeScript APIs
- Reusable interface contracts instead of duplicated `{ ... }` shapes
- Better IDE navigation and review discussions
- Gradual adoption with warnings first, or strict autofix-driven enforcement

---

## What it does

Today the plugin is intentionally focused. It ships one rule that targets one common TypeScript code smell:

| Rule | Description | Fixable | Recommended | Strict |
|------|-------------|---------|-------------|--------|
| [no-inline-interface-object-types](https://drsmile444.github.io/eslint-plugin-lintlord/rules/no-inline-interface-object-types) | Disallow inline object type literals and extract them to named interfaces | ✅ | ⚠️ warn | ❌ error |

The rule checks inline object types inside:

- Interface properties
- Function parameters
- Method parameters
- Arrow function parameters
- Return types

When enabled with `autofix: true`, it can extract those inline shapes into generated interface names for you.

---

## Example

### Before

```ts
interface LogsData {
  events: Array<{ name: string; createdAt: string }>;
}

function handleUpdate(params: { id: string; dryRun: boolean }) {
  return { ok: !params.dryRun };
}
```

### After

```ts
interface LogsDataEvent {
  name: string;
  createdAt: string;
}

interface LogsData {
  events: Array<LogsDataEvent>;
}

interface HandleUpdateParams {
  id: string;
  dryRun: boolean;
}

interface HandleUpdateReturn {
  ok: boolean;
}

function handleUpdate(params: HandleUpdateParams): HandleUpdateReturn {
  return { ok: !params.dryRun };
}
```

This is the core benefit of the plugin: code becomes more explicit without relying on reviewers to catch the pattern manually.

---

## Installation

```bash
npm install --save-dev eslint-plugin-lintlord
```

Install the usual TypeScript ESLint pieces as peer dependencies:

```bash
npm install --save-dev eslint @typescript-eslint/parser typescript
```

---

## Usage

### Option A: Flat config with the built-in preset

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
  },
  lintlord.configs.recommended,
];
```

### Option B: Flat config with explicit rule options

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
      'lintlord/no-inline-interface-object-types': [
        'warn',
        {
          minMembersToExtract: 2,
        },
      ],
    },
  },
];
```

### Option C: Strict autofix mode

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
  },
  lintlord.configs.strict,
];
```

### Option D: Legacy `.eslintrc` setup

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["lintlord"],
  "rules": {
    "lintlord/no-inline-interface-object-types": "warn"
  }
}
```

---

## Configs

| Config | Description |
|--------|-------------|
| `recommended` | Enables all rules at `warn` for gradual adoption |
| `strict` | Enables all rules at `error` and turns on `autofix` where supported |

`recommended` is a good default if you want the plugin to guide cleanup over time.

`strict` is better when your team already agrees on the pattern and wants `eslint --fix` to do most of the work.

---

## Rule overview

### `no-inline-interface-object-types`

The rule reports inline object literals such as:

```ts
function check(input: { value: string }) {}
```

and pushes code toward named interfaces:

```ts
interface CheckInput {
  value: string;
}

function check(input: CheckInput) {}
```

Useful options:

- `autofix`: automatically extract named interfaces during `eslint --fix`
- `minMembersToExtract`: allow very small inline shapes but extract larger ones
- `checkInterfaceProperties`, `checkFunctionParams`, `checkMethodParams`, `checkArrowFunctionParams`, `checkReturnTypes`: enable or disable specific contexts

More examples and complete option details:

- [Rule docs](https://drsmile444.github.io/eslint-plugin-lintlord/rules/no-inline-interface-object-types)
- [Flat config usage](https://drsmile444.github.io/eslint-plugin-lintlord/usage/flat-config)
- [Legacy config usage](https://drsmile444.github.io/eslint-plugin-lintlord/usage/eslintrc)

---

## Documentation

Full documentation is available at **[drsmile444.github.io/eslint-plugin-lintlord](https://drsmile444.github.io/eslint-plugin-lintlord/)**.

Useful entry points:

- **[Introduction](https://drsmile444.github.io/eslint-plugin-lintlord/introduction)** for the plugin philosophy
- **[Getting Started](https://drsmile444.github.io/eslint-plugin-lintlord/getting-started)** for setup
- **[Rules](https://drsmile444.github.io/eslint-plugin-lintlord/rules/)** for the full rule matrix

---

## Contributing

Contributions are welcome. If you want to propose a new rule or change behavior, open an issue first so the scope and rule design can be discussed before implementation.

---

## License

MIT © [Dmytro Vakulenko](https://github.com/DrSmile444) 🇺🇦
