import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

import type { MessageIds, PreferLoggerOptions } from './types';

export const RULE_NAME = 'prefer-logger';

const createRule = ESLintUtils.RuleCreator((name) => `https://drsmile444.github.io/eslint-plugin-lintlord/rules/${name}`);

/**
 * Returns true when the expression is a member access on the `console` global,
 * e.g. `console.log`, `console.info`.
 */
function isConsoleMemberExpression(node: TSESTree.MemberExpression): boolean {
  return node.object.type === 'Identifier' && node.object.name === 'console' && !node.computed;
}

export const preferLoggerRule = createRule<[PreferLoggerOptions], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `console.log` (and optionally all `console` calls) in favor of a dedicated logger or more intentional console methods.',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          mode: {
            type: 'string',
            enum: ['log-only', 'all'],
            description:
              "Which console calls to restrict. 'log-only' (default) restricts only console.log; 'all' restricts every console method.",
          },
        },
      },
    ],
    messages: {
      noConsoleLog:
        'Avoid `console.log` — it is a debug tool, not a logging solution. Use `console.info` for intentional output, or remove this debug statement.',
      noConsoleAll: 'Avoid direct `console` calls. Use a dedicated logger (e.g. pino, winston) for reliable, structured logging.',
      replaceWithConsoleInfo: 'Replace `console.log` with `console.info` for intentional logging.',
    },
  },
  defaultOptions: [{ mode: 'log-only' }],
  create(context) {
    const [rawOptions = {}] = context.options as [PreferLoggerOptions?];
    const mode = rawOptions.mode ?? 'log-only';

    return {
      CallExpression(node: TSESTree.CallExpression) {
        const { callee } = node;

        if (callee.type !== 'MemberExpression' || !isConsoleMemberExpression(callee)) {
          return;
        }

        const { property } = callee;

        if (property.type !== 'Identifier') {
          return;
        }

        const methodName = property.name;

        if (mode === 'log-only') {
          if (methodName !== 'log') {
            return;
          }

          context.report({
            node,
            messageId: 'noConsoleLog',
            suggest: [
              {
                messageId: 'replaceWithConsoleInfo',
                fix(fixer) {
                  return fixer.replaceText(property, 'info');
                },
              },
            ],
          });

          return;
        }

        // mode === 'all'
        context.report({ node, messageId: 'noConsoleAll' });
      },
    };
  },
});
