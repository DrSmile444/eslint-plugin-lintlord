import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

// ---------------------------------------------------------------------------
// Pure utilities
// ---------------------------------------------------------------------------

/**
 * Convert a string to PascalCase.
 * Keeps alphanumerics and splits on non-alphanumeric boundaries.
 * @param input - The string to convert.
 * @returns The PascalCase representation of the input.
 */
export function toPascalCase(input: string): string {
  return input
    .replaceAll(/[^a-z0-9]+/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Conservative singularization for property names.
 * - companies -> company
 * - classes -> class
 * - events -> event
 * - access -> access (protected)
 * @param name - The property name to singularize.
 * @returns The singularized form of the name.
 */
export function singularize(name: string): string {
  const lower = name.toLowerCase();

  if (lower.endsWith('ss') || lower.endsWith('us') || lower.endsWith('is') || lower.endsWith('as')) {
    return name;
  }

  if (lower.endsWith('ies') && name.length > 3) {
    return `${name.slice(0, -3)}y`;
  }

  // classes -> class, boxes -> box, watches -> watch
  if (/(?:sses|shes|ches|xes|zes)$/i.test(name) && name.length > 2) {
    return name.slice(0, -2);
  }

  // events -> event
  if (lower.endsWith('s') && !lower.endsWith('ss') && name.length > 1) {
    return name.slice(0, -1);
  }

  return name;
}

/**
 * Build an interface name from one or more PascalCase name segments joined together.
 * @param segments - Array of name segments to combine.
 * @returns The combined interface name in PascalCase.
 */
export function buildNameFromSegments(segments: string[]): string {
  return segments.map((seg) => toPascalCase(seg) || 'Unknown').join('');
}

/**
 * Build extracted interface name for an interface property:
 * ContainingInterfaceName + SingularizedPropertyName
 * @param parentName - The name of the containing interface.
 * @param propertyName - The property name to singularize and append.
 * @returns The constructed interface name.
 */
export function buildInterfacePropertyName(parentName: string, propertyName: string): string {
  const parentPart = toPascalCase(parentName) || 'Parent';
  const propertyPart = toPascalCase(singularize(propertyName)) || 'Field';

  return `${parentPart}${propertyPart}`;
}

/**
 * Walk child properties of an AST node onto a stack, skipping non-AST fields.
 * @param node - The AST node whose children to push.
 * @param stack - The traversal stack to push children onto.
 */
export function pushChildNodes(node: Record<string, unknown>, stack: unknown[]): void {
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'tokens' || key === 'comments' || key === 'range' || key === 'loc') {
      // skip non-AST / cycle-prone fields
    } else if (value && Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') {
          stack.push(item);
        }
      }
    } else if (value && typeof value === 'object') {
      stack.push(value);
    }
  }
}

/**
 * Fallback iterative search for TSTypeLiteral inside an unknown node type.
 * @param node - The AST node to search within.
 * @returns The first TSTypeLiteral found, or null if none exists.
 */
function findTypeLiteralIterative(node: TSESTree.Node): TSESTree.TSTypeLiteral | null {
  const visited = new WeakSet();
  const stack: unknown[] = [node];

  while (stack.length > 0) {
    const current = stack.pop() as Record<string, unknown> | null;

    if (!current || typeof current !== 'object' || visited.has(current)) {
      // skip nullish, non-objects and already-visited nodes
    } else {
      visited.add(current);

      if ((current as unknown as TSESTree.Node).type === AST_NODE_TYPES.TSTypeLiteral) {
        return current as unknown as TSESTree.TSTypeLiteral;
      }

      pushChildNodes(current, stack);
    }
  }

  return null;
}

/**
 * Finds the first TSTypeLiteral node inside a type annotation tree.
 * Returns the node itself so we can replace exactly that literal in the suggestion fix.
 * @param node - The AST node to search within.
 * @returns The first TSTypeLiteral found, or null if none exists.
 */
