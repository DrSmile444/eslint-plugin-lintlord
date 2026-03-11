/**
 * Options for the no-inline-interface-object-types rule.
 */
export interface NoInlineInterfaceObjectTypesOptions {
  /** Check inline object types in interface properties. Default: true */
  checkInterfaceProperties?: boolean;
  /** Check inline object types in function parameters. Default: true */
  checkFunctionParams?: boolean;
  /** Check inline object types in method parameters. Default: true */
  checkMethodParams?: boolean;
  /** Check inline object types in arrow function parameters. Default: true */
  checkArrowFunctionParams?: boolean;
  /** Check inline object types in return types. Default: true */
  checkReturnTypes?: boolean;
  /** Minimum number of members to trigger extraction. Default: 1 */
  minMembersToExtract?: number;
  /** If true, applies autofix instead of suggestions. Default: false */
  autofix?: boolean;
}

export type MessageIds = 'extractSuggestion' | 'inlineObjectType';

