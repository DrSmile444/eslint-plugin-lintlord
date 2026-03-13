/**
 * Mode controlling which console methods are restricted.
 *
 * - `'log-only'` (default): only `console.log` is flagged. A suggestion is
 *   offered to replace it with `console.info` for intentional output.
 * - `'all'`: every `console.*` call is flagged. Teams using a dedicated
 *   logger (e.g. pino) should use this mode.
 */
export type PreferLoggerMode = 'all' | 'log-only';

/**
 * Options for the prefer-logger rule.
 */
export interface PreferLoggerOptions {
  /**
   * Which console calls to restrict.
   * - `'log-only'` — only `console.log` (default)
   * - `'all'` — all `console.*` methods
   */
  mode?: PreferLoggerMode;
}

export type MessageIds = 'noConsoleAll' | 'noConsoleLog' | 'replaceWithConsoleInfo';
