---
'@cumulo/css': minor
'@cumulo/core': minor
'@cumulo/unplugin': minor
---

Add cascade layers, responsive variants, and control/field style tokens.

- `@cumulo/css`: `style()`, `create()`, `recipe()` and `createTheme()` accept a `layer` (and `atRule`); `recipe()` supports `breakpoints` + `responsiveVariants` for `@media` / `@container` queries. Breakpoints must be full at-rules (`'@media (min-width: 768px)'`), compound variants cannot reference responsive variants, and `LAYER_ORDER` / `LAYER_ORDER_STATEMENT` are exported.
- `@cumulo/core`: all component styles move into `@layer components`, so unlayered `className` overrides always win. Layout props are responsive, `Surface`/`Card` are built on `Stack`, and `Dialog` renders its content in a scrollable `Surface` configurable via `contentProps`.
- **Visual changes:** focus rings use `outline` instead of `box-shadow`, and `Dialog` padding/gap now apply to the inner content `Surface` rather than the `<dialog>` element.
- `@cumulo/unplugin`: prepends the canonical `@layer` order to extracted CSS.
