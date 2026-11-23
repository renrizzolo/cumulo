---
'@cumulo/css': minor
'@cumulo/core': minor
'@cumulo/unplugin': minor
'@cumulo/parcel-plugin': minor
---

**css (breaking):** Remove the unused `props()` helper. Use `cx()` and pass `className` directly.

**css:** Add the lean `@cumulo/css/runtime` entrypoint (`cx`, `createThemeContract`, `assignVars` and lightweight `style`/`recipe`/`keyframes`/`createTheme` stand-ins) with no stylesheet registry, hashing or CSS compiler. `createThemeContract()` and `assignVars()` now live in `contract.ts`, `RecipeFunction` exposes `defaultVariants`, `runtimeRecipe()` guards `null` variant values to match `recipe()`, and package `types`/`exports` point to `.d.mts` with explicit `types` conditions.

**parcel-plugin:** Introduce the native Rust `@cumulo/parcel-plugin` for Parcel v3 (`^3.0.0-alpha.3`) with a two-stage `["@cumulo/parcel-plugin", "...", "@cumulo/parcel-plugin"]` pipeline, re-export dependency detection, bounded per-file watch cache, and `prepack` JS build support.

**unplugin, parcel-plugin:** Rewrite evaluated top-level `style()`, `create()`, `keyframes()`, `recipe()`, `createTheme()`, `createGlobalTheme()` and `createGlobalStyles()` calls to `@cumulo/css/runtime` lookups, inline static `vars.a.b` accesses (including aliased `@cumulo/core/contract` and standalone generated `--out` `vars` files), and prune imports left unused. Fix `@cumulo/unplugin/postcss` to extract CSS for pages importing `@cumulo/core` components without `@cumulo/css`.

**core:** Generated `vars` contracts carry build-time metadata so they can be inlined, `generate-theme --in-place` emits valid ESM JS to `dist/contract.mjs`, `Heading` uses `textSharedRecipe` directly (keeping `textRecipe` private), and `intents.ts` resolves its secondary var map lazily.
