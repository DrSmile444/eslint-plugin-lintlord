# Flat Config (ESLint v9+)

## Using the plugin directly

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

## Using built-in configs

### Recommended

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

### Strict

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

## Combining with other configs

```js
// eslint.config.mjs
import eslint from '@eslint/js';
import lintlord from 'eslint-plugin-lintlord';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  lintlord.configs.recommended,
);
```

