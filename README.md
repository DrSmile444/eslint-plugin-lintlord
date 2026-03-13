<p align="center">
  <img src="docs/public/logo.svg" alt="eslint-plugin-lintlord logo" width="160" />
</p>

<h1 align="center">ESLint Plugin Lintlord</h1>

<p align="center">
  Practical ESLint rules for TypeScript teams that want clearer types, cleaner logging habits, and code that is easier to review.
</p>

<p align="center">
  <a href="https://drsmile444.github.io/eslint-plugin-lintlord/">Documentation</a> •
  <a href="#installation">Install</a> •
  <a href="#usage">Usage</a> •
  <a href="#rule-overview">Rule overview</a>
</p>

---

## Why

Many codebases drift in two predictable ways:

```ts
interface LogsData {
  events: Array<{ name: string; createdAt: string }>;
}

function handleUpdate(params: { id: string; dryRun: boolean }) {
  console.log('updating', params.id);
}
```

Both patterns are convenient in the moment, but they age badly:

- **Shapes become hard to reuse** when the same object structure appears in multiple places.
- **Types get harder to scan** because important contracts are buried inside properties, parameters, and return types.
- **Debug leftovers slip into commits** because `console.log` is fast to add and easy to forget.
- **Logging intent gets muddled** when debugging output and intentional runtime messages look the same.
- **Refactoring is less ergonomic** because named interfaces are easier to jump to, rename, and discuss in code review.
- **Consistency drifts over time** when some teams extract types, some keep them inline, and console usage varies by file.

`eslint-plugin-lintlord` exists to enforce a small set of practical rules with clear payoffs:

- When an object shape matters, give it a name.
- When a log statement matters, make it intentional.

It is a good fit for teams that want:

- More readable TypeScript APIs
- Reusable interface contracts instead of duplicated `{ ... }` shapes
- Fewer accidental `console.log` leftovers in committed code
- Clearer separation between debugging output and real logging
- Better IDE navigation and review discussions
- Gradual adoption for type cleanup, or strict autofix-driven enforcement

---

## What it does

The plugin ships focused rules that target common TypeScript and JavaScript code problems:

| Rule                                                                                                                           | Description                                                                    | Fixable | Recommended | Strict   |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------- | ----------- | -------- |
| [no-inline-interface-object-types](https://drsmile444.github.io/eslint-plugin-lintlord/rules/no-inline-interface-object-types) | Disallow inline object type literals and extract them to named interfaces      | ✅      | ⚠️ warn     | ❌ error |
| [prefer-logger](https://drsmile444.github.io/eslint-plugin-lintlord/rules/prefer-logger)                                       | Disallow `console.log` (or all `console` calls) in favor of a dedicated logger | 💡      | ❌ error    | ❌ error |

`no-inline-interface-object-types` checks inline object types inside:

- Interface properties
- Function parameters
- Method parameters
- Arrow function parameters
- Return types

When enabled with `autofix: true`, it can extract those inline shapes into generated interface names for you.

`prefer-logger` targets two common logging policies:

- `mode: 'log-only'` flags only `console.log` and suggests `console.info`
- `mode: 'all'` bans all `console.*` calls for teams using a dedicated logger

---

## Examples

### Type extraction

```ts
// Before
interface LogsData {
  events: Array<{ name: string; createdAt: string }>;
}

function handleUpdate(params: { id: string; dryRun: boolean }) {
  return { ok: !params.dryRun };
}

// After
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

### Logging hygiene

```ts
// Before
console.log('server started on port', port);

// After
console.info('server started on port', port);
```

Or, in stricter teams:

```ts
// Before
console.warn('deprecated endpoint');

// After
logger.warn('deprecated endpoint');
```

The core benefit of the plugin is consistency in places where codebases usually drift: shared types and logging habits.

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
      'lintlord/prefer-logger': ['error', { mode: 'log-only' }],
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
    "lintlord/no-inline-interface-object-types": "warn",
    "lintlord/prefer-logger": ["error", { "mode": "log-only" }]
  }
}
```

---

## Configs

| Config        | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| `recommended` | Enables `no-inline-interface-object-types` at `warn` and `prefer-logger` at `error` |
| `strict`      | Enables `no-inline-interface-object-types` at `error` with `autofix: true`, and `prefer-logger` at `error` with `mode: 'all'` |

`recommended` is a good default if you want gradual type cleanup while still treating stray `console.log` calls as committed-code mistakes.

`strict` is better when your team already agrees on both patterns and wants automatic type extraction plus full logger enforcement.

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

### `prefer-logger`

Flags `console.log` as a debugging leftover and pushes toward intentional logging:

```js
// ❌ reported — debug leftover
console.log('user id:', userId);

// ✅ allowed — intentional output (log-only mode default)
console.info('server started on port 3000');
```

A suggestion replaces `console.log` with `console.info`. For teams using a dedicated logger (pino, winston), set `mode: 'all'` to ban every `console.*` call.

Useful options:

- `mode: 'log-only'` (default): restrict only `console.log`, suggest `console.info`
- `mode: 'all'`: restrict all `console.*` methods — enforce a dedicated logger

More examples and complete option details:

- [Rule docs](https://drsmile444.github.io/eslint-plugin-lintlord/rules/prefer-logger)

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
