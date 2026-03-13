import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe } from 'vitest';

import { preferLoggerRule, RULE_NAME } from '@rules/prefer-logger';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: false,
    },
  },
});

describe('prefer-logger', () => {
  // =======================================================================
  // VALID — log-only mode (default)
  // =======================================================================

  describe('valid — log-only mode (default)', () => {
    ruleTester.run(RULE_NAME, preferLoggerRule, {
      valid: [
        {
          name: 'console.info is allowed in log-only mode',
          code: "console.info('server started');",
        },
        {
          name: 'console.warn is allowed in log-only mode',
          code: "console.warn('deprecated API used');",
        },
        {
          name: 'console.error is allowed in log-only mode',
          code: "console.error('unhandled error', err);",
        },
        {
          name: 'console.debug is allowed in log-only mode',
          code: "console.debug('trace');",
        },
        {
          name: 'console.trace is allowed in log-only mode',
          code: 'console.trace();',
        },
        {
          name: 'custom logger call is allowed',
          code: "logger.info('user logged in');",
        },
        {
          name: 'no console call at all',
          code: 'const x = 1 + 2;',
        },
        {
          name: 'computed member expression on console is ignored',
          code: "console['log']('value');",
        },
      ],
      invalid: [],
    });
  });

  // =======================================================================
  // INVALID — log-only mode (default)
  // =======================================================================

  describe('invalid — log-only mode (default)', () => {
    ruleTester.run(RULE_NAME, preferLoggerRule, {
      valid: [],
      invalid: [
        {
          name: 'console.log with a string is reported',
          code: "console.log('debug value');",
          errors: [
            {
              messageId: 'noConsoleLog' as const,
              suggestions: [
                {
                  messageId: 'replaceWithConsoleInfo' as const,
                  output: "console.info('debug value');",
                },
              ],
            },
          ],
        },
        {
          name: 'console.log with no arguments is reported',
          code: 'console.log();',
          errors: [
            {
              messageId: 'noConsoleLog' as const,
              suggestions: [
                {
                  messageId: 'replaceWithConsoleInfo' as const,
                  output: 'console.info();',
                },
              ],
            },
          ],
        },
        {
          name: 'console.log with multiple arguments is reported',
          code: "console.log('id:', userId, 'value:', result);",
          errors: [
            {
              messageId: 'noConsoleLog' as const,
              suggestions: [
                {
                  messageId: 'replaceWithConsoleInfo' as const,
                  output: "console.info('id:', userId, 'value:', result);",
                },
              ],
            },
          ],
        },
        {
          name: 'console.log in a function body is reported',
          code: "function handle() { console.log('request received'); }",
          errors: [
            {
              messageId: 'noConsoleLog' as const,
              suggestions: [
                {
                  messageId: 'replaceWithConsoleInfo' as const,
                  output: "function handle() { console.info('request received'); }",
                },
              ],
            },
          ],
        },
        {
          name: 'multiple console.log calls each get their own error',
          code: "console.log('a');\nconsole.log('b');",
          errors: [
            {
              messageId: 'noConsoleLog' as const,
              suggestions: [{ messageId: 'replaceWithConsoleInfo' as const, output: "console.info('a');\nconsole.log('b');" }],
            },
            {
              messageId: 'noConsoleLog' as const,
              suggestions: [{ messageId: 'replaceWithConsoleInfo' as const, output: "console.log('a');\nconsole.info('b');" }],
            },
          ],
        },
      ],
    });
  });

  // =======================================================================
  // VALID — all mode (restrict everything)
  // =======================================================================

  describe('valid — all mode', () => {
    ruleTester.run(RULE_NAME, preferLoggerRule, {
      valid: [
        {
          name: 'custom logger.info call is allowed',
          options: [{ mode: 'all' }],
          code: "logger.info('server started');",
        },
        {
          name: 'pino logger call is allowed',
          options: [{ mode: 'all' }],
          code: "log.info({ userId }, 'request handled');",
        },
        {
          name: 'no console call at all',
          options: [{ mode: 'all' }],
          code: 'const ok = true;',
        },
        {
          name: 'computed member expression is ignored in all mode',
          options: [{ mode: 'all' }],
          code: "console['error']('oops');",
        },
      ],
      invalid: [],
    });
  });

  // =======================================================================
  // INVALID — all mode (restrict everything)
  // =======================================================================

  describe('invalid — all mode', () => {
    ruleTester.run(RULE_NAME, preferLoggerRule, {
      valid: [],
      invalid: [
        {
          name: 'console.log is reported in all mode',
          options: [{ mode: 'all' }],
          code: "console.log('debug');",
          errors: [{ messageId: 'noConsoleAll' as const }],
        },
        {
          name: 'console.info is reported in all mode',
          options: [{ mode: 'all' }],
          code: "console.info('server started');",
          errors: [{ messageId: 'noConsoleAll' as const }],
        },
        {
          name: 'console.warn is reported in all mode',
          options: [{ mode: 'all' }],
          code: "console.warn('deprecated');",
          errors: [{ messageId: 'noConsoleAll' as const }],
        },
        {
          name: 'console.error is reported in all mode',
          options: [{ mode: 'all' }],
          code: "console.error('fatal error');",
          errors: [{ messageId: 'noConsoleAll' as const }],
        },
        {
          name: 'console.debug is reported in all mode',
          options: [{ mode: 'all' }],
          code: "console.debug('trace');",
          errors: [{ messageId: 'noConsoleAll' as const }],
        },
        {
          name: 'multiple different console methods each get their own error',
          options: [{ mode: 'all' }],
          code: "console.log('a');\nconsole.warn('b');\nconsole.error('c');",
          errors: [{ messageId: 'noConsoleAll' as const }, { messageId: 'noConsoleAll' as const }, { messageId: 'noConsoleAll' as const }],
        },
        {
          name: 'console.log in a class method is reported in all mode',
          options: [{ mode: 'all' }],
          code: "class Service { run() { console.log('running'); } }",
          errors: [{ messageId: 'noConsoleAll' as const }],
        },
      ],
    });
  });

  // =======================================================================
  // EXPLICIT log-only option
  // =======================================================================

  describe('explicit log-only option', () => {
    ruleTester.run(RULE_NAME, preferLoggerRule, {
      valid: [
        {
          name: 'console.info is allowed when mode is explicitly log-only',
          options: [{ mode: 'log-only' }],
          code: "console.info('hello');",
        },
      ],
      invalid: [
        {
          name: 'console.log is reported when mode is explicitly log-only',
          options: [{ mode: 'log-only' }],
          code: "console.log('test');",
          errors: [
            {
              messageId: 'noConsoleLog' as const,
              suggestions: [
                {
                  messageId: 'replaceWithConsoleInfo' as const,
                  output: "console.info('test');",
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
