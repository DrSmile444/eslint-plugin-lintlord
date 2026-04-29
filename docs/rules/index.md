# Rules

## Overview

All rules provided by `eslint-plugin-lintlord`:

| Rule                                                                        | Description                                                       | Fixable | Recommended | Strict   |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------- | ----------- | -------- |
| [no-inline-interface-object-types](/rules/no-inline-interface-object-types) | Disallow inline object type literals; extract to named interfaces | ✅      | ⚠️ warn     | ❌ error |

## Configs

### `recommended`

All rules enabled at **warn** level. Good for gradual adoption.

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
