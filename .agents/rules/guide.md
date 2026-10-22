---
trigger: always_on
---

# Cumulo Design System — Monorepo Feature Map & Architecture Guide

A streamlined guide to the architecture, directory layout, design system usage, TypeScript conventions, and engineering standards across the Cumulo monorepo.

---

## 1. Monorepo Feature Map & Directory Index

```
cumulo/
├── packages/
│   ├── core/                  # React 19 UI component library (@cumulo/core)
│   │   └── src/
│   │       ├── components/    # 30+ UI, layout, and overlay components
│   │       ├── hooks/         # Headless logic (focus, dismissal, ref merging, layout)
│   │       ├── theme/         # Theme runtime, useTheme hook, ThemeScript
│   │       ├── tokens/        # Pure design tokens & theme contract values
│   │       ├── contract.ts    # Zero-runtime CSS variable contract (`vars`)
│   │       ├── ElementProps.ts# Strict React 19 HTML element typing
│   │       ├── intents.ts     # Shared intent & variant styling utilities
│   │       ├── layout.ts      # Shared layout CSS helper rules
│   │       ├── typography.ts  # Shared typography CSS helper rules
│   │       └── reset.ts       # Global base CSS resets
│   ├── css/                   # Zero-dependency, type-safe CSS framework (@cumulo/css)
│   │   └── src/
│   │       ├── create.ts      # style() implementation & style compiler
│   │       ├── recipe.ts      # recipe() multi-variant component builder
│   │       ├── createTheme.ts # createThemeContract(), createTheme(), assignVars()
│   │       ├── keyframes.ts   # keyframes() animation definition
│   │       └── cx.ts          # cx() class merging utility
│   ├── unplugin/              # Compile-time CSS extraction unplugin (Vite, Rollup, Webpack, esbuild, Parcel)
│   ├── parcel-transformer/    # Custom Parcel transformer for CSS extraction & static/RSC compilation
│   └── fixtures/              # Bundler integration tests & Vitest Playwright browser visual tests
├── apps/
│   └── docs/                  # React Static / Parcel documentation site
│       ├── docgen/components/ # Generated prop tables (READ-ONLY — never edit manually)
│       └── src/pages/         # Interactive MDX documentation & component previews
├── scripts/
│   └── pr-metrics/            # CI AST-based API diffing & bundle sizing tools
├── .changeset/                # Release management & version bumping configs
└── vitest.config.ts           # Root test configuration (jsdom & browser modes)
```

### Component Feature Map (`packages/core/src/components/`)

| Category               | Components                                                                        | Notes / Key Subcomponents                                                                                                              |
| :--------------------- | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **Forms & Input**      | `Field`, `Input`, `Textarea`, `Checkbox`, `Radio`, `RadioList`, `Switch`, `Label` | `Field` compound namespace (`Root`, `Input`, `Label`, `Error`, `Description`, `Group`) with dynamic part registration                  |
| **Overlays**           | `Dialog`, `Popover`, `Tooltip`                                                    | Native HTML5 `<dialog>` and `popover="auto"` / `popover="manual"` with CSS Anchor Positioning                                          |
| **App Layout**         | `AppFrame`, `Panel`, `Sidebar`, `SideNav`                                         | Modern responsive frame primitives; `Sidebar` features collapsible levels, toggles, `useSidebar` hook, and top-layer tooltip isolation |
| **Layout & Flow**      | `Stack` (`HStack`, `VStack`), `Container`, `Flow`, `Divider`, `Table`             | Flex/grid layouts, token-aware spacing, and tabular display                                                                            |
| **Navigation & Tabs**  | `Tabs`, `ButtonGroup`                                                             | Roving focus keyboard navigation, accessible tabs with controlled/uncontrolled state                                                   |
| **Feedback & Display** | `Surface`, `Card`, `Badge`, `Button`, `Collapsible`, `ThemeToggle`                | Polymorphic surfaces, intents (`primary`, `success`, `warning`, `error`, `neutral`), and dark-mode toggles                             |
| **Typography**         | `Heading`, `Text`, `Code`                                                         | Semantic elements (`h1`–`h6`, `p`, `span`, `code`), variant styles tied to typography tokens                                           |

