import type { TSESTree } from '@typescript-eslint/utils';
import { describe, expect, it } from 'vitest';

import {
  buildInterfacePropertyName,
  buildNameFromSegments,
  collectDeclaredNames,
  getClassNameForMethod,
  isMethodInExportedClass,
  resolveArrowAnchor,
  resolveArrowName,
  resolveKeyName,
  singularize,
  toPascalCase,
} from '@rules/no-inline-interface-object-types/utils';

describe('no-inline-interface-object-types / utils', () => {
  describe('toPascalCase', () => {
    it('converts camelCase', () => {
      expect(toPascalCase('handleUpdate')).toBe('HandleUpdate');
    });

    it('converts snake_case', () => {
      expect(toPascalCase('handle_update')).toBe('HandleUpdate');
    });

    it('converts kebab-case', () => {
      expect(toPascalCase('handle-update')).toBe('HandleUpdate');
    });

    it('handles single word', () => {
      expect(toPascalCase('name')).toBe('Name');
    });

    it('handles already PascalCase', () => {
      expect(toPascalCase('HandleUpdate')).toBe('HandleUpdate');
    });

    it('handles empty string', () => {
      expect(toPascalCase('')).toBe('');
    });

    it('handles mixed separators', () => {
      expect(toPascalCase('my--cool_thing')).toBe('MyCoolThing');
    });
  });

  describe('singularize', () => {
    it('events -> event', () => {
      expect(singularize('events')).toBe('event');
    });

    it('companies -> company', () => {
      expect(singularize('companies')).toBe('company');
    });

    it('classes -> class', () => {
      expect(singularize('classes')).toBe('class');
    });

    it('boxes -> box', () => {
      expect(singularize('boxes')).toBe('box');
    });

    it('watches -> watch', () => {
      expect(singularize('watches')).toBe('watch');
    });

    it('preserves words ending in ss (access)', () => {
      expect(singularize('access')).toBe('access');
    });

    it('preserves words ending in us (status)', () => {
      expect(singularize('status')).toBe('status');
    });

    it('preserves words ending in is (basis)', () => {
      expect(singularize('basis')).toBe('basis');
    });

    it('preserves single character', () => {
      expect(singularize('s')).toBe('s');
    });

    it('preserves non-plural word', () => {
      expect(singularize('data')).toBe('data');
    });
  });

  describe('buildNameFromSegments', () => {
    it('joins segments in PascalCase', () => {
      expect(buildNameFromSegments(['user', 'update'])).toBe('UserUpdate');
    });

    it('uses Unknown for empty segments', () => {
      expect(buildNameFromSegments(['', 'name'])).toBe('UnknownName');
    });

    it('handles single segment', () => {
      expect(buildNameFromSegments(['handle'])).toBe('Handle');
    });
  });

  // eslint-disable-next-line no-secrets/no-secrets -- function name used as describe label, not a secret
  describe('buildInterfacePropertyName', () => {
    it('combines parent + singularized property', () => {
      expect(buildInterfacePropertyName('LogsData', 'events')).toBe('LogsDataEvent');
    });

    it('uses Parent when parent is empty', () => {
      expect(buildInterfacePropertyName('', 'events')).toBe('ParentEvent');
    });

    it('uses Field when property is empty', () => {
      expect(buildInterfacePropertyName('Config', '')).toBe('ConfigField');
    });

    it('handles already-singular property', () => {
      expect(buildInterfacePropertyName('Config', 'option')).toBe('ConfigOption');
    });
  });

  describe('collectDeclaredNames', () => {
    it('collects TSInterfaceDeclaration names', () => {
      const ifaceNode = { type: 'TSInterfaceDeclaration', id: { name: 'MyInterface' } };
      const program = { type: 'Program', body: [ifaceNode] } as unknown as TSESTree.Program;
      const names = new Set<string>();

      collectDeclaredNames(program, names);
      expect(names.has('MyInterface')).toBe(true);
    });

    it('collects TSTypeAliasDeclaration names', () => {
      const aliasNode = { type: 'TSTypeAliasDeclaration', id: { name: 'MyAlias' } };
      const program = { type: 'Program', body: [aliasNode] } as unknown as TSESTree.Program;
      const names = new Set<string>();

      collectDeclaredNames(program, names);
      expect(names.has('MyAlias')).toBe(true);
    });
  });

  describe('resolveArrowName', () => {
    it('returns name when parent is VariableDeclarator with Identifier id', () => {
      const arrow = {
        parent: { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'handleUpdate' } },
      } as unknown as TSESTree.ArrowFunctionExpression;

      expect(resolveArrowName(arrow)).toBe('handleUpdate');
    });

    it('returns null when parent is not VariableDeclarator', () => {
      const arrow = { parent: { type: 'CallExpression' } } as unknown as TSESTree.ArrowFunctionExpression;

      expect(resolveArrowName(arrow)).toBeNull();
    });

    it('returns null when VariableDeclarator id is not an Identifier', () => {
      const arrow = {
        parent: { type: 'VariableDeclarator', id: { type: 'ArrayPattern' } },
      } as unknown as TSESTree.ArrowFunctionExpression;

      expect(resolveArrowName(arrow)).toBeNull();
    });
  });

  describe('resolveArrowAnchor', () => {
    it('returns anchor with shouldExport=false for unexported const arrow', () => {
      const variableDecl = { type: 'VariableDeclaration', parent: { type: 'Program' } };
      const declarator = { type: 'VariableDeclarator', parent: variableDecl };
      const arrow = { parent: declarator } as unknown as TSESTree.ArrowFunctionExpression;
      const result = resolveArrowAnchor(arrow);

      expect(result).not.toBeNull();
      expect(result?.shouldExport).toBe(false);
      expect(result?.anchorNode).toBe(variableDecl);
    });

    it('returns null when parent is not VariableDeclarator', () => {
      const arrow = { parent: { type: 'CallExpression' } } as unknown as TSESTree.ArrowFunctionExpression;

      expect(resolveArrowAnchor(arrow)).toBeNull();
    });

    it('returns null when VariableDeclarator parent is not VariableDeclaration', () => {
      const declarator = { type: 'VariableDeclarator', parent: { type: 'ForInStatement' } };
      const arrow = { parent: declarator } as unknown as TSESTree.ArrowFunctionExpression;

      expect(resolveArrowAnchor(arrow)).toBeNull();
    });
  });

  describe('isMethodInExportedClass', () => {
    it('returns false when classDecl is null', () => {
      const classBody = { type: 'ClassBody', parent: null };
      const method = { parent: classBody } as unknown as TSESTree.MethodDefinition;

      expect(isMethodInExportedClass(method)).toBe(false);
    });

    it('returns false when parent is not ClassBody', () => {
      const method = { parent: { type: 'FunctionExpression' } } as unknown as TSESTree.MethodDefinition;

      expect(isMethodInExportedClass(method)).toBe(false);
    });

    it('returns false when class is not exported', () => {
      const classDecl = { type: 'ClassDeclaration', parent: { type: 'Program' } };
      const classBody = { type: 'ClassBody', parent: classDecl };
      const method = { parent: classBody } as unknown as TSESTree.MethodDefinition;

      expect(isMethodInExportedClass(method)).toBe(false);
    });
  });

  describe('resolveKeyName', () => {
    it('returns null when keyNode is null', () => {
      expect(resolveKeyName(null)).toBeNull();
    });

    it('returns Identifier name', () => {
      const node = { type: 'Identifier', name: 'handleUpdate' } as unknown as TSESTree.Node;

      expect(resolveKeyName(node)).toBe('handleUpdate');
    });

    it('returns string Literal value', () => {
      const node = { type: 'Literal', value: 'handle-event' } as unknown as TSESTree.Node;

      expect(resolveKeyName(node)).toBe('handle-event');
    });

    it('returns null for non-identifier non-literal key', () => {
      const node = { type: 'TemplateLiteral' } as unknown as TSESTree.Node;

      expect(resolveKeyName(node)).toBeNull();
    });
  });

  describe('getClassNameForMethod', () => {
    it('returns class name for a named ClassDeclaration method', () => {
      const classDecl = { type: 'ClassDeclaration', id: { name: 'UserService' }, parent: { type: 'Program' } };
      const classBody = { type: 'ClassBody', parent: classDecl };
      const method = { parent: classBody } as unknown as TSESTree.MethodDefinition;

      expect(getClassNameForMethod(method)).toBe('UserService');
    });

    it('returns Class when parent is not ClassBody', () => {
      const method = { parent: { type: 'Program' } } as unknown as TSESTree.MethodDefinition;

      expect(getClassNameForMethod(method)).toBe('Class');
    });

    it('returns Class when classDecl is null', () => {
      const classBody = { type: 'ClassBody', parent: null };
      const method = { parent: classBody } as unknown as TSESTree.MethodDefinition;

      expect(getClassNameForMethod(method)).toBe('Class');
    });

    it('returns Class when classDecl is not a class node', () => {
      const classBody = { type: 'ClassBody', parent: { type: 'ExportDefaultDeclaration' } };
      const method = { parent: classBody } as unknown as TSESTree.MethodDefinition;

      expect(getClassNameForMethod(method)).toBe('Class');
    });

    it('returns Class when class declaration has no id', () => {
      const classDecl = { type: 'ClassDeclaration', id: null, parent: { type: 'Program' } };
      const classBody = { type: 'ClassBody', parent: classDecl };
      const method = { parent: classBody } as unknown as TSESTree.MethodDefinition;

      expect(getClassNameForMethod(method)).toBe('Class');
    });

    it('returns class name for ClassExpression', () => {
      const classDecl = { type: 'ClassExpression', id: { name: 'MyExpr' }, parent: { type: 'VariableDeclarator' } };
      const classBody = { type: 'ClassBody', parent: classDecl };
      const method = { parent: classBody } as unknown as TSESTree.MethodDefinition;

      expect(getClassNameForMethod(method)).toBe('MyExpr');
    });
  });
});
