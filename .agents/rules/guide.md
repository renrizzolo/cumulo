---
trigger: always_on
---

# Cumulo Design System — Monorepo Guide & Rules

## 1. Monorepo Overview & Architecture

Cumulo is a modern, high-performance design system monorepo managed with `pnpm` workspaces.

### Packages & Apps

- **`@cumulo/css` (`packages/css`)**: Lightweight, zero-dependency, type-safe CSS framework inspired by StyleX and Vanilla Extract. Provides `style()`, `recipe()`, `createThemeContract()`, `createTheme()`, `keyframes()`, and `cx()`.
- **`@cumulo/core` (`packages/core`)**: React 19 UI component library.
- **`@cumulo/unplugin` (`packages/unplugin`)**: Build tool unplugin for compile-time CSS extraction across Vite, Rollup, Webpack, esbuild, and Parcel.
- **`@cumulo/parcel-transformer` (`packages/parcel-transformer`)**: Custom Parcel transformer for static/RSC/CSS processing.
- **`@cumulo/fixtures` (`packages/fixtures`)**: Dedicated private test package for bundler integration and Vitest native browser visual regression testing.
- **`apps/docs`**: Documentation site built with React Static / Parcel.

### Tooling & Commands

- **Package Manager**: `pnpm` (`packageManager: "pnpm@11.22.0"`).
- **Build**: `tsdown` (run via `pnpm build` or `pnpm dev`).
- **Type Checking**: `tsc --noEmit` (run via `pnpm type-check` and included in `pnpm check`).
- **Linting & Formatting**: uses `oxlint` and `oxfmt` (run via `pnpm check`).
- **Testing**: `vitest` (run all unit & bundler tests via `pnpm test`, watch via `pnpm test:watch`, browser visual tests via `pnpm --filter @cumulo/fixtures test:browser`).
- **Releases**: `@changesets/cli`.

---

## 2. TypeScript Strictness & Type Safety

Strict type safety is a non-negotiable standard across this codebase.

- **Zero `any` Policy**: NEVER use `any`. Always use specific types, generic constraints, `unknown` with narrowing, or discriminated unions.
- **Avoid Type Casting (`as Type`)**:
  - Do NOT use `as` casting to bypass type checking or silence compiler errors.
  - Type assertions are only acceptable in rare cases where bridging untyped third-party boundaries is unavoidable.
  - Rely on TypeScript narrowing, type predicates (`is`), discriminated unions, and proper generic constraints instead.
  - When narrowing DOM elements in tests, throw an invariant error rather than casting: `if (!(el instanceof HTMLInputElement)) throw new Error('Expected input to be HTMLInputElement');`.
- **Monorepo TSConfig & `rootDir`**:
  - Do NOT specify `"rootDir"` in individual workspace package `tsconfig.json` files. Setting `rootDir` prevents TypeScript from including sibling package sources during type-checking across workspace boundaries. Inherit base configuration from `tsconfig.base.json` and keep `rootDir` unset.
- **Clean Interface & Type Exports**:
  - Explicitly export component prop types, variant types, and context value types.
  - Use `type` imports/exports (`import type { ... }`) when importing or re-exporting types.
- **HTML Element Props**:
  - Extend `ElementProps<T>` from `packages/core/src/ElementProps.ts` rather than raw `React.HTMLAttributes<T>`, ensuring obsolete/noisy attributes are excluded while retaining correct element-specific attributes and typed `ref`.
- **No Deprecated Aliases**:
  - Because this library is in pre-release, avoid creating or maintaining deprecated backwards-compatibility aliases. Keep APIs canonical, clean, and concise.

---

## 3. React 19 & Component Composition Patterns

### React 19 Conventions

- Components accept `ref?: React.Ref<T>` directly as a prop via `ElementProps<T>`. Avoid wrapping in legacy `React.forwardRef` unless strictly required for backward compatibility.
- Use explicit component return types or standard function declaration signatures.
- **Ref Composition (`useMergeRefs`)**: When combining multiple internal refs (e.g. element ref, focus management ref, dismissible ref) with external `ref` props, always compose them via `useMergeRefs(...)`.

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

