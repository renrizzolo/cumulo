# @cumulo/core

## 0.2.0-alpha.4

### Minor Changes

- af6dde5: Add CSS cascade layers, `Stack`-based `Surface`/`Card`, and control/field appearance tokens:

  - Move all component styles into `@layer components` (matching `theme.css`'s `@layer reset, base, components, utilities;`) so unlayered consumer `className` overrides deterministically win regardless of bundle order.
  - Build `Surface` (and `Card`) on top of `Stack` so `direction`, `gap`, `align`, `justify`, `wrap`, and `flex` props work directly without wrapper elements.
  - Render `Dialog.Content` inside a scrollable `Surface` configurable via `contentProps` (fixing scroll/corner clipping; padding and gap now apply to the inner `Surface` rather than the `<dialog>` element).
  - Add `vars.control.*`, `vars.field.*`, `vars.surface.bg.image`, and `vars.surface.stroke.width` tokens with built-in `[data-control-style='raised']` and `[data-control-style='3d']` presets, and tighten default motion durations.
  - **Visual changes:** migrate focus rings from `box-shadow` to `outline` + `outline-offset` (preserving custom control shadows on focus) and clamp `Checkbox` border-radius to `min(vars.radius.md, 30%)`.

### Patch Changes

- 5fd58b8: Fix `Table` layout on small screens by resetting `word-break` and `overflow-wrap` for nested `<code>` elements, constraining the horizontal scroll wrapper and keeping the `bordered` frame on the wrapper, keeping table headers unwrapped, and tightening mobile cell padding.
- Updated dependencies [af6dde5]
  - @cumulo/css@0.2.0-alpha.4

## 0.2.0-alpha.3

### Minor Changes

- 981d8d3: - `@cumulo/css`:
  - Add support for `@starting-style` rules (both top-level and nested within `selectors`) and selector-nested `@media` rules in `style()` and `recipe()`.
  - Deep-merge nested rule objects (such as `selectors` and `@starting-style`) when combining `recipe()` `base` arrays and `extend` presets.
  - `@cumulo/core`:
    - Add `Dialog` sheet placements (`placement?: 'center' | 'bottom' | 'left' | 'right'`), `Dialog.Handle` drag-to-dismiss subcomponent, and reusable `useDrag` / `useSwipeDismiss` gesture hooks.
    - Add `@cumulo/core/transitions` (`discreteFade`, `discreteFadeScale`, `discreteSlide`, `discreteBackdrop`, `popoverTransition`, `selectPickerTransition`) with `prefers-reduced-motion: reduce` support.
    - Add CSS discrete property enter/exit transitions (`allow-discrete` + `@starting-style`) across all `Dialog` placements and `::backdrop`, as well as `Popover`, `Tooltip`, `Menu`, and `Select` picker.

### Patch Changes

- Updated dependencies [7f1708b]
- Updated dependencies [981d8d3]
  - @cumulo/css@0.2.0-alpha.3

## 0.2.0-alpha.2

### Minor Changes

- da9fe31: **Breaking:** Remove the `generate-theme --in-place` CLI flag (mutating `node_modules` is ephemeral and unsafe with pnpm hard links); use `--out <path>` or the bundler plugin `theme` option instead.

  Add opt-in `--include-custom` / `includeCustomVars` to include custom consumer CSS variables in generated `vars` contracts, skip disk writes when output is unchanged, export `generateTheme`/`runThemeGeneration` from `@cumulo/core/cli`, attach build-time metadata to `vars`, decouple `Heading` from `Text` via `textSharedRecipe`, and resolve `intents.ts` secondary var map lazily.

- ab3bef3: **core (deprecation):** The root @cumulo/core barrel is deprecated. Import from per-component paths (e.g. @cumulo/core/components/Button) so RSC client boundaries are explicit and per-component CSS keeps a stable, shared order across bundles.

  fix: add `useTheme` missing `'use client'` directive.

### Patch Changes

- Updated dependencies [da9fe31]
  - @cumulo/css@0.2.0-alpha.2

## 0.2.0-alpha.1

### Minor Changes

- 877db68: feat: add Avatar and AvatarGroup components with image fallback, initials derivation, status badges, and group stacking
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
- 9ecc189: **core:**

  - Added new UI components:
    - `Alert` compound primitive (`Alert.Root`, `Alert.Title`, `Alert.Description`, `Alert.Action`, `Alert.Close`) with `useAlert()` and semantic intent variants (`info`, `success`, `warning`, `error`, `neutral`, `primary`).
    - `Grid` layout component (`Grid`, `GridItem`, `gridContract`) for responsive, token-aware CSS grid layouts.
    - `Kbd` component for displaying keyboard shortcuts and keys.
    - `Link` accessible styled anchor component.
    - `Menu` accessible popup/context menu primitive (`Menu.Root`, `Menu.Trigger`, `Menu.Content`, `Menu.Item`, `Menu.Separator`, `Menu.Group`, `Menu.Label`) with top-layer popover support and roving focus.
    - `RadioGroup` repalces `RadioList`. Compound primitive (`RadioGroup.Root`, `RadioGroup.Item`, `useRadioGroup()`) with flex/stack layout integration (`orientation`, `direction`, `gap`, `align`, `justify`) and `Field.RadioGroup` integration.
    - `Select` styled select component with chevron indicator, custom select styles, and `appearance: 'base-select'` support.
    - `Spinner` animated loading indicator with intent and size variants.
  - Added headless hooks and typed compound factories:
    - Added generic headless `useValueGroup` hook (`value`, `defaultValue`, `onValueChange`) for single-selection controls.
    - Added strictly typed factories: `createRadioGroup<T>()`, `createTabs<T>()`, `createButtonGroup<T>()`, and `createSelect<T>()` constraining value unions to string literal types `T`.
  - Added polymorphic `as` prop support to `Stack` (`HStack`, `VStack`) and `Surface`.
  - Enhanced existing components:
    - `Button`: added prefix/suffix slots, loading indicator support, and variant refinements.
    - `ButtonGroup`: added support for attached styling, orientation, and roving keyboard navigation via `useValueGroup`.
    - `Checkbox`: added support for indeterminate state and improved accessibility associations.
    - `Dialog`: enhanced native `<dialog>` handling, size variants, responsive display, and scroll lock behavior.
    - `Divider`: added orientation support (vertical/horizontal) and embedded label/content styling.
    - `Field`: improved dynamic part registration, ARIA attribute coordination, and registered `Field.RadioGroup`.
    - `Input`: added input prefixes, suffixes, clear button, and size variants.
    - `Popover`: improved anchor positioning fallbacks and dismissible layering.
    - `Radio`: enhanced integration with `RadioGroupContext` and `useValueGroup`.
    - `Switch`: added integrated label support, intent colors, and size variants.
    - `Tabs`: enhanced roving focus, orientation options, and unified value state via `useValueGroup`.
    - Added `controlIntent` to share error styles between checkbox, switch and radio.

  **css:**

  - Extended `CSSProperties` type definition with modern web features: `appearance: 'base-select'`, `interpolateSize`, CSS Anchor Positioning properties (`anchorName`, `positionAnchor`, `positionArea`, `positionTryFallbacks`, `positionTry`, `positionTryOrder`), and CSS corner shapes.
  - Updated `props(...)` helper to seamlessly accept and type combined `React.CSSProperties & CSSProperties` inline styles alongside class names.

- 91b78da: **core:** Add `setDefaultTheme()` to set the fallback theme once at startup. `useTheme()` no longer accepts a default theme argument. `setTheme()` ignores blank names, and `Theme` no longer lists `'cloud'` and `'docs'`.

  **core (breaking):** The `cumulo` theme generator CLI now requires `--out` or `--in-place`. It no longer writes a fallback `theme-vars.ts`.

  **css:** `createThemeContract()` returns a contract with a `$set()` helper and remembers its prefix, so `createTheme()`, `createGlobalTheme()` and `assignVars()` no longer need the prefix passed again.

### Patch Changes

- 0471aeb: Alpha WIP not ready
- Updated dependencies [4610509]
- Updated dependencies [0471aeb]
- Updated dependencies [9ecc189]
- Updated dependencies [91b78da]
  - @cumulo/css@0.2.0-alpha.0
