import type { TsConfigJson } from 'type-fest';

/**
 * Resolves the path to a tsconfig file.
 * If `tsconfig` is provided in options, resolves it relative to `rootDir`.
 * Otherwise, auto-discovers from tsconfig.json → tsconfig.base.json → tsconfig.main.json → tsconfig.app.json.
 * Falls back to `tsconfig.json` if none are found.
 * @param options
 * @param options.rootDir
 * @param options.tsconfig
 */
export declare function resolveTsconfigPath(options?: { rootDir?: string; tsconfig?: string }): string;

/**
 * Parses a tsconfig file and returns its contents as a typed object.
 * @param tsconfigPath
 */
export declare function parseTsconfig(tsconfigPath: string): TsConfigJson | undefined;

/**
 * Resolves tsconfig path aliases from a tsconfig file, following project references recursively.
 * Returns a flat Record mapping each alias key (e.g. "@app/*") to its path array.
 * @param tsconfigPath
 * @param visited
 */
export declare function resolveTsconfigPaths(tsconfigPath: string, visited?: Set<string>): Record<string, string[]>;
