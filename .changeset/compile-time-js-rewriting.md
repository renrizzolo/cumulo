---
'@cumulo/css': minor
'@cumulo/core': minor
'@cumulo/unplugin': minor
'@cumulo/parcel-plugin': minor
---

**css (breaking):** Remove the unused `props()` helper. Use `cx()` and pass `className` directly.

**css:** Add the lean `@cumulo/css/runtime` entrypoint (`cx`, `createThemeContract`, `assignVars` and lightweight `style`/`recipe`/`keyframes`/`createTheme` stand-ins) with no stylesheet registry, hashing or CSS compiler. `createThemeContract()` and `assignVars()` now live in `contract.ts`, and `RecipeFunction` exposes `defaultVariants`.

**unplugin, parcel-plugin:** Rewrite evaluated top-level `style()`, `create()`, `keyframes()`, `recipe()`, `createTheme()`, `createGlobalTheme()` and `createGlobalStyles()` calls to `@cumulo/css/runtime` lookups, inline static `vars.a.b` accesses, and prune imports left unused. This strips style definitions and the CSS compiler from client JS bundles. `@cumulo/parcel-plugin` now uses a two-stage `["@cumulo/parcel-plugin", "...", "@cumulo/parcel-plugin"]` pipeline in `.parcelrc`.

**core:** Generated `vars` contracts carry build-time metadata so they can be inlined, and `intents.ts` resolves its secondary var map lazily.
