# @cumulo/css

## 0.2.0-alpha.0

### Minor Changes

- 4610509: more WIP
- 91b78da: **core:** Add `setDefaultTheme()` to set the fallback theme once at startup. `useTheme()` no longer accepts a default theme argument. `setTheme()` ignores blank names, and `Theme` no longer lists `'cloud'` and `'docs'`.

  **core (breaking):** The `cumulo` theme generator CLI now requires `--out-path` or `--in-place`. It no longer writes a fallback `theme-vars.ts`.

  **css:** `createThemeContract()` returns a contract with a `$set()` helper and remembers its prefix, so `createTheme()`, `createGlobalTheme()` and `assignVars()` no longer need the prefix passed again.

### Patch Changes

- 0471aeb: Alpha WIP not ready
