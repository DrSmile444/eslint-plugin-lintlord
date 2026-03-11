import { describe, expect, it } from 'vitest';

import {
  buildInterfacePropertyName,
  buildNameFromSegments,
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
});