export function findFirstTypeLiteral(node: TSESTree.Node | null | undefined): TSESTree.TSTypeLiteral | null {
  if (!node) {
    return null;
  }

  switch (node.type) {
    case AST_NODE_TYPES.TSTypeLiteral: {
      return node;
    }

    case AST_NODE_TYPES.TSTypeAnnotation: {
      return findFirstTypeLiteral(node.typeAnnotation);
    }

    case AST_NODE_TYPES.TSArrayType: {
      return findFirstTypeLiteral(node.elementType);
    }

    case AST_NODE_TYPES.TSUnionType:
    case AST_NODE_TYPES.TSIntersectionType: {
      return node.types.map((typeNode) => findFirstTypeLiteral(typeNode)).find(Boolean) ?? null;
    }

    case AST_NODE_TYPES.TSTypeOperator: {
      return findFirstTypeLiteral(node.typeAnnotation);
    }

    case AST_NODE_TYPES.TSIndexedAccessType: {
      return findFirstTypeLiteral(node.objectType) ?? findFirstTypeLiteral(node.indexType);
    }

    case AST_NODE_TYPES.TSConditionalType: {
      return (
        findFirstTypeLiteral(node.checkType) ??
        findFirstTypeLiteral(node.extendsType) ??
        findFirstTypeLiteral(node.trueType) ??
        findFirstTypeLiteral(node.falseType)
      );
    }

    case AST_NODE_TYPES.TSInferType: {
      return findFirstTypeLiteral(node.typeParameter);
    }

    case AST_NODE_TYPES.TSMappedType: {
      return findFirstTypeLiteral(node.typeAnnotation) ?? findFirstTypeLiteral(node.nameType);
    }

    case AST_NODE_TYPES.TSTypeReference: {
      if (node.typeArguments) {
        return node.typeArguments.params.map((typeNode) => findFirstTypeLiteral(typeNode)).find(Boolean) ?? null;
      }

      return null;
    }

    case AST_NODE_TYPES.TSFunctionType:
    case AST_NODE_TYPES.TSConstructorType: {
      return node.params.map((typeNode) => findFirstTypeLiteral(typeNode)).find(Boolean) ?? findFirstTypeLiteral(node.returnType) ?? null;
    }

    default: {
      return findTypeLiteralIterative(node);
    }
  }
}

/**
 * Determine whether a TSInterfaceDeclaration is exported.
 * @param interfaceNode - The interface declaration node to check.
 * @returns True if the interface is directly exported.
 */
export function isExportedInterface(interfaceNode: TSESTree.TSInterfaceDeclaration): boolean {
  const parentNode = interfaceNode.parent;

  if (parentNode.type !== AST_NODE_TYPES.ExportNamedDeclaration) {
    return false;
  }

  return Object.is(parentNode.declaration, interfaceNode);
}

/**
 * Determine whether a FunctionDeclaration, VariableDeclaration, or ClassDeclaration is directly exported.
 * @param node - The AST node to check.
 * @returns True if the node is directly exported.
 */
export function isDirectlyExported(node: TSESTree.Node): boolean {
  const parentNode = node.parent;

  if (parentNode?.type !== AST_NODE_TYPES.ExportNamedDeclaration) {
    return false;
  }

  return Object.is(parentNode.declaration, node);
}

/**
 * Resolve the property name string from a TSPropertySignature key node.
 * @param key - The key node of the property signature.
 * @returns The resolved property name string, or 'field' as a fallback.
 */
export function resolvePropertyName(key: TSESTree.Node | null | undefined): string {
  if (!key) {
    return 'field';
  }

  if (key.type === AST_NODE_TYPES.Identifier) {
    return key.name;
  }

  if (key.type === AST_NODE_TYPES.Literal && typeof key.value === 'string') {
    return key.value;
  }

  return 'field';
}

/**
 * Extract a simple string name from a function/method key node.
 * Returns null when the name cannot be statically determined.
 * @param keyNode - The key node to extract a name from.
 * @returns The resolved name string, or null if not determinable.
 */
