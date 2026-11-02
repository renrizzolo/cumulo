# @cumulo/css

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

  **core (breaking):** The `cumulo` theme generator CLI now requires `--out-path` or `--in-place`. It no longer writes a fallback `theme-vars.ts`.

  **css:** `createThemeContract()` returns a contract with a `$set()` helper and remembers its prefix, so `createTheme()`, `createGlobalTheme()` and `assignVars()` no longer need the prefix passed again.

### Patch Changes

- 0471aeb: Alpha WIP not ready
