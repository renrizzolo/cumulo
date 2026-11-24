---
'@cumulo/css': minor
---

**Breaking:** Remove the unused `props()` helper. Use `cx()` and pass `className` directly.

Add the lean `@cumulo/css/runtime` entrypoint (`cx`, `createThemeContract`, `assignVars` and lightweight `style`/`recipe`/`keyframes`/`createTheme` stand-ins) with no stylesheet registry, hashing or CSS compiler. `createThemeContract()` and `assignVars()` now live in `contract.ts`, `RecipeFunction` exposes `defaultVariants`, `runtimeRecipe()` guards `null` variant values to match `recipe()`, and package `types`/`exports` point to `.d.mts` with explicit `types` conditions.
