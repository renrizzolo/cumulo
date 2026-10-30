---
'@cumulo/core': minor
'@cumulo/css': minor
---

**core:**

- Added new UI components:
  - `Alert` compound primitive (`Alert.Root`, `Alert.Title`, `Alert.Description`, `Alert.Action`, `Alert.Close`) with `useAlert()` and semantic intent variants (`info`, `success`, `warning`, `error`, `neutral`, `primary`).
  - `Grid` layout component (`Grid`, `GridItem`, `gridContract`) for responsive, token-aware CSS grid layouts.
  - `Kbd` component for displaying keyboard shortcuts and keys.
  - `Link` accessible styled anchor component.
  - `Menu` accessible popup/context menu primitive (`Menu.Root`, `Menu.Trigger`, `Menu.Content`, `Menu.Item`, `Menu.Separator`, `Menu.Group`, `Menu.Label`) with top-layer popover support and roving focus.
  - `Select` styled select component with chevron indicator, custom select styles, and `appearance: 'base-select'` support.
  - `Spinner` animated loading indicator with intent and size variants.
- Added polymorphic `as` prop support to `Stack` (`HStack`, `VStack`) and `Surface`.
- Enhanced existing components:
  - `Button`: added prefix/suffix slots, loading indicator support, and variant refinements.
  - `ButtonGroup`: added support for attached styling, orientation, and roving keyboard navigation.
  - `Checkbox`: added support for indeterminate state and improved accessibility associations.
  - `Dialog`: enhanced native `<dialog>` handling, size variants, responsive display, and scroll lock behavior.
  - `Divider`: added orientation support (vertical/horizontal) and embedded label/content styling.
  - `Field`: improved dynamic part registration and ARIA attribute coordination.
  - `Input`: added input prefixes, suffixes, clear button, and size variants.
  - `Popover`: improved anchor positioning fallbacks and dismissible layering.
  - `Radio` / `RadioList`: enhanced compound behavior and keyboard navigation.
  - `Switch`: added integrated label support, intent colors, and size variants.
  - `Tabs`: enhanced roving focus and orientation options.

**css:**

- Extended `CSSProperties` type definition with modern web features: `appearance: 'base-select'`, `interpolateSize`, CSS Anchor Positioning properties (`anchorName`, `positionAnchor`, `positionArea`, `positionTryFallbacks`, `positionTry`, `positionTryOrder`), and CSS corner shapes.
- Updated `props(...)` helper to seamlessly accept and type combined `React.CSSProperties & CSSProperties` inline styles alongside class names.
