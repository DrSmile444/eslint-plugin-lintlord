// Simple logger for ESLint configs with colored context
/**
 * Returns a colored context prefix string for console output.
 * @param context - The logger context label (e.g. 'node', 'tsconfig-utils').
 * @param method - The console method name used to pick an ANSI color.
 */
function colorContext(context, method) {
  const METHOD_COLORS = {
    log: '\u001B[32m', // green
    info: '\u001B[36m', // cyan
    warn: '\u001B[33m', // yellow
    error: '\u001B[31m', // red
    dir: '\u001B[35m', // magenta
    table: '\u001B[32m', // green
  };

  // eslint-disable-next-line security/detect-object-injection
  const methodColor = METHOD_COLORS[method] || '';

  if (methodColor) {
    return `${methodColor}[ESLint:${context}]\u001B[0m`;
  }

  return `[ESLint:${context}]`;
}

/**
 * Creates a namespaced logger that prefixes every message with a colored `[ESLint:<context>]` label.
 * @param context - A short label identifying the config that owns this logger.
 */
export function eslintLogger(context) {
  return {
    // eslint-disable-next-line no-console
    log: (...arguments_) => console.log(colorContext(context, 'log'), ...arguments_),
    info: (...arguments_) => console.info(colorContext(context, 'info'), ...arguments_),
    warn: (...arguments_) => console.warn(colorContext(context, 'warn'), ...arguments_),
    error: (...arguments_) => console.error(colorContext(context, 'error'), ...arguments_),
    dir: (...arguments_) => console.dir(colorContext(context, 'dir'), ...arguments_),
    table: (...arguments_) => console.table(colorContext(context, 'table'), ...arguments_),
  };
}
