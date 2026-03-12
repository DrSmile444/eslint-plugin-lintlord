# no-inline-interface-object-types

Disallow inline object type literals inside interface properties, function/method/arrow parameters, and return types — offering a suggestion (or autofix) to extract them into named interfaces.

## Why?

- **Inline object types are hard to reuse and document.** When the same shape appears in multiple places, you end up with duplication.
- **Extracted types improve readability and consistency** across the codebase.
- **Named interfaces are easier to navigate** in IDEs — you can jump to the definition, find usages, and refactor confidently.

## Rule Details

### ❌ Invalid

```ts
// Inline object in interface property
interface LogsData {
  events: { name: string }[];
}

// Inline object via Array generic
interface LogsData {
  events: Array<{ name: string }>;
}

// Inline object in function parameter
function handleUpdate(params: { id: string }) {}

// Inline object in arrow function parameter
const processItem = (item: { name: string }) => {};

// Inline object in return type
function check(): { ok: boolean } {
  return { ok: true };
}

// Inline object in class method parameter
class UserService {
  update(data: { name: string }) {}
}
```

### ✅ Valid

```ts
// Extracted to a named interface
interface LogsDataEvent {
  name: string;
}
interface LogsData {
  events: LogsDataEvent[];
}

// Named parameter type
interface HandleUpdateParams {
  id: string;
}
function handleUpdate(params: HandleUpdateParams) {}

// Named return type
interface CheckReturn {
  ok: boolean;
}
function check(): CheckReturn {
  return { ok: true };
}
```

## Naming Strategy

The extracted interface names are generated automatically based on context:

| Context            | Pattern                                   | Example                                              |
| ------------------ | ----------------------------------------- | ---------------------------------------------------- |
| Interface property | `ParentName` + `SingularizedPropertyName` | `LogsData.events` → `LogsDataEvent`                  |
| Function param     | `FunctionNamePascal` + `ParamNamePascal`  | `handleUpdate(params)` → `HandleUpdateParams`        |
| Method param       | `ClassName` + `MethodName` + `ParamName`  | `UserService.update(data)` → `UserServiceUpdateData` |
| Arrow param        | `ArrowNamePascal` + `ParamNamePascal`     | `processItem(item)` → `ProcessItemItem`              |
| Return type        | `CallableName` + `Return`                 | `check(): {...}` → `CheckReturn`                     |

## Options

```ts
type Options = {
  /** Check inline object types in interface properties. Default: true */
  checkInterfaceProperties?: boolean;
  /** Check inline object types in function parameters. Default: true */
  checkFunctionParams?: boolean;
  /** Check inline object types in method parameters. Default: true */
  checkMethodParams?: boolean;
  /** Check inline object types in arrow function parameters. Default: true */
  checkArrowFunctionParams?: boolean;
  /** Check inline object types in return types. Default: true */
  checkReturnTypes?: boolean;
  /** Only report inline types with at least this many members. Default: 1 */
  minMembersToExtract?: number;
  /** If true, applies autofix instead of suggestions. Default: false */
  autofix?: boolean;
};
```

### `checkInterfaceProperties` (default: `true`)

When `false`, inline object types in interface properties are ignored.

### `checkFunctionParams` (default: `true`)

When `false`, inline object types in function parameters are ignored.

### `checkMethodParams` (default: `true`)

When `false`, inline object types in class method parameters are ignored.

### `checkArrowFunctionParams` (default: `true`)

When `false`, inline object types in arrow function parameters are ignored.

### `checkReturnTypes` (default: `true`)

When `false`, inline object types in return types are ignored.

### `minMembersToExtract` (default: `1`)

Only report inline object types with at least this many direct members. Useful if you want to allow small inline types like `{ id: string }` but enforce extraction for larger ones.

```json
{ "lintlord/no-inline-interface-object-types": ["warn", { "minMembersToExtract": 2 }] }
```

### `autofix` (default: `false`)

When `true`, the rule applies the extraction as an automatic fix (`eslint --fix`). ESLint re-runs the rule after each fix pass, so deeply nested inline types are unwound level-by-level.

When `false` (default), the fix is offered only as a manual suggestion in your IDE.

```json
{ "lintlord/no-inline-interface-object-types": ["error", { "autofix": true }] }
```

## Autofix Behavior

The autofix (or suggestion) will:

1. **Insert** a new `interface ExtractedName { ... }` immediately before the containing declaration
2. **Replace** the inline type literal with the new interface name
3. **Preserve comments** — the insertion happens before any leading comment block
4. **Export** the extracted interface if the containing declaration is exported
5. **Deduplicate names** — if the generated name already exists, a numeric suffix is appended (e.g., `ConfigOption2`)

## Configuration Examples

### Recommended (gradual adoption)

```json
{
  "rules": {
    "lintlord/no-inline-interface-object-types": "warn"
  }
}
```

### Strict (hard enforcement with autofix)

```json
{
  "rules": {
    "lintlord/no-inline-interface-object-types": ["error", { "autofix": true }]
  }
}
```

### Only check interfaces, skip function params

```json
{
  "rules": {
    "lintlord/no-inline-interface-object-types": [
      "warn",
      {
        "checkFunctionParams": false,
        "checkMethodParams": false,
        "checkArrowFunctionParams": false,
        "checkReturnTypes": false
      }
    ]
  }
}
```
