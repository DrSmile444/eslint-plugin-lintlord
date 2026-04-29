# prefer-logger

**Category:** Suggestion  
**Fixable:** No (suggestions only for `log-only` mode)

## What it does

Discourages the use of `console.log` (and optionally all `console` methods) in favor of intentional logging habits or a dedicated logger library.

The rule has two modes:

- **`log-only`** (default) — Only `console.log` is flagged. It is treated like a debugger statement: a tool for quick debugging that should not appear in committed code. A suggestion is provided to replace it with `console.info` for output that is genuinely intentional.
- **`all`** — Every `console.*` call is flagged. Use this when your team has adopted a dedicated logger (e.g. [pino](https://getpino.io/), [winston](https://github.com/winstonjs/winston)) and wants to eliminate all direct console usage.

## Why

`console.log` is the most common debugging leftover in codebases. It is easy to add during development and easy to forget before committing. When teams rely on logs for production observability, `console.log` is noisy and unstructured compared to a proper logger.

At the same time, `console.info`, `console.warn`, and `console.error` carry semantic meaning — they signal intent. Restricting only `console.log` lets teams keep meaningful console output while eliminating accidental debug noise.

For teams that go further and adopt structured logging (pino, winston, etc.), restricting all `console.*` calls enforces consistency and ensures every log statement goes through the configured logger.

## Examples

### `log-only` mode (default)

#### ❌ Invalid

```js
console.log('user id:', userId); // debug leftover
console.log(response);
```

#### ✅ Valid

```js
console.info('server started on port 3000'); // intentional
console.warn('rate limit approaching');
console.error('unhandled exception', err);
logger.info({ userId }, 'user logged in'); // dedicated logger
```

### `all` mode

#### ❌ Invalid

```js
console.log('debug');
console.info('server started'); // must use dedicated logger
console.warn('deprecated');
console.error('error', err);
```

#### ✅ Valid

```js
logger.info('server started');
logger.warn('deprecated API called');
logger.error({ err }, 'unhandled exception');
```

## Suggestion

In `log-only` mode, the rule provides a one-click suggestion to replace `console.log` with `console.info`:

```js
// Before (reported)
console.log('request received');

// After (applying suggestion)
console.info('request received');
```

## Options

```ts
interface PreferLoggerOptions {
  /**
   * Which console calls to restrict.
   * - 'log-only' — only console.log (default)
   * - 'all'      — all console.* methods
   */
  mode?: 'log-only' | 'all';
}
```

| Option | Type                  | Default      | Description                              |
| ------ | --------------------- | ------------ | ---------------------------------------- |
| `mode` | `'log-only' \| 'all'` | `'log-only'` | Controls which console calls are flagged |

## Configuration

### Flat config (ESLint v9+)

```js
// eslint.config.mjs
import lintlord from 'eslint-plugin-lintlord';

export default [
  {
    plugins: { lintlord },
    rules: {
      // Default: restrict only console.log
      'lintlord/prefer-logger': 'warn',

      // Strict: restrict all console methods
      'lintlord/prefer-logger': ['error', { mode: 'all' }],
    },
  },
];
```

### Legacy `.eslintrc`

```json
{
  "plugins": ["lintlord"],
  "rules": {
    "lintlord/prefer-logger": "warn",
    "lintlord/prefer-logger": ["error", { "mode": "all" }]
  }
}
```

## Built-in configs

| Config        | Severity | Options            |
| ------------- | -------- | ------------------ |
| `recommended` | `error`  | `mode: 'log-only'` |
| `strict`      | `error`  | `mode: 'all'`      |
