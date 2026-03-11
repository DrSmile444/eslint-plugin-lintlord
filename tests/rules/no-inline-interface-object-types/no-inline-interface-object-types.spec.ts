import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe } from 'vitest';

import { noInlineInterfaceObjectTypesRule, RULE_NAME } from '@rules/no-inline-interface-object-types';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: false,
    },
  },
});

/**
 * Helper: build an error with suggestions (default / suggestion mode).
 * When `autofix` is off the rule emits suggestions, so the test must declare them.
 */
function errorWithSuggestion(expectedOutput: string) {
  return {
    messageId: 'inlineObjectType' as const,
    suggestions: [
      {
        messageId: 'extractSuggestion' as const,
        output: expectedOutput,
      },
    ],
  };
}

describe('no-inline-interface-object-types', () => {
  // =======================================================================
  // VALID CASES
  // =======================================================================

  describe('valid', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [
        // ---- Interface properties (already extracted) ----
        {
          name: 'interface property referencing a named type',
          code: `
            interface Event { name: string }
            interface LogsData { events: Event[] }
          `,
        },
        {
          name: 'interface property with primitive type',
          code: `
            interface User { name: string; age: number }
          `,
        },
        {
          name: 'interface property with union of primitives',
          code: `
            interface Config { value: string | number }
          `,
        },

        // ---- Function params (already extracted) ----
        {
          name: 'function with named type parameter',
          code: `
            interface Options { verbose: boolean }
            function run(options: Options) {}
          `,
        },
        {
          name: 'function with primitive parameter',
          code: `
            function greet(name: string) {}
          `,
        },

        // ---- Arrow function params ----
        {
          name: 'arrow function with named type parameter',
          code: `
            interface Config { debug: boolean }
            const init = (config: Config) => {};
          `,
        },

        // ---- Return types ----
        {
          name: 'function with named return type',
          code: `
            interface Result { ok: boolean }
            function check(): Result { return { ok: true }; }
          `,
        },

        // ---- Method params ----
        {
          name: 'method with named type parameter',
          code: `
            interface Payload { data: string }
            class Service {
              handle(payload: Payload) {}
            }
          `,
        },

        // ---- Options: minMembersToExtract ----
        {
          name: 'inline object with fewer members than minMembersToExtract',
          options: [{ minMembersToExtract: 3 }],
          code: `
            interface Data { field: { a: string; b: number } }
          `,
        },

        // ---- Options: disabled checks ----
        {
          name: 'inline object in interface property when checkInterfaceProperties is false',
          options: [{ checkInterfaceProperties: false }],
          code: `
            interface Data { field: { a: string } }
          `,
        },
        {
          name: 'inline object in function param when checkFunctionParams is false',
          options: [{ checkFunctionParams: false }],
          code: `
            function run(opts: { verbose: boolean }) {}
          `,
        },
        {
          name: 'inline object in arrow param when checkArrowFunctionParams is false',
          options: [{ checkArrowFunctionParams: false }],
          code: `
            const run = (opts: { verbose: boolean }) => {};
          `,
        },
        {
          name: 'inline object in method param when checkMethodParams is false',
          options: [{ checkMethodParams: false }],
          code: `
            class S { run(opts: { verbose: boolean }) {} }
          `,
        },
        {
          name: 'inline object in return type when checkReturnTypes is false',
          options: [{ checkReturnTypes: false }],
          code: `
            function run(): { ok: boolean } { return { ok: true }; }
          `,
        },
      ],
      invalid: [],
    });
  });

  // =======================================================================
  // INVALID — Interface properties (suggestion mode)
  // =======================================================================

  describe('invalid — interface properties', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'inline object type in interface property (array)',
          code: `interface LogsData { events: { name: string }[] }`,
          errors: [
            errorWithSuggestion(
              `interface LogsDataEvent { name: string }\n\ninterface LogsData { events: LogsDataEvent[] }`,
            ),
          ],
        },
        {
          name: 'inline object type via Array generic',
          code: `interface LogsData { events: Array<{ name: string }> }`,
          errors: [
            errorWithSuggestion(
              `interface LogsDataEvent { name: string }\n\ninterface LogsData { events: Array<LogsDataEvent> }`,
            ),
          ],
        },
        {
          name: 'direct inline object type in interface property',
          code: `interface Config { options: { verbose: boolean } }`,
          errors: [
            errorWithSuggestion(
              `interface ConfigOption { verbose: boolean }\n\ninterface Config { options: ConfigOption }`,
            ),
          ],
        },
        {
          name: 'multiple inline object properties report separately',
          code: [
            `interface Data {`,
            `  first: { a: string }`,
            `  second: { b: number }`,
            `}`,
          ].join('\n'),
          errors: [
            errorWithSuggestion(
              [
                `interface DataFirst { a: string }`,
                ``,
                `interface Data {`,
                `  first: DataFirst`,
                `  second: { b: number }`,
                `}`,
              ].join('\n'),
            ),
            errorWithSuggestion(
              [
                `interface DataSecond { b: number }`,
                ``,
                `interface Data {`,
                `  first: { a: string }`,
                `  second: DataSecond`,
                `}`,
              ].join('\n'),
            ),
          ],
        },
      ],
    });
  });

  // =======================================================================
  // INVALID — Function params (suggestion mode)
  // =======================================================================

  describe('invalid — function params', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'inline object type in function parameter',
          code: `function handleUpdate(params: { id: string }) {}`,
          errors: [
            errorWithSuggestion(
              `interface HandleUpdateParams { id: string }\n\nfunction handleUpdate(params: HandleUpdateParams) {}`,
            ),
          ],
        },
        {
          name: 'inline object type in multiple function parameters',
          code: `function run(a: { x: number }, b: { y: string }) {}`,
          errors: [
            errorWithSuggestion(
              `interface RunA { x: number }\n\nfunction run(a: RunA, b: { y: string }) {}`,
            ),
            errorWithSuggestion(
              `interface RunB { y: string }\n\nfunction run(a: { x: number }, b: RunB) {}`,
            ),
          ],
        },
      ],
    });
  });

  // =======================================================================
  // INVALID — Arrow function params (suggestion mode)
  // =======================================================================

  describe('invalid — arrow function params', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'inline object type in arrow function parameter',
          code: `const processItem = (item: { name: string }) => {};`,
          errors: [
            errorWithSuggestion(
              `interface ProcessItemItem { name: string }\n\nconst processItem = (item: ProcessItemItem) => {};`,
            ),
          ],
        },
      ],
    });
  });

  // =======================================================================
  // INVALID — Method params (suggestion mode)
  // =======================================================================

  describe('invalid — method params', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'inline object type in class method parameter',
          code: [
            `class UserService {`,
            `  update(data: { name: string }) {}`,
            `}`,
          ].join('\n'),
          errors: [
            errorWithSuggestion(
              [
                `interface UserServiceUpdateData { name: string }`,
                ``,
                `class UserService {`,
                `  update(data: UserServiceUpdateData) {}`,
                `}`,
              ].join('\n'),
            ),
          ],
        },
      ],
    });
  });

  // =======================================================================
  // INVALID — Return types (suggestion mode)
  // =======================================================================

  describe('invalid — return types', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'inline object type in function return type',
          code: `function check(): { ok: boolean } { return { ok: true }; }`,
          errors: [
            errorWithSuggestion(
              `interface CheckReturn { ok: boolean }\n\nfunction check(): CheckReturn { return { ok: true }; }`,
            ),
          ],
        },
        {
          name: 'inline object type in arrow return type',
          code: `const check = (): { ok: boolean } => ({ ok: true });`,
          errors: [
            errorWithSuggestion(
              `interface CheckReturn { ok: boolean }\n\nconst check = (): CheckReturn => ({ ok: true });`,
            ),
          ],
        },
        {
          name: 'inline object type in method return type',
          code: [
            `class Service {`,
            `  check(): { ok: boolean } { return { ok: true }; }`,
            `}`,
          ].join('\n'),
          errors: [
            errorWithSuggestion(
              [
                `interface ServiceCheckReturn { ok: boolean }`,
                ``,
                `class Service {`,
                `  check(): ServiceCheckReturn { return { ok: true }; }`,
                `}`,
              ].join('\n'),
            ),
          ],
        },
      ],
    });
  });

  // =======================================================================
  // AUTOFIX
  // =======================================================================

  describe('autofix', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'autofix extracts interface from interface property',
          options: [{ autofix: true }],
          code: `interface Config { options: { verbose: boolean } }`,
          output: `interface ConfigOption { verbose: boolean }\n\ninterface Config { options: ConfigOption }`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
        {
          name: 'autofix extracts interface from function param',
          options: [{ autofix: true }],
          code: `function handle(opts: { debug: boolean }) {}`,
          output: `interface HandleOpts { debug: boolean }\n\nfunction handle(opts: HandleOpts) {}`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
        {
          name: 'autofix extracts interface from arrow param',
          options: [{ autofix: true }],
          code: `const process = (data: { id: string }) => {};`,
          output: `interface ProcessData { id: string }\n\nconst process = (data: ProcessData) => {};`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
        {
          name: 'autofix extracts interface from return type',
          options: [{ autofix: true }],
          code: `function check(): { ok: boolean } { return { ok: true }; }`,
          output: `interface CheckReturn { ok: boolean }\n\nfunction check(): CheckReturn { return { ok: true }; }`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
      ],
    });
  });

  // =======================================================================
  // SUGGESTIONS (default mode — explicit test)
  // =======================================================================

  describe('suggestions', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'suggestion offered when autofix is off (default)',
          code: `interface Config { options: { verbose: boolean } }`,
          errors: [
            {
              messageId: 'inlineObjectType',
              suggestions: [
                {
                  messageId: 'extractSuggestion',
                  output: `interface ConfigOption { verbose: boolean }\n\ninterface Config { options: ConfigOption }`,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  // =======================================================================
  // EXPORTED DECLARATIONS
  // =======================================================================

  describe('exported declarations', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'autofix adds export to extracted interface for exported interface',
          options: [{ autofix: true }],
          code: `export interface Config { options: { verbose: boolean } }`,
          output: `export interface ConfigOption { verbose: boolean }\n\nexport interface Config { options: ConfigOption }`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
        {
          name: 'autofix adds export to extracted interface for exported function',
          options: [{ autofix: true }],
          code: `export function handle(opts: { debug: boolean }) {}`,
          output: `export interface HandleOpts { debug: boolean }\n\nexport function handle(opts: HandleOpts) {}`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
      ],
    });
  });

  // =======================================================================
  // NAME COLLISION DEDUP
  // =======================================================================

  describe('name collision dedup', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'appends numeric suffix when name already exists',
          options: [{ autofix: true }],
          code: `
interface ConfigOption { existing: string }
interface Config { options: { verbose: boolean } }`,
          output: `
interface ConfigOption { existing: string }
interface ConfigOption2 { verbose: boolean }

interface Config { options: ConfigOption2 }`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
      ],
    });
  });

  // =======================================================================
  // SINGULARIZATION
  // =======================================================================

  describe('singularization for array properties', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'singularizes "events" to "Event" in extracted name',
          options: [{ autofix: true }],
          code: `interface LogsData { events: { name: string }[] }`,
          output: `interface LogsDataEvent { name: string }\n\ninterface LogsData { events: LogsDataEvent[] }`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
        {
          name: 'singularizes "companies" to "Company"',
          options: [{ autofix: true }],
          code: `interface Data { companies: Array<{ name: string }> }`,
          output: `interface DataCompany { name: string }\n\ninterface Data { companies: Array<DataCompany> }`,
          errors: [{ messageId: 'inlineObjectType' }],
        },
      ],
    });
  });

  // =======================================================================
  // minMembersToExtract
  // =======================================================================

  describe('minMembersToExtract option', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [
        {
          name: 'allows inline object with 1 member when minMembersToExtract is 2',
          options: [{ minMembersToExtract: 2 }],
          code: `interface Data { field: { a: string } }`,
        },
      ],
      invalid: [
        {
          name: 'reports inline object with 2 members when minMembersToExtract is 2',
          options: [{ minMembersToExtract: 2 }],
          code: `interface Data { field: { a: string; b: number } }`,
          errors: [
            errorWithSuggestion(
              `interface DataField { a: string; b: number }\n\ninterface Data { field: DataField }`,
            ),
          ],
        },
      ],
    });
  });

  // =======================================================================
  // COMPLEX NESTING — union, intersection
  // =======================================================================

  describe('complex type nesting', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'inline object inside union type',
          code: `interface Data { value: string | { nested: boolean } }`,
          errors: [
            errorWithSuggestion(
              `interface DataValue { nested: boolean }\n\ninterface Data { value: string | DataValue }`,
            ),
          ],
        },
        {
          name: 'inline object inside intersection type',
          code: `interface Data { value: { a: string } & { b: number } }`,
          errors: [
            errorWithSuggestion(
              `interface DataValue { a: string }\n\ninterface Data { value: DataValue & { b: number } }`,
            ),
          ],
        },
      ],
    });
  });

  // =======================================================================
  // METHOD IN CLASS — naming
  // =======================================================================

  describe('method naming strategy', () => {
    ruleTester.run(RULE_NAME, noInlineInterfaceObjectTypesRule, {
      valid: [],
      invalid: [
        {
          name: 'method param uses ClassName + MethodName + ParamName',
          options: [{ autofix: true }],
          code: [
            `class UserService {`,
            `  update(data: { name: string }) {}`,
            `}`,
          ].join('\n'),
          output: [
            `interface UserServiceUpdateData { name: string }`,
            ``,
            `class UserService {`,
            `  update(data: UserServiceUpdateData) {}`,
            `}`,
          ].join('\n'),
          errors: [{ messageId: 'inlineObjectType' }],
        },
        {
          name: 'method return type uses ClassName + MethodName + Return',
          options: [{ autofix: true }],
          code: [
            `class UserService {`,
            `  check(): { ok: boolean } { return { ok: true }; }`,
            `}`,
          ].join('\n'),
          output: [
            `interface UserServiceCheckReturn { ok: boolean }`,
            ``,
            `class UserService {`,
            `  check(): UserServiceCheckReturn { return { ok: true }; }`,
            `}`,
          ].join('\n'),
          errors: [{ messageId: 'inlineObjectType' }],
        },
      ],
    });
  });
});

