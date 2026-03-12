import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll } from 'vitest';

// Wire vitest lifecycle into RuleTester so it can clean up after each test suite
RuleTester.afterAll = afterAll;
