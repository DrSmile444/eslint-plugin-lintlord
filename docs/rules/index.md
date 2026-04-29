# Rules

## Overview

All rules provided by `eslint-plugin-lintlord`:

| Rule                                                                        | Description                                                                    | 🔧 Fixable    | Recommended | Strict   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------- | ----------- | -------- |
| [no-inline-interface-object-types](/rules/no-inline-interface-object-types) | Disallow inline object type literals; extract to named interfaces              | ✅            | ⚠️ warn     | ❌ error |
| [prefer-logger](/rules/prefer-logger)                                       | Disallow `console.log` (or all `console` calls) in favor of a dedicated logger | 💡 suggestion | ❌ error    | ❌ error |

## Configs

### `recommended`

Some rules enabled at **warn** level with no autofix. Good for gradual adoption and teams that want to review fixes before applying.

```js
import lintlord from 'eslint-plugin-lintlord';

export default [lintlord.configs.recommended];
```

### `strict`

All rules enabled at **error** level with autofix enabled. For teams that want hard enforcement.

```js
import lintlord from 'eslint-plugin-lintlord';

export default [lintlord.configs.strict];
```
