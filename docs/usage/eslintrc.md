# Legacy .eslintrc (ESLint v8)

::: warning
The `.eslintrc` format is deprecated in ESLint v9+. We recommend using the [flat config](/usage/flat-config) format instead.
:::

## Setup

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["lintlord"],
  "rules": {
    "lintlord/no-inline-interface-object-types": "warn"
  }
}
```

## With autofix

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["lintlord"],
  "rules": {
    "lintlord/no-inline-interface-object-types": ["error", { "autofix": true }]
  }
}
```
