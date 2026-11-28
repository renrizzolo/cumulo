# @cumulo/unplugin

## 0.2.0-alpha.4

### Minor Changes

- af6dde5: Prepend the canonical `@layer` order declaration (`LAYER_ORDER_STATEMENT`) to extracted CSS containing `@layer` rules so cascade layer precedence is preserved regardless of stylesheet import order.

### Patch Changes

- Updated dependencies [af6dde5]
  - @cumulo/css@0.2.0-alpha.4

## 0.2.0-alpha.3

### Patch Changes

- Updated dependencies [7f1708b]
- Updated dependencies [981d8d3]
  - @cumulo/css@0.2.0-alpha.3

## 0.2.0-alpha.2

### Minor Changes

- da9fe31: Rewrite evaluated top-level `style()`, `create()`, `keyframes()`, `recipe()`, `createTheme()`, `createGlobalTheme()` and `createGlobalStyles()` calls to `@cumulo/css/runtime` lookups, inline static `vars.a.b` accesses (including aliased `@cumulo/core/contract` and standalone generated `--out` `vars` files), and prune imports left unused.

  Add optional `theme` auto-sync (`{ css, out, includeCustomVars? }`) across `@cumulo/unplugin` and `@cumulo/unplugin/postcss`. Fix `@cumulo/unplugin/postcss` to extract CSS for pages importing `@cumulo/core` components without `@cumulo/css`.

### Patch Changes

- Updated dependencies [da9fe31]
  - @cumulo/css@0.2.0-alpha.2

## 0.2.0-alpha.1

### Minor Changes

- 7935d33: **unplugin:**

  - Added dedicated `@cumulo/unplugin/next` entrypoint with `withCumulo` Webpack plugin wrapper.
  - Added dedicated `@cumulo/unplugin/postcss` entrypoint with `cumuloPostcss` for seamless zero-config CSS extraction in Next.js (Turbopack and Webpack) and standalone PostCSS pipelines.
  - Standardized a single `cumulo` named export alongside the default export across all bundler subpaths (`/vite`, `/webpack`, `/rollup`, `/esbuild`, `/parcel`, `/next`, `/postcss`, and root `/index`).
  - Added dual ESM and CommonJS outputs for universal bundler loader compatibility.

  **parcel-transformer:**

  - Standardized `cumulo` named export alongside default export.

  **css:**

  - `recipe`: Added a compile-time type error when both `variants` and `extend` are omitted (use `style()` for static styles).

  **core:**

  - `Slider`: Added `Slider` range input component with `Field.Slider` integration.
  - `List` & `DescriptionList`: Added `List` and `DescriptionList` compound components.
  - `Card`, `Select`, `Grid`: Standardized compound namespace exports (`export * as ...`).
  - `Link`: Added polymorphic `as` prop support with full generic type preservation (`LinkProps<E>`).
  - `Sidebar`: Added `Sidebar.Content` (`SidebarContent`) subcomponent with configurable collapse behaviors (`clip`, `fade`, `collapse`, `none`) and `flex` filling.
  - `Menu` & `Popover`: Fixed nested menu/popover dismissal and focus restoration (`useDismissible`, `useFocus`), and added `MenuLevel` / `PopoverLevel` exports.
  - `Theme`: Fixed color mode regression and `theme.css` / contract / intent token styling across form controls (`Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Field`) and layout primitives.
  - `ElementProps`: Added `'hint'` support to `popover` prop type.
  - `Heading`: Calibrated default sizes across heading levels (`h1: '2xl'`, `h2: 'xl'`, `h3: 'lg'`, `h4: 'md'`, `h5: 'sm'`).
  - `Badge`: Added `whiteSpace: 'nowrap'` and `flexShrink: 0` for consistent label layout.
  - `Code`: Refined font size to `0.9em` and updated base variant background token.
  - `Flow`: Adjusted default spacing variant to `lg`.
  - Removed `reset.ts` in favor of `@layer reset` in `@cumulo/core/theme.css`.

### Patch Changes

- 863b888: chore: switch to Oxlint tsrs backend for type-aware linting and type checking, and resolve newly surfaced type-aware lint diagnostics
- Updated dependencies [7935d33]
- Updated dependencies [863b888]
  - @cumulo/css@0.2.0-alpha.1

## 0.2.0-alpha.0

### Minor Changes

- 4610509: more WIP

### Patch Changes

- 0471aeb: Alpha WIP not ready
- Updated dependencies [4610509]
- Updated dependencies [0471aeb]
- Updated dependencies [9ecc189]
- Updated dependencies [91b78da]
  - @cumulo/css@0.2.0-alpha.0
