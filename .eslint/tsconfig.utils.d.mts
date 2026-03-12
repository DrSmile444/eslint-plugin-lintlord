import type { TsConfigJson } from 'type-fest';

/** Parses a tsconfig file and returns its contents as a typed object. */
export declare function parseTsconfig(tsconfigPath: string): TsConfigJson | undefined;

/**
 * Resolves tsconfig path aliases from a tsconfig file, following project references recursively.
 * Returns a flat Record mapping each alias key (e.g. "@app/*") to its path array.
 */
export declare function resolveTsconfigPaths(tsconfigPath: string, visited?: Set<string>): Record<string, string[]>;
