---
'@cumulo/unplugin': minor
---

Rewrite evaluated top-level `style()`, `create()`, `keyframes()`, `recipe()`, `createTheme()`, `createGlobalTheme()` and `createGlobalStyles()` calls to `@cumulo/css/runtime` lookups, inline static `vars.a.b` accesses (including aliased `@cumulo/core/contract` and standalone generated `--out` `vars` files), and prune imports left unused.

Add optional `theme` auto-sync (`{ css, out, includeCustomVars? }`) across `@cumulo/unplugin` and `@cumulo/unplugin/postcss`. Fix `@cumulo/unplugin/postcss` to extract CSS for pages importing `@cumulo/core` components without `@cumulo/css`.