export function resolveKeyName(keyNode: TSESTree.Node | null | undefined): string | null {
  if (!keyNode) {
    return null;
  }

  if (keyNode.type === AST_NODE_TYPES.Identifier || keyNode.type === AST_NODE_TYPES.PrivateIdentifier) {
    return keyNode.name;
  }

  if (keyNode.type === AST_NODE_TYPES.Literal && typeof keyNode.value === 'string') {
    return keyNode.value;
  }

  return null;
}

/**
 * Walk up from a MethodDefinition node to the enclosing ClassDeclaration/ClassExpression
 * and return its name, or "Class" if anonymous/not found.
 * @param methodDefinitionNode - The method definition node to inspect.
 * @returns The class name, or 'Class' if not determinable.
 */
export function getClassNameForMethod(methodDefinitionNode: TSESTree.MethodDefinition): string {
  const classDecl = methodDefinitionNode.parent.parent;

  return classDecl.id?.name ?? 'Class';
}

/**
 * Determine whether the class containing a MethodDefinition is directly exported.
 * @param methodDefinitionNode - The method definition node to inspect.
 * @returns True if the enclosing class is directly exported.
 */
export function isMethodInExportedClass(methodDefinitionNode: TSESTree.MethodDefinition): boolean {
  const classDecl = methodDefinitionNode.parent.parent;

  return isDirectlyExported(classDecl);
}

/**
 * For an ArrowFunctionExpression, attempt to resolve the name it is assigned to
 * via its immediate parent VariableDeclarator.
 * @param arrowNode - The arrow function expression node.
 * @returns The variable name, or null if not assignable.
 */
export function resolveArrowName(arrowNode: TSESTree.ArrowFunctionExpression): string | null {
  const declarator = arrowNode.parent;

  if (declarator.type !== AST_NODE_TYPES.VariableDeclarator) {
    return null;
  }

  if (declarator.id.type === AST_NODE_TYPES.Identifier) {
    return declarator.id.name;
  }

  return null;
}

export interface ResolveArrowAnchorReturn {
  anchorNode: TSESTree.Node;
  shouldExport: boolean;
}

/**
 * For an ArrowFunctionExpression, find the enclosing VariableDeclaration anchor node
 * and determine whether it is exported.
 * @param arrowNode - The arrow function expression node.
 * @returns The anchor node and export flag, or null if not applicable.
 */
export function resolveArrowAnchor(arrowNode: TSESTree.ArrowFunctionExpression): ResolveArrowAnchorReturn | null {
  const declarator = arrowNode.parent;

  if (declarator.type !== AST_NODE_TYPES.VariableDeclarator) {
    return null;
  }

  const variableDecl = declarator.parent;

  const isExported = isDirectlyExported(variableDecl);
  const anchorNode = isExported ? variableDecl.parent : variableDecl;

  return { anchorNode, shouldExport: isExported };
}

/**
 * Collect declared interface/type names from the whole program node into the provided set.
 * @param programNode - The root program node to traverse.
 * @param declaredNames - The set to populate with discovered names.
 */
export function collectDeclaredNames(programNode: TSESTree.Program, declaredNames: Set<string>): void {
  const visited = new WeakSet();
  const stack: unknown[] = [programNode];

  while (stack.length > 0) {
    const currentNode = stack.pop() as Record<string, unknown> | null;

    if (!currentNode || typeof currentNode !== 'object' || visited.has(currentNode)) {
      // skip nullish, non-objects and already-visited nodes
    } else {
      visited.add(currentNode);

      const node = currentNode as unknown as TSESTree.Node;

      if (node.type === AST_NODE_TYPES.TSInterfaceDeclaration && node.id.name) {
        declaredNames.add(node.id.name);
      }

      if (node.type === AST_NODE_TYPES.TSTypeAliasDeclaration && node.id.name) {
        declaredNames.add(node.id.name);
      }

      pushChildNodes(currentNode, stack);
    }
  }
}
