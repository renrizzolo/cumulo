---
'@cumulo/css': minor
---

Add CSS cascade layer support (`@layer`):

- `style()`, `create()`, `recipe()`, and `createTheme()` accept a `layer` option (with isolated hashes for non-empty layered rules).
- Export `LAYER_ORDER`, `LAYER_ORDER_STATEMENT`, and `CssLayer`, `StyleOptions`, and `RecipeDefinition` types.
- Allow CSS `var(--...)` references on all `StyleProperties`.
