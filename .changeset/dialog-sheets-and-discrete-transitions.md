---
'@cumulo/css': minor
'@cumulo/core': minor
---

- `@cumulo/css`: Add support for `@starting-style` rules (both top-level and nested within `selectors`) and selector-nested `@media` rules in `style()` and `recipe()`.
- `@cumulo/core`:
  - Add `Dialog` sheet placements (`placement?: 'center' | 'bottom' | 'left' | 'right'`), `Dialog.Handle` drag-to-dismiss subcomponent, and reusable `useDrag` / `useSwipeDismiss` gesture hooks.
  - Add CSS discrete property enter/exit transitions (`allow-discrete` + `@starting-style`) across all `Dialog` placements and `::backdrop`, as well as `Popover`, `Tooltip`, `Menu`, and `Select` picker, with `prefers-reduced-motion: reduce` support.
