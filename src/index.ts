import type { Linter } from 'eslint';

import { noInlineInterfaceObjectTypesRule, noInlineInterfaceObjectTypesRuleName } from './rules';

// Plugin metadata — kept in sync with package.json
const pluginName = 'eslint-plugin-lintlord';
const pluginVersion = '1.0.1';

// ---------------------------------------------------------------------------
// Plugin object
// ---------------------------------------------------------------------------

const rules = {
  [noInlineInterfaceObjectTypesRuleName]: noInlineInterfaceObjectTypesRule,
};

const plugin = {
  meta: {
    name: pluginName,
    version: pluginVersion,
  },
  rules,
  configs: {
    recommended: {} as Linter.Config,
    strict: {} as Linter.Config,
  } satisfies Record<string, Linter.Config>,
};

// ---------------------------------------------------------------------------
// Built-in configs (reference the plugin itself)
// ---------------------------------------------------------------------------

/**
 * Recommended config: all rules at "warn" severity.
 * Suitable for gradual adoption.
 */
const recommended: Linter.Config = {
  name: 'lintlord/recommended',
  plugins: {
    lintlord: plugin as any,
  },
  rules: {
    [`lintlord/${noInlineInterfaceObjectTypesRuleName}`]: 'warn',
  },
};

/**
 * Strict config: all rules at "error" severity with autofix enabled.
 * For teams that want hard enforcement.
 */
const strict: Linter.Config = {
  name: 'lintlord/strict',
  plugins: {
    lintlord: plugin as any,
  },
  rules: {
    [`lintlord/${noInlineInterfaceObjectTypesRuleName}`]: ['error', { autofix: true }],
  },
};

plugin.configs = {
  recommended,
  strict,
};

export default plugin;

// Named exports for convenience
export { rules };

export { noInlineInterfaceObjectTypesRule, noInlineInterfaceObjectTypesRuleName } from './rules';
