# @cumulo/parcel-plugin

## 0.2.0-alpha.4

### Patch Changes

- Updated dependencies [af6dde5]
- Updated dependencies [af6dde5]
  - @cumulo/css@0.2.0-alpha.4
  - @cumulo/unplugin@0.2.0-alpha.4

## 0.2.0-alpha.3

### Patch Changes

- Updated dependencies [7f1708b]
- Updated dependencies [981d8d3]
  - @cumulo/css@0.2.0-alpha.3
  - @cumulo/unplugin@0.2.0-alpha.3

## 0.2.0-alpha.2

### Minor Changes

- da9fe31: Introduce the native Rust `@cumulo/parcel-plugin` for Parcel v3 (`^3.0.0-alpha.3`) with a two-stage `["@cumulo/parcel-plugin", "...", "@cumulo/parcel-plugin"]` pipeline, re-export dependency detection, bounded per-file watch cache, optional `theme` auto-sync (`{ css, out, includeCustomVars? }`) via `package.json`, and `prepack` JS build support.

  Rewrite evaluated top-level `style()`, `create()`, `keyframes()`, `recipe()`, `createTheme()`, `createGlobalTheme()` and `createGlobalStyles()` calls to `@cumulo/css/runtime` lookups, inline static `vars.a.b` accesses (including aliased `@cumulo/core/contract` and standalone generated `--out` `vars` files), and prune imports left unused.

### Patch Changes

- Updated dependencies [da9fe31]
- Updated dependencies [da9fe31]
  - @cumulo/css@0.2.0-alpha.2
  - @cumulo/unplugin@0.2.0-alpha.2
