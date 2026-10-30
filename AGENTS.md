# Cumulo Monorepo — Agent Instructions (AGENTS.md)

Instructions for autonomous and pairing AI coding assistants contributing to, refactoring, or authoring code **within the Cumulo repository**.

> **Note for Consumer Codebases**: If you are an AI assistant helping a developer build software _using_ `@cumulo/core` and `@cumulo/css` in an external application, refer to the [Consumer Guide](#appendix-instructions-for-external-consumers) or the public [Working with AI documentation page](apps/docs/src/pages/ai.mdx). External consumers are free to use whatever TypeScript, ref, or barrel conventions they wish in their own apps.

---

## 1. Monorepo TypeScript & Code Standards

These rules are strictly enforced across all packages in this monorepo (`@cumulo/core`, `@cumulo/css`, `@cumulo/unplugin`, `@cumulo/parcel-transformer`, `apps/docs`).

### Zero `any` & No Type Casting (`as Type`)

- **NEVER use `any`**. Use `unknown` with narrowing, type guards (`is`), or discriminated unions.
- **NEVER use `as` casting** to bypass compiler checks or silence type errors.
- **Invariant narrowing in tests**: Throw an invariant error instead of casting DOM elements:
  ```ts
  // Correct:
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Expected input to be HTMLInputElement');
  }
  expect(input).toBeDisabled();

  // Forbidden:
  expect((input as HTMLInputElement).disabled).toBe(true);
  ```

### Zero Intermediate Barrel Files (`oxc/no-barrel-file`)

- **Never create or import from barrel files** like `src/components/index.ts`, `src/hooks/index.ts`, or `src/tokens/index.ts`.
- **Direct internal imports**: Internal monorepo files must import directly from target source modules (`import { useFocus } from '../hooks/useFocus.js';`).
- **No wildcard re-exports**: Do not use `export * from '...'`. Use explicit named exports from canonical package entrypoints (`packages/core/src/index.ts`).
- **Clean root exports**: Never export private styling utilities (`layout.ts`, `intents.ts`, `typography.ts`) or private recipes from the root entrypoint.

### React 19 Component Authoring

- **No `React.forwardRef`**: React 19 components accept `ref?: React.Ref<T>` directly as a standard prop.
- **Merge refs with `useMergeRefs`**: Always merge internal DOM refs and user-provided refs via `useMergeRefs(...)`.
- **Extend `ElementProps<T>`**: Props must extend `ElementProps<T>` from `packages/core/src/ElementProps.ts` (never raw `React.HTMLAttributes<T>`).
- **Hardcode fixed platform semantics**: If an element has non-configurable semantics (e.g. `<Tooltip>` must have `role="tooltip"` and `popover="manual"`), hardcode them internally and omit them from the public prop interface:
  ```ts
  export interface TooltipProps extends Omit<ElementProps<HTMLDivElement>, 'role' | 'popover'> {
    // ...
  }
  ```

### Strict Function & Factory Return Typing

Annotate return types directly on functions, factories, and hook callbacks (`(): ReturnType => ...`), never on generic parameters to outer calls (e.g. `useMemo<Type>(...)`):

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

---

## 2. UI & Styling Invariants (Authoring in this Monorepo)

When writing components, templates, or documentation pages inside this repo:

### Negative Layout Rules (Follow Astryx Pattern)

- **No raw `<div>` for layout or spacing** $\rightarrow$ Use Cumulo layout primitives:
  - Row / column layouts $\rightarrow$ `<HStack>`, `<VStack>`, `<Stack>`
  - Stacked `<Heading>` / `<Text>` pairs $\rightarrow$ Because typography primitives use `text-box: trim-both cap alphabetic`, use at least `gap="sm"` (or `<Flow>`) rather than `2xs`/`xs` when stacking text vertically.
  - Main responsive wrappers $\rightarrow$ `<Container>`
  - Spaced article / document flow $\rightarrow$ `<Flow>`
  - Application shell $\rightarrow$ `<AppFrame>`, `<Panel>`, `<Sidebar>`, `<SideNav>`
- **No monolithic input elements** $\rightarrow$ Always use compound `Field` subcomponents:
  - `<Field.Root>` coordinates state (`isInvalid`, IDs, `aria-labelledby`, `aria-describedby`)
  - Subcomponents (`Field.Label`, `Field.Input`, `Field.Error`, `Field.Description`, `Field.Group`) automatically inherit state and IDs via `FieldContext`.
- **No Tailwind classes or arbitrary inline styles** $\rightarrow$ Use `@cumulo/css`:
  - Static styles $\rightarrow$ `style({ ... })`
  - Variant styles $\rightarrow$ `recipe({ base, variants, defaultVariants })`
  - Class merging $\rightarrow$ `cx(...)`
  - Design tokens $\rightarrow$ `vars.*` from `contract.ts` (`vars.color.*`, `vars.surface.*`, `vars.spacing.*`, `vars.radius.*`).
  - No raw hex, rgb, or hsl values.

### Theme & Color Mode Decoupling

- **Theme**: Visual branding identity (`default`, `docs`, `cloud`). Configured via `[data-theme='...']` on `<html>`. Pure CSS variable overrides—no runtime `<style>` injection.
- **Color Mode**: Appearance (`light`, `dark`, `system`). Configured via `document.documentElement.style.colorScheme`. All themes intrinsically support both modes via CSS `light-dark()` calculations. `'dark'` is **never** a theme name.
- Embed `<ThemeScript />` directly in HTML `<head>`. Manage modes via `useTheme()` and `<ThemeToggle />`.

---

## 3. Testing & Validation Standards

- **NEVER test styles, CSS classes, or recipe outputs** in component unit tests (`expect(el.className).toContain(...)` is strictly forbidden). Style compilation is tested in `@cumulo/css`; DOM computed styles are tested in `@cumulo/fixtures`.
- **No boilerplate checks**: Do not write tests for "merges className" or "forwards ref".
- **Interactive & compound primitives**: Test actual accessibility wiring (`aria-*`), state transitions (controlled vs uncontrolled), event guards (`disabled`), focus trapping, roving tabIndex, and dynamic part registration.
- **JSDOM Popover Note**: Because JSDOM does not render top layers for `popover="auto"`, assert `toBeInTheDocument()` and `data-state="open"` rather than raw `toBeVisible()`. Always import `@testing-library/jest-dom/vitest`.

---

## 4. Mandatory Monorepo Self-Check Pass

Before finalizing any changes within this monorepo, perform this verification pass:

1. [ ] **Zero `any` & No `as`**: Does the code compile with zero `any` and zero `as` casts?
2. [ ] **No Barrels**: Are imports pointing directly to target source files or package roots without intermediate `index.ts` files?
3. [ ] **React 19 Refs**: Are component refs passed directly without `React.forwardRef` and merged via `useMergeRefs`?
4. [ ] **Layout Components**: Are docs/demos using `<Stack>`, `<HStack>`, `<VStack>`, or `<Container>` rather than raw flexbox `<div>`s?
5. [ ] **Tokens Only**: Are all visual values referencing `vars.*` rather than raw values?

---

## 5. Verification Commands

Run before committing changes:

```bash
pnpm check        # Runs: type-check + lint:fix + format
pnpm test         # Runs all unit and bundler tests
```

---

## Appendix: Instructions for External Consumers

When authoring instructions or prompts for external developers using `@cumulo/core` and `@cumulo/css` in their own applications:

- **Do not mandate consumer TypeScript rules**: Consumers can use `any`, barrel files, or React 18/19 patterns in their own projects as they see fit.
- **Focus purely on Cumulo API contracts**:
  1. Layout: Use `<HStack>`, `<VStack>`, `<Stack>`, `<Container>` instead of arbitrary `<div>` flexbox.
  2. Forms: Use compound `<Field.Root>`, `<Field.Label>`, `<Field.Input>`, `<Field.Error>` slots.
  3. Styling: Use `@cumulo/css` (`style()`, `recipe()`, `vars.*`) rather than expecting Tailwind utility classes to style Cumulo components.
  4. Theming: Use `[data-theme='...']` for brands and `light-dark()` with `<ThemeScript />` for dark mode.
