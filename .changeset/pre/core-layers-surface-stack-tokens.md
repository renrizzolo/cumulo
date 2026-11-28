---
'@cumulo/core': minor
---

Add CSS cascade layers, `Stack`-based `Surface`/`Card`, and control/field appearance tokens:

- Move all component styles into `@layer components` (matching `theme.css`'s `@layer reset, base, components, utilities;`) so unlayered consumer `className` overrides deterministically win regardless of bundle order.
- Build `Surface` (and `Card`) on top of `Stack` so `direction`, `gap`, `align`, `justify`, `wrap`, and `flex` props work directly without wrapper elements.
- Render `Dialog.Content` inside a scrollable `Surface` configurable via `contentProps` (fixing scroll/corner clipping; padding and gap now apply to the inner `Surface` rather than the `<dialog>` element).
- Add `vars.control.*`, `vars.field.*`, `vars.surface.bg.image`, and `vars.surface.stroke.width` tokens with built-in `[data-control-style='raised']` and `[data-control-style='3d']` presets, and tighten default motion durations.
- **Visual changes:** migrate focus rings from `box-shadow` to `outline` + `outline-offset` (preserving custom control shadows on focus) and clamp `Checkbox` border-radius to `min(vars.radius.md, 30%)`.