### Headless Hooks Map (`packages/core/src/hooks/`)

- [`useDismissible`](file:///packages/core/src/hooks/useDismissible.ts): Layer-isolated click-outside and Escape key stack dismissal.
- [`useFocus`](file:///packages/core/src/hooks/useFocus.ts): Discriminated focus management (`type: 'modality'` for Dialog/Popover traps, `type: 'navigation'` for roving tabIndex / arrow keys).
- [`useMergeRefs`](file:///packages/core/src/hooks/useMergeRefs.ts): Composes multiple internal and external React 19 refs.
- [`usePartsRegistry`](file:///packages/core/src/hooks/usePartsRegistry.ts): Coordinates dynamic child component presence within compound parents.
- [`useTheme`](file:///packages/core/src/theme/useTheme.ts): Controls active theme, color mode (`light`, `dark`, `system`), and resolved mode.

---

## 2. How the Design System Works

### 1. Styling with `@cumulo/css`

Cumulo uses an atomic, compile-time extracted CSS engine. **Do not use arbitrary inline style props.**

- **Static Styles (`style`)**:
  ```ts
  import { style } from '@cumulo/css';
  import { vars } from '../contract.js';

  export const containerStyle = style({
    display: 'flex',
    padding: vars.spacing.md,
    borderRadius: vars.radius.md,
    backgroundColor: vars.color.background.base,
  });
  ```
- **Variant Recipes (`recipe`)**:
  ```ts
  import { recipe } from '@cumulo/css';
  import { vars } from '../contract.js';

  export const buttonRecipe = recipe({
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: vars.font.sans,
    },
    variants: {
      intent: {
        primary: { backgroundColor: vars.color.primary.base, color: vars.color.primary.contrast },
        neutral: { backgroundColor: vars.color.grey.base, color: vars.color.grey.contrast },
      },
      size: {
        sm: { height: '28px', padding: `0 ${vars.spacing.xs}` },
        md: { height: '36px', padding: `0 ${vars.spacing.sm}` },
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  });
  ```
- **Class Merging (`cx`)**: Cleanly combines static styles, recipe outputs, and external class names (`className={cx(buttonRecipe({ intent, size }), className)}`).
- **Recipe Default Variants Rule**:
  `recipe()` automatically falls back to `defaultVariants` when a property is `undefined`. If a variant dimension (e.g. `size`) does not apply to all usages or variants, do **not** set it in `defaultVariants`. Instead, resolve it conditionally in the component or use compound variants.

### 2. Tokens, Themes & Color Modes

- **Design Token Contract**: Always consume tokens through `vars` (`contract.ts`).
  - Colors: `vars.color.primary.*`, `vars.color.grey.*`, `vars.color.success.*`, `vars.color.error.*`, etc.
  - Geometry: `vars.spacing.*`, `vars.radius.*`, `vars.shadow.*`, `vars.border.*`.
  - Typography: `vars.font.*`, `vars.fontSize.*`, `vars.fontWeight.*`, `vars.lineHeight.*`.
- **Theme vs Color Mode Decoupling**:
  - **Theme**: Visual branding identity (`default`, `docs`, `cloud`). Configured via `[data-theme='...']` on `<html>`. Pure CSS variable overrides—avoid runtime `<style>` injection.
  - **Color Mode**: Appearance (`light | dark | system`). Configured via `document.documentElement.style.colorScheme`.
  - **Intrinsic Light/Dark Support**: All themes intrinsically support both modes using CSS `light-dark()` calculations. `'dark'` is **never** a theme name.
- **Zero-FOUC Restoration**: Embed `<ThemeScript />` directly in HTML `<head>`. Manage modes via `useTheme()` and `<ThemeToggle />`.

### 3. Component Composition Patterns

- **Compound Components (`Field` Pattern)**:
  - Export modular components (`FieldRoot`, `FieldInput`, `FieldLabel`, etc.) plus compound namespace (`export const Field = { Root, Input, Label, Error, Description, Group };`).
  - Use `FieldContext` and `usePartsRegistry` for dynamic subcomponent presence.
  - Seamlessly coordinate IDs (`aria-labelledby`, `aria-describedby`, `aria-invalid`, `htmlFor`). Subcomponents automatically inherit state (e.g. invalid status propagates `intent="error"` to `FieldInput`).
- **Modern Top-Layer Overlays**:
  - `<Dialog>` uses native `<dialog>` with `.showModal()`, backdrop styling via `::backdrop`, and native `closedby="any"` / `cancel` events.
  - `<Popover>` uses native `popover="auto"` with CSS Anchor Positioning (`position-anchor`, `anchor-name`, `@position-try`).
  - `<Tooltip>` uses `<Popover>` under the hood (`popover="manual"`, `variant="tooltip"`). Because tooltips use native top-layer, they are **never clipped by parent scroll containers** (`overflow-y: auto` in `<Sidebar>`).

---

## 3. TypeScript Standards & Strict Usage

Strict type safety is non-negotiable across the monorepo.

### Zero `any` & No Type Casting (`as Type`)

- **NEVER use `any`**. Use `unknown` with narrowing, type guards (`is`), or discriminated unions.
- **Do NOT use `as` casting** to bypass compiler checks or silence errors.
- **Invariant Narrowing in Tests**: Throw invariant errors instead of casting DOM elements:
  ```ts
  // Correct:
  if (!(input instanceof HTMLInputElement))
    throw new Error('Expected input to be HTMLInputElement');
  expect(input).toBeDisabled();

  // Forbidden:
  expect((input as HTMLInputElement).disabled).toBe(true);
  ```

### Strict Function & Factory Return Typing

Always annotate return types directly on functions, factories, and hook callbacks (`(): ReturnType => ...`) rather than passing generic parameters to outer calls (e.g. `useMemo<Type>(...)`):

```ts
// Correct: preserves strict excess property checking on object literals
const contextValue = useMemo((): FieldContextValue => ({
  id,
  isInvalid,
  registerPart,
}), [id, isInvalid, registerPart]);

// Forbidden: generic parameter bypasses excess property checks
const contextValue = useMemo<FieldContextValue>(() => ({ ... }), [deps]);
```

Annotating the return signature directly (`(): Type => ({ ... })`) ensures TypeScript enforces exact property shapes and flags invalid or extraneous properties on returned object literals.

### Discriminated Unions for Mutually Exclusive Options

Avoid monolithic prop types with loose optional flags that permit conflicting states. Model mutually exclusive behaviors using a discriminant:

```ts
export type UseFocusOptions = {
  restoreFocusOnUnmount?: boolean;
  loop?: boolean;
} & (UseFocusNavigationOptions | UseFocusModalityOptions);

export interface UseFocusModalityOptions {
  type: 'modality';
  trap?: boolean;
  onTabOut?: () => void;
  navigation?: never;
  itemSelector?: never;
  rovingTabIndex?: never;
}

export interface UseFocusNavigationOptions {
  type: 'navigation';
  navigation: 'vertical' | 'horizontal' | 'both';
  itemSelector?: string;
  rovingTabIndex?: boolean;
  trap?: never;
  onTabOut?: never;
}
```

- **Rule for `never`**: Only use `never` on properties that exist on other union branches to block cross-usage. Never declare `never` for properties not part of the component or interface.

### React 19 Props & Semantic Invariants

- **Extend `ElementProps<T>`**: Component props must extend `ElementProps<T>` from [`packages/core/src/ElementProps.ts`](file:///packages/core/src/ElementProps.ts) (never raw `React.HTMLAttributes<T>`).
- **Pass `ref` Directly**: React 19 components accept `ref?: React.Ref<T>` directly as a prop. Avoid `React.forwardRef`. Merge refs via `useMergeRefs(...)`.
- **Non-Configurable Semantic Invariants**: If an element has fixed platform semantics (e.g. `<Tooltip>` must always have `role="tooltip"` and `popover="manual"`), hardcode them internally and omit them from the public prop interface (`Omit<ElementProps<HTMLDivElement>, 'role' | 'popover'>`).
- **Monorepo TSConfig**: **Never** set `"rootDir"` in workspace package `tsconfig.json` files (breaks cross-package source resolution during builds).

---

## 4. Code Standards & Architecture Rules

### Zero Barrel Files (`oxc/no-barrel-file`)

- **No Intermediate Barrel Files**: Never create or maintain files like `src/components/index.ts`, `src/hooks/index.ts`, or `src/tokens/index.ts`.
- **No Wildcard Exports**: Never use `export * from '...'`. Use explicit named exports:
  ```ts
  export { Button, type ButtonProps, type ButtonVariants } from './components/Button.js';
  ```
- **Direct Module Imports**: Internal files must import directly from target source files (`import { useFocus } from '../hooks/useFocus.js';`).
- **Clean Root Exports**: Do **not** export private styling utilities (`layout.ts`, `intents.ts`, `typography.ts`) or private recipes from the root entrypoint (`packages/core/src/index.ts`). Export only canonical public components, tokens, and hooks. Subpaths are configured via `package.json` exports.

### Component Testing Standards (`packages/core/test/`)

- **Behavior Over Ceremony**:
  - **NEVER test styles, CSS classes, or recipe outputs** in component unit tests (`expect(el.className).toContain(...)` is strictly forbidden). Style compilation is tested in `@cumulo/css`; DOM computed styles are tested in `@cumulo/fixtures`.
  - **No boilerplate checks**: Do not test "merges className" or "forwards ref".
  - **Leaf components** (`Card`, `Surface`, `Badge`): Require only a simple smoke render test (`it('renders without crashing')`).
  - **Interactive & compound primitives**: Test actual accessibility wiring (`aria-*`), state transitions (controlled vs uncontrolled), event guards (`disabled`), focus trapping, roving tabIndex, and dynamic part registration.
  - **JSDOM Popover Note**: Because JSDOM does not render top layers for `popover="auto"`, assert `toBeInTheDocument()` and `data-state="open"` rather than raw `toBeVisible()`. Always import `@testing-library/jest-dom/vitest`.

### Documentation & Docgen

- **NEVER Manually Edit Docgen Files**: `apps/docs/docgen/components/*.json` are strictly read-only artifacts generated by `@renr/parcel-reporter-docgen` at build time.
- **JSDoc Authoring**: All documentation prop tables (`<PropsTable data={...Doc} />`) are extracted from JSDoc comments (`/** ... */`) on component TypeScript interfaces. Always document props with clear JSDoc descriptions.

---

## 5. Key Workflows & CLI Commands

```bash
# Development & Build
pnpm dev                  # Run tsdown watchers across workspace
pnpm build                # Build all packages & documentation site
pnpm --filter @cumulo/core dev   # Develop core library
pnpm --filter @cumulo/docs dev   # Run documentation site locally

# Quality & Verification
pnpm check                # Full check: type-check + lint:fix + format (Run before every commit)
pnpm type-check           # Root and workspace TypeScript type checking
pnpm test                 # Run all Vitest unit and bundler tests
pnpm --filter @cumulo/fixtures test:browser  # Vitest native Chromium visual regression tests
pnpm bench                # Run microbenchmarks (packages/css/bench/)

# Release Management
pnpm changeset            # Generate a new changeset
pnpm version              # Bump package versions from changesets
```
