import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

import type { MessageIds, NoInlineInterfaceObjectTypesOptions } from './types';

import {
  buildInterfacePropertyName,
  buildNameFromSegments,
  collectDeclaredNames,
  findFirstTypeLiteral,
  getClassNameForMethod,
  isDirectlyExported,
  isExportedInterface,
  isMethodInExportedClass,
  resolveArrowAnchor,
  resolveArrowName,
  resolveKeyName,
  resolvePropertyName,
  toPascalCase,
} from './utils';

export const RULE_NAME = 'no-inline-interface-object-types';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://drsmile444.github.io/eslint-plugin-lintlord/rules/${name}`,
);

export const noInlineInterfaceObjectTypesRule = createRule<[NoInlineInterfaceObjectTypesOptions], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow inline object type literals inside interface properties, function/method/arrow params, and return types; suggest extracting to a named interface.',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkInterfaceProperties: { type: 'boolean' },
          checkFunctionParams: { type: 'boolean' },
          checkMethodParams: { type: 'boolean' },
          checkArrowFunctionParams: { type: 'boolean' },
          checkReturnTypes: { type: 'boolean' },
          minMembersToExtract: { type: 'number', minimum: 1 },
          autofix: { type: 'boolean' },
        },
      },
    ],
    messages: {
      inlineObjectType: 'Inline object type literal found. Extract it to a named interface.',
      extractSuggestion: 'Extract inline object type into a new interface and replace usage.',
    },
  },
  defaultOptions: [
    {
      checkInterfaceProperties: true,
      checkFunctionParams: true,
      checkMethodParams: true,
      checkArrowFunctionParams: true,
      checkReturnTypes: true,
      minMembersToExtract: 1,
      autofix: false,
    },
  ],

  create(context, [options]) {
    const { sourceCode } = context;

    const {
      checkInterfaceProperties = true,
      checkFunctionParams: checkFunctionParameters = true,
      checkMethodParams: checkMethodParameters = true,
      checkArrowFunctionParams: checkArrowFunctionParameters = true,
      checkReturnTypes = true,
      minMembersToExtract = 1,
      autofix = false,
    } = options;

    const declaredNames = new Set<string>();

    // ------------------------------------------------------------------
    // Inner helpers (need sourceCode / declaredNames / autofix closure)
    // ------------------------------------------------------------------

    /**
     * Returns the safe insertion range:
     * - Before the first leading comment if one exists (so the comment stays attached).
     * - Otherwise, before the node itself.
     */
    function getInsertionRange(anchorNode: TSESTree.Node): readonly [number, number] {
      const leadingComments = sourceCode.getCommentsBefore(anchorNode) || [];

      if (leadingComments.length > 0) {
        return leadingComments[0].range;
      }

      return anchorNode.range;
    }

    /**
     * Build a unique interface name, appending a numeric suffix on collision.
     */
    function resolveUniqueName(candidate: string): string {
      if (!declaredNames.has(candidate)) {
        return candidate;
      }

      let index = 2;

      while (declaredNames.has(`${candidate}${index}`)) {
        index += 1;
      }

      return `${candidate}${index}`;
    }

    /**
     * Build the fixer function: insert the new interface before anchorNode and replace the literal.
     */
    function makeExtractFix(
      anchorNode: TSESTree.Node,
      typeLiteralNode: TSESTree.TSTypeLiteral,
      newName: string,
      shouldExport: boolean,
    ) {
      const literalText = sourceCode.getText(typeLiteralNode);
      const prefix = shouldExport ? 'export ' : '';
      const declText = `${prefix}interface ${newName} ${literalText}\n\n`;
      const insertionRange = getInsertionRange(anchorNode);

      return (fixer: { insertTextBeforeRange: Function; replaceText: Function }) => [
        fixer.insertTextBeforeRange(insertionRange, declText),
        fixer.replaceText(typeLiteralNode, newName),
      ];
    }

    /**
     * Build the ESLint report descriptor — direct fix when autofix is on, suggestion otherwise.
     */
    function buildReport(
      reportNode: TSESTree.Node,
      anchorNode: TSESTree.Node,
      typeLiteralNode: TSESTree.TSTypeLiteral,
      newName: string,
      shouldExport: boolean,
    ) {
      const extractFix = makeExtractFix(anchorNode, typeLiteralNode, newName, shouldExport);

      if (autofix) {
        return { node: reportNode, messageId: 'inlineObjectType' as const, fix: extractFix };
      }

      return {
        node: reportNode,
        messageId: 'inlineObjectType' as const,
        suggest: [{ messageId: 'extractSuggestion' as const, fix: extractFix }],
      };
    }

    /**
     * Core check: if the typeAnnotation node contains a qualifying TSTypeLiteral, report it.
     */
    function checkTypeAnnotation(
      typeAnnotationNode: TSESTree.Node,
      candidateName: string,
      anchorNode: TSESTree.Node,
      shouldExport: boolean,
      reportNode: TSESTree.Node,
    ): void {
      const typeLiteral = findFirstTypeLiteral(typeAnnotationNode);

      if (!typeLiteral) {
        return;
      }

      if (!Array.isArray(typeLiteral.members) || typeLiteral.members.length < minMembersToExtract) {
        return;
      }

      const newName = resolveUniqueName(candidateName);

      declaredNames.add(newName);

      context.report(buildReport(reportNode, anchorNode, typeLiteral, newName, shouldExport));
    }

    /**
     * Check all parameters of a callable for inline object type annotations.
     */
    function checkParameters(
      parameters: TSESTree.Parameter[],
      callablePascal: string,
      anchorNode: TSESTree.Node,
      shouldExport: boolean,
    ): void {
      for (const param of parameters) {
        if ('typeAnnotation' in param && param.typeAnnotation) {
          const paramNode = param.type === 'AssignmentPattern' ? param.left : param;
          const paramName = resolvePropertyName(paramNode);
          const candidateName = buildNameFromSegments([callablePascal, paramName]);

          checkTypeAnnotation(param.typeAnnotation, candidateName, anchorNode, shouldExport, param.typeAnnotation);
        }
      }
    }

    /**
     * Check the return type of a callable for an inline object type annotation.
     */
    function checkReturnType(
      returnTypeNode: TSESTree.TSTypeAnnotation | undefined,
      callablePascal: string,
      anchorNode: TSESTree.Node,
      shouldExport: boolean,
    ): void {
      if (!returnTypeNode) {
        return;
      }

      const candidateName = buildNameFromSegments([callablePascal, 'Return']);

      checkTypeAnnotation(returnTypeNode, candidateName, anchorNode, shouldExport, returnTypeNode);
    }

    // ------------------------------------------------------------------
    // Visitors
    // ------------------------------------------------------------------

    return {
      Program(node: TSESTree.Program) {
        collectDeclaredNames(node, declaredNames);
      },

      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        if (!checkInterfaceProperties) {
          return;
        }

        const parentInterfaceName = node.id?.name;

        if (!parentInterfaceName || !node.body || !Array.isArray(node.body.body)) {
          return;
        }

        const anchorNode = isExportedInterface(node) ? node.parent! : node;
        const shouldExport = isExportedInterface(node);

        for (const member of node.body.body) {
          if (member.type === 'TSPropertySignature' && member.typeAnnotation) {
            const propertyName = resolvePropertyName(member.key);
            const candidateName = buildInterfacePropertyName(parentInterfaceName, propertyName);

            checkTypeAnnotation(member.typeAnnotation, candidateName, anchorNode, shouldExport, member.typeAnnotation);
          }
        }
      },

      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        const functionName = node.id?.name;
        const functionPascal = toPascalCase(functionName || 'Function');
        const anchorNode = isDirectlyExported(node) ? node.parent! : node;
        const shouldExport = isDirectlyExported(node);

        if (checkFunctionParameters && Array.isArray(node.params)) {
          checkParameters(node.params, functionPascal, anchorNode, shouldExport);
        }

        if (checkReturnTypes && node.returnType) {
          checkReturnType(node.returnType, functionPascal, anchorNode, shouldExport);
        }
      },

      MethodDefinition(node: TSESTree.MethodDefinition) {
        const methodName = resolveKeyName(node.key);
        const methodPascal = toPascalCase(methodName || 'Method');
        const className = getClassNameForMethod(node);
        const classDecl = node.parent?.parent;
        const shouldExport = isMethodInExportedClass(node);
        const anchorNode = shouldExport && classDecl ? classDecl.parent! : classDecl || node;
        const callable = node.value;

        if (!callable || !Array.isArray(callable.params)) {
          return;
        }

        const callablePascal = buildNameFromSegments([className, methodPascal]);

        if (checkMethodParameters) {
          checkParameters(callable.params, callablePascal, anchorNode, shouldExport);
        }

        if (checkReturnTypes && callable.returnType) {
          checkReturnType(callable.returnType, callablePascal, anchorNode, shouldExport);
        }
      },

      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression) {
        const arrowAnchor = resolveArrowAnchor(node);

        if (!arrowAnchor) {
          return;
        }

        const { anchorNode, shouldExport } = arrowAnchor;
        const arrowName = resolveArrowName(node);
        const arrowPascal = toPascalCase(arrowName || 'ArrowFunction');

        if (checkArrowFunctionParameters && Array.isArray(node.params)) {
          checkParameters(node.params, arrowPascal, anchorNode, shouldExport);
        }

        if (checkReturnTypes && node.returnType) {
          checkReturnType(node.returnType, arrowPascal, anchorNode, shouldExport);
        }
      },
    };
  },
});

