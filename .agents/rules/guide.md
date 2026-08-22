---
trigger: always_on
---

# Cumulo Design System — Monorepo Guide & Rules

## 1. Monorepo Overview & Architecture

Cumulo is a modern, high-performance design system monorepo managed with `pnpm` workspaces.

### Packages & Apps

- **`@cumulo/css` (`packages/css`)**: Lightweight, zero-dependency, type-safe CSS framework inspired by StyleX and Vanilla Extract. Provides `style()`, `recipe()`, `createThemeContract()`, `createTheme()`, `keyframes()`, and `cx()`.
- **`@cumulo/core` (`packages/core`)**: React 19 UI component library.
- **`@cumulo/unplugin` (`packages/unplugin`)**: Build tool unplugin for compile-time CSS extraction across Vite, Rollup, Webpack, etc.
- **`@cumulo/parcel-transformer` (`packages/parcel-transformer`)**: Custom Parcel transformer for static/RSC/CSS processing.
- **`apps/docs`**: Documentation site built with React Static / Parcel.

### Tooling & Commands

- **Package Manager**: `pnpm` (`packageManager: "pnpm@10.13.1"`).
- **Build**: `tsdown` (run via `pnpm build` or `pnpm dev`).
- **Type Checking**: `tsc --noEmit` (run via `pnpm type-check`).
- **Linting & Formatting**: `oxlint` (run via `pnpm lint` / `pnpm lint:fix`) and `oxfmt` (run via `pnpm format`).
- **Testing**: `vitest` (run via `pnpm test`).
- **Releases**: `@changesets/cli`.

---

## 2. TypeScript Strictness & Type Safety

Strict type safety is a non-negotiable standard across this codebase.

- **Zero `any` Policy**: NEVER use `any`. Always use specific types, generic constraints, `unknown` with narrowing, or discriminated unions.
- **Avoid Type Casting (`as Type`)**:
  - Do NOT use `as` casting to bypass type checking or silence compiler errors.
  - Type assertions are only acceptable in rare cases where bridging untyped third-party boundaries is unavoidable.
  - Rely on TypeScript narrowing, type predicates (`is`), discriminated unions, and proper generic constraints instead.
- **Clean Interface & Type Exports**:
  - Explicitly export component prop types, variant types, and context value types.
  - Use `type` imports/exports (`import type { ... }`) when importing or re-exporting types.
- **HTML Element Props**:
  - Extend `ElementProps<T>` from `packages/core/src/ElementProps.ts` rather than raw `React.HTMLAttributes<T>`, ensuring obsolete/noisy attributes are excluded while retaining correct element-specific attributes and typed `ref`.

---

## 3. React 19 & Component Composition Patterns

### React 19 Conventions

- Components accept `ref?: React.Ref<T>` directly as a prop via `ElementProps<T>`. Avoid wrapping in legacy `React.forwardRef` unless strictly required for backward compatibility.
- Use explicit component return types or standard function declaration signatures.

### Compound Component & Slot Patterns (The `Field` Pattern)

Cumulo prioritizes flexible, accessible component composition over monolithic, prop-heavy APIs. Follow the pattern demonstrated by `Field`:

1. **Root + Subcomponents Export Structure**:
   - Provide modular subcomponents: `FieldRoot`, `FieldInput`, `FieldLabel`, `FieldError`, `FieldDescription`, `FieldGroup`.
   - Export both named components and a compound namespace object (e.g. `export const Field = { Root, Input, Label, Error, Description, Group };`).
2. **Context-Driven Coordination**:
   - Use a specialized context (e.g. `FieldContext`, `useFieldContext()`) for state and identifier sharing between subcomponents.
   - Implement dynamic part registration (`registerPart(part, id)` with cleanup in `useEffect`) so children can dynamically inform the root of their presence without hardcoded hierarchy constraints.
3. **Automatic Accessibility Wiring**:
   - Seamlessly connect IDs (`aria-labelledby`, `aria-describedby`, `aria-invalid`, `htmlFor`) across subcomponents via context and generated IDs (`useId()`).
   - Always allow user-provided IDs (`id`, `aria-labelledby`, `aria-describedby`, `htmlFor`) to override generated IDs.
4. **State & Intent Synchronization**:
   - Subcomponents should automatically reflect root state (e.g. `isInvalid` or error presence automatically propagates `intent="error"` and `aria-invalid={true}` to `FieldInput`).

---

## 4. Styling & Design Tokens (`@cumulo/css`)

- **Token Consumption**: Always use `vars` from the contract (`contract.js` / `@cumulo/core`) for colors, spacing, typography, radii, shadows, and transitions (e.g. `vars.spacing.xs`, `vars.radius.lg`, `vars.font.sans`).
- **Atomic & Scoped Styles**:
  - Use `style({ ... })` for static, element-specific styles.
  - Use `recipe({ base, variants, defaultVariants, extend }, debugName)` for components with multi-dimensional variants (e.g. `variant`, `intent`, `size`, `shape`, `width`).
  - Use `cx()` for merging class names cleanly.
- **Recipe Composition**: Combine shared variant styles (such as `allIntentStyles`, `sizes`) via the recipe's `extend` option.