## 4. Overlay, Focus & Dismissal Architecture

Cumulo uses modern web platform primitives for top-layer components alongside type-safe hooks:

### Modern Web Standards

- **Dialog**: Uses native HTML5 `<dialog>` with `.showModal()`, backdrop styling via `::backdrop`, and native `closedby="any"` / `cancel` events.
- **Popover**: Uses native HTML `popover="auto"` with CSS Anchor Positioning (`position-anchor: --popover-<id>`, `anchor-name: --popover-<id>`, and `@position-try` fallbacks).

### Dismissible Stacking (`useDismissible`)

- Stack coordination is managed by `useDismissible({ onDismiss, dismissOnClickOutside })`.
- **Ref Attachment**: The returned ref must always be merged onto the element via `useMergeRefs` so DOM containment checks (`ref.current.contains(document.activeElement)`) function accurately.
- **Layer Isolation**: Escape and outside interactions dismiss only the topmost active layer, preserving parent containers (such as a Dialog hosting a Popover).

### Focus Trapping & Navigation (`useFocus`)

- **Modality (`type: 'modality'`)**: Used for Dialogs and Popovers. Supports focus trapping (`trap`), focus wrapping on Tab / Shift+Tab, and optional tab-out dismissal (`onTabOut`).
- **Navigation (`type: 'navigation'`)**: Used for menus, listboxes, and toolbars. Provides arrow key traversal and roving `tabIndex`.

---

## 5. Styling & Design Tokens (`@cumulo/css`)

- **Token Consumption**: Always use `vars` from the contract (`contract.js` / `@cumulo/core`) for colors, spacing, typography, radii, shadows, and transitions (e.g. `vars.spacing.xs`, `vars.radius.lg`, `vars.font.sans`).
- **Atomic & Scoped Styles**:
  - Use `style({ ... })` for static, element-specific styles.
  - Use `recipe({ base, variants, defaultVariants, extend }, debugName)` for components with multi-dimensional variants (e.g. `variant`, `intent`, `size`, `shape`, `width`).
  - Use `cx()` for merging class names cleanly.
  - Don't use arbitrary style props.
  - Prefer using or creating core components where something doesn't exist when iterating on documentation or other apps/sites.
- **Recipe Composition**: Combine shared variant styles (such as `allIntentStyles`, `sizes`) via the recipe's `extend` option.

---

## 6. Testing & Visual Regression Testing Standards

- **Unit & Component Testing**: Use `vitest` with `jsdom` or `node` environments for core component tests and CSS logic tests (`packages/core/test`, `packages/css/test`).
  - **Component Tests: Behavior Over Ceremony**:
    - **No Recipe or Style Checks**: NEVER test recipes, compiled classes, or recipe variants in component unit tests (`expect(button.className).toContain(recipe.classNames...)` is forbidden). Recipe compilation and variant mechanics belong strictly in `@cumulo/css` tests.
    - **No Framework Boilerplate Checks**: Do NOT test "merges className" (we already know `cx` works) or "forwards ref" (React 19 supports ref passing natively without custom forwarding).
    - **Simple Smoke Tests for Leaf Wrappers**: Simple leaf/styled components (`Badge`, `Card`, `Surface`) only require a simple smoke render test (`it('renders without crashing')`).
    - **Test Actual Behaviors on Interactive / Compound Primitives**:
      - State transitions and callback contracts (uncontrolled vs controlled `onOpenChange`, `onCheckedChange`, `onValueChange`).
      - Accessibility wiring (`aria-labelledby`, `aria-describedby`, `aria-expanded`, `aria-controls`, `aria-invalid`, `role`).
      - Event guarding (`disabled` preventing clicks, toggles, or typing).
      - Focus trapping, loop focus, roving tabIndex, and keyboard navigation (arrow keys, Tab wrapping, Escape dismissal).
      - Context coordination and dynamic part registration/unregistration.
  - **Jest-DOM Matchers & Invariant Narrowing**:
    - Always ensure `import '@testing-library/jest-dom/vitest';` is present in test files using DOM matchers (`toBeInTheDocument`, `toBeDisabled`, `toBeChecked`, etc.).
    - Never wrap assertions in soft condition blocks `if (el instanceof HTMLInputElement) { expect(...) }`. Throw an invariant error instead: `if (!(el instanceof HTMLInputElement)) throw new Error('Expected input to be an HTMLInputElement');` to guarantee assertions always run and types narrow cleanly without type assertions (`as`).
  - _JSDOM Popover Note_: Because JSDOM does not natively simulate top-layer rendering for `popover="auto"`, avoid raw `toBeVisible()` assertions on native popovers in JSDOM unit tests; assert `toBeInTheDocument()` and `data-state="open"` attributes instead.
