---
'@cumulo/css': minor
'@cumulo/core': minor
'@cumulo/unplugin': minor
---

Add CSS cascade layers, `Surface` on `Stack`, and control/field style tokens.

- `@cumulo/css`: `style()`, `create()`, `recipe()`, and `createTheme()` accept a `layer` option, and `LAYER_ORDER` / `LAYER_ORDER_STATEMENT` are exported.
- `@cumulo/core`: all component styles move into `@layer components`, so unlayered `className` overrides deterministically win. `Surface` and `Card` are built on `Stack`, `Dialog` renders its content in a scrollable `Surface` configurable via `contentProps`, and `vars.control.*` / `vars.field.*` tokens plus `[data-control-style='raised' | '3d']` presets are added.
- **Visual changes:** focus rings use `outline` instead of `box-shadow`, and `Dialog` padding/gap now apply to the inner content `Surface` rather than the `<dialog>` element.
- `@cumulo/unplugin`: prepends the canonical `@layer` order to extracted CSS.
