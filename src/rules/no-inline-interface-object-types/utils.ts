import type { TSESTree } from '@typescript-eslint/utils';

// ---------------------------------------------------------------------------
// Pure utilities
// ---------------------------------------------------------------------------

/**
 * Convert a string to PascalCase.
 * Keeps alphanumerics and splits on non-alphanumeric boundaries.
 */
export function toPascalCase(input: string): string {
  return String(input)
    .replaceAll(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/g)
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
 */
export function singularize(name: string): string {
  const normalized = String(name);
  const lower = normalized.toLowerCase();

  if (lower.endsWith('ss') || lower.endsWith('us') || lower.endsWith('is') || lower.endsWith('as')) {
    return normalized;
  }

  if (lower.endsWith('ies') && normalized.length > 3) {
    return `${normalized.slice(0, -3)}y`;
  }

  // classes -> class, boxes -> box, watches -> watch
  if (/(sses|shes|ches|xes|zes)$/i.test(normalized) && normalized.length > 2) {
    return normalized.slice(0, -2);
  }

  // events -> event
  if (lower.endsWith('s') && !lower.endsWith('ss') && normalized.length > 1) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Build an interface name from one or more PascalCase name segments joined together.
 */
export function buildNameFromSegments(segments: string[]): string {
  return segments.map((seg) => toPascalCase(seg) || 'Unknown').join('');
}

/**
 * Build extracted interface name for an interface property:
 * ContainingInterfaceName + SingularizedPropertyName
 */
export function buildInterfacePropertyName(parentName: string, propertyName: string): string {
  const parentPart = toPascalCase(parentName) || 'Parent';
  const propertyPart = toPascalCase(singularize(propertyName)) || 'Field';

  return `${parentPart}${propertyPart}`;
}

/**
 * Walk child properties of an AST node onto a stack, skipping non-AST fields.
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
 */
function findTypeLiteralIterative(node: TSESTree.Node): TSESTree.TSTypeLiteral | null {
  const visited = new WeakSet<object>();
  const stack: unknown[] = [node];

  while (stack.length > 0) {
    const current = stack.pop() as Record<string, unknown> | null;

    if (!current || typeof current !== 'object' || visited.has(current)) {
      // skip nullish, non-objects and already-visited nodes
    } else {
      visited.add(current);

      if ((current as unknown as TSESTree.Node).type === 'TSTypeLiteral') {
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
 */
export function findFirstTypeLiteral(node: TSESTree.Node | null | undefined): TSESTree.TSTypeLiteral | null {
  if (!node) {
    return null;
  }

  if (node.type === 'TSTypeLiteral') {
    return node;
  }

  switch (node.type) {
    case 'TSTypeAnnotation': {
      return findFirstTypeLiteral(node.typeAnnotation);
    }

    case 'TSArrayType': {
      return findFirstTypeLiteral(node.elementType);
    }

    case 'TSUnionType':
    case 'TSIntersectionType': {
      return (Array.isArray(node.types) && node.types.map((typeNode) => findFirstTypeLiteral(typeNode)).find(Boolean)) || null;
    }

    case 'TSTypeOperator': {
      return findFirstTypeLiteral(node.typeAnnotation);
    }

    case 'TSIndexedAccessType': {
      return findFirstTypeLiteral(node.objectType) || findFirstTypeLiteral(node.indexType);
    }

    case 'TSConditionalType': {
      return (
        findFirstTypeLiteral(node.checkType) ||
        findFirstTypeLiteral(node.extendsType) ||
        findFirstTypeLiteral(node.trueType) ||
        findFirstTypeLiteral(node.falseType)
      );
    }

    case 'TSInferType': {
      return findFirstTypeLiteral(node.typeParameter);
    }

    case 'TSMappedType': {
      return findFirstTypeLiteral(node.typeAnnotation) || findFirstTypeLiteral(node.nameType);
    }

    case 'TSTypeReference': {
      if (node.typeArguments && node.typeArguments.type === 'TSTypeParameterInstantiation' && Array.isArray(node.typeArguments.params)) {
        return node.typeArguments.params.map((typeNode) => findFirstTypeLiteral(typeNode)).find(Boolean) || null;
      }

      return null;
    }

    case 'TSFunctionType':
    case 'TSConstructorType': {
      const fromParameters = Array.isArray(node.params) && node.params.map((typeNode) => findFirstTypeLiteral(typeNode)).find(Boolean);

      return fromParameters || findFirstTypeLiteral(node.returnType);
    }

    default: {
      return findTypeLiteralIterative(node);
    }
  }
}

/**
 * Determine whether a TSInterfaceDeclaration is exported.
 */
export function isExportedInterface(interfaceNode: TSESTree.TSInterfaceDeclaration): boolean {
  const parentNode = interfaceNode.parent;

  if (!parentNode || parentNode.type !== 'ExportNamedDeclaration') {
    return false;
  }

  return Object.is(parentNode.declaration, interfaceNode);
}

/**
 * Determine whether a FunctionDeclaration, VariableDeclaration, or ClassDeclaration is directly exported.
 */
export function isDirectlyExported(node: TSESTree.Node): boolean {
  const parentNode = node.parent;

  if (!parentNode || parentNode.type !== 'ExportNamedDeclaration') {
    return false;
  }

  return Object.is(parentNode.declaration, node);
}

/**
 * Resolve the property name string from a TSPropertySignature key node.
 */
export function resolvePropertyName(key: TSESTree.Node | null | undefined): string {
  if (!key) {
    return 'field';
  }

  if (key.type === 'Identifier') {
    return key.name;
  }

  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value;
  }

  return 'field';
}

/**
 * Extract a simple string name from a function/method key node.
 * Returns null when the name cannot be statically determined.
 */
export function resolveKeyName(keyNode: TSESTree.Node | null | undefined): string | null {
  if (!keyNode) {
    return null;
  }

  if (keyNode.type === 'Identifier' || keyNode.type === 'PrivateIdentifier') {
    return keyNode.name;
  }

  if (keyNode.type === 'Literal' && typeof keyNode.value === 'string') {
    return keyNode.value;
  }

  return null;
}

/**
 * Walk up from a MethodDefinition node to the enclosing ClassDeclaration/ClassExpression
 * and return its name, or "Class" if anonymous/not found.
 */
export function getClassNameForMethod(methodDefinitionNode: TSESTree.MethodDefinition): string {
  const classBody = methodDefinitionNode.parent;

  if (!classBody || classBody.type !== 'ClassBody') {
    return 'Class';
  }

  const classDecl = classBody.parent;

  if (!classDecl) {
    return 'Class';
  }

  if (classDecl.type === 'ClassDeclaration' || classDecl.type === 'ClassExpression') {
    return classDecl.id?.name || 'Class';
  }

  return 'Class';
}

/**
 * Determine whether the class containing a MethodDefinition is directly exported.
 */
export function isMethodInExportedClass(methodDefinitionNode: TSESTree.MethodDefinition): boolean {
  const classBody = methodDefinitionNode.parent;

  if (!classBody || classBody.type !== 'ClassBody') {
    return false;
  }

  const classDecl = classBody.parent;

  if (!classDecl) {
    return false;
  }

  return isDirectlyExported(classDecl);
}

/**
 * For an ArrowFunctionExpression, attempt to resolve the name it is assigned to
 * via its immediate parent VariableDeclarator.
 */
export function resolveArrowName(arrowNode: TSESTree.ArrowFunctionExpression): string | null {
  const declarator = arrowNode.parent;

  if (!declarator || declarator.type !== 'VariableDeclarator') {
    return null;
  }

  if (declarator.id?.type === 'Identifier') {
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
 */
export function resolveArrowAnchor(arrowNode: TSESTree.ArrowFunctionExpression): ResolveArrowAnchorReturn | null {
  const declarator = arrowNode.parent;

  if (!declarator || declarator.type !== 'VariableDeclarator') {
    return null;
  }

  const variableDecl = declarator.parent;

  if (!variableDecl || variableDecl.type !== 'VariableDeclaration') {
    return null;
  }

  const isExported = isDirectlyExported(variableDecl);
  const anchorNode = isExported ? variableDecl.parent! : variableDecl;

  return { anchorNode, shouldExport: isExported };
}

/**
 * Collect declared interface/type names from the whole program node into the provided set.
 */
export function collectDeclaredNames(programNode: TSESTree.Program, declaredNames: Set<string>): void {
  const visited = new WeakSet<object>();
  const stack: unknown[] = [programNode];

  while (stack.length > 0) {
    const currentNode = stack.pop() as Record<string, unknown> | null;

    if (!currentNode || typeof currentNode !== 'object' || visited.has(currentNode)) {
      // skip nullish, non-objects and already-visited nodes
    } else {
      visited.add(currentNode);

      const node = currentNode as unknown as TSESTree.Node;

      if (node.type === 'TSInterfaceDeclaration' && node.id?.name) {
        declaredNames.add(node.id.name);
      }

      if (node.type === 'TSTypeAliasDeclaration' && node.id?.name) {
        declaredNames.add(node.id.name);
      }

      pushChildNodes(currentNode, stack);
    }
  }
}