- **Bundler Integration Testing (`@cumulo/fixtures`)**:
  - Test compile-time CSS extraction and module transformation across supported bundlers (**Vite**, **Rollup**, **esbuild**, **Webpack**, and **Parcel**).
  - Assert that generated JS imports reference valid class names and that extracted stylesheets contain complete rule sets for basic styles, pseudo-classes, media queries, keyframes, theme variables, overrides, recipe variants, compound variants, and extensions.
- **Vitest Native Browser Visual Regression Testing**:
  - Use Vitest Browser Mode with `@vitest/browser-playwright` and headless Chromium (`pnpm --filter @cumulo/fixtures test:browser`).
  - Perform visual regression assertions with `expect(locator).toMatchScreenshot()`.
  - Assert real browser DOM computed styles (`window.getComputedStyle`) alongside screenshot comparisons.
  - CI manages canonical Linux baseline snapshots and runs fixtures in a dedicated parallel workflow job.

---

## 7. Themes, Color Modes & Pure CSS Token Architecture

- **Decouple Theme vs Color Mode**:
  - **`Theme`**: Brand and visual identity (e.g. `'default'`, `'docs'`, `'cloud'`, or custom theme strings). Applied via the `[data-theme='...']` attribute on `document.documentElement`.
  - **`ColorMode`**: Appearance mode (`'light' | 'dark' | 'system'`). Applied via `document.documentElement.style.colorScheme` and CSS `color-scheme`.
  - **Intrinsic Light/Dark Support**: `'dark'` is NOT a theme name. All themes must intrinsically support both light and dark modes via CSS `light-dark()` calculations.
- **Pure CSS Custom Themes**:
  - Define custom themes using pure CSS variables under `[data-theme='<name>']` (e.g. overriding `--color-primary-base`, `--color-grey-base`, `--theme-font-mono`).
  - Avoid runtime JavaScript DOM `<style>` injection for themes.
- **Theme & Mode Management**:
  - Use `useTheme()` from `@cumulo/core` for `theme`, `setTheme`, `mode`, `resolvedMode`, `systemMode`, `setMode`, and `toggleMode`.
  - Use `<ThemeScript />` in HTML `<head>` for zero-FOUC restoration of both `data-theme` and `colorScheme`.
  - Use `<ThemeToggle />` for toggling color appearance modes (`light`, `dark`, `system`).

---

## 8. No Barrel Files & Explicit Module Architecture

- **No Intermediary Barrel Files**: Do not create or use intermediate barrel files (such as `src/hooks/index.ts`, `src/tokens/index.ts`, `src/theme/index.ts`, `src/components/index.ts`, or `src/field/index.ts`).
- **No Wildcard Exports (`export *`)**: Never use wildcard `export * from '...'` re-exports. Always use explicit named imports and exports (`export { Button, type ButtonProps } from '...'`) to ensure deterministic dead-code elimination, fast compiler evaluation, and compatibility with `oxc/no-barrel-file`.
- **Direct Module Imports**: Internal modules must import directly from specific files (e.g. `../hooks/useFocus.js`, `../theme/theme.js`, `../components/Input.js`).
- **Granular Package Subpath Exports**: Public packages expose subpaths in `package.json` (`"exports"` field with `./components/*`, `./hooks/*`, `./tokens/*`, `./theme/*`, `./contract`, etc.) allowing consumers to import specific primitives directly without loading the entire library.
