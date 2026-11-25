---
'@cumulo/css': patch
---

Share runtime wrappers (`runtimeStyle`, `runtimeKeyframes`, `runtimeTheme`, `runtimeRecipe`) between `@cumulo/css` and `@cumulo/css/runtime` to eliminate duplicate lookup logic, and mark `CUMULO_META_KEY` as `/* @__PURE__ */` so bundlers cleanly tree-shake unused metadata from client bundles.
