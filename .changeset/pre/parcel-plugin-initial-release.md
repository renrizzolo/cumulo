---
'@cumulo/parcel-plugin': minor
---

Introduce the native Rust `@cumulo/parcel-plugin` for Parcel v3 (`^3.0.0-alpha.3`) with a two-stage `["@cumulo/parcel-plugin", "...", "@cumulo/parcel-plugin"]` pipeline, re-export dependency detection, bounded per-file watch cache, optional `theme` auto-sync (`{ css, out, includeCustomVars? }`) via `package.json`, and `prepack` JS build support.

Rewrite evaluated top-level `style()`, `create()`, `keyframes()`, `recipe()`, `createTheme()`, `createGlobalTheme()` and `createGlobalStyles()` calls to `@cumulo/css/runtime` lookups, inline static `vars.a.b` accesses (including aliased `@cumulo/core/contract` and standalone generated `--out` `vars` files), and prune imports left unused.
