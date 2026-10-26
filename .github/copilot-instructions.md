# Cumulo Monorepo — GitHub Copilot Reviewer Instructions

Instructions for AI reviewers, GitHub Copilot, and automated pull request inspection across the **Cumulo repository** (`@cumulo/core`, `@cumulo/css`, `@cumulo/unplugin`, `@cumulo/parcel-transformer`, `apps/docs`).

---

## 1. Core principle: score the failure, not its likelihood

A finding's severity is determined strictly by **what breaks or deteriorates if it ships**, not by how likely the trigger is, who wrote it, or whether an automated tool already flagged it.

- A rare edge-case type escape is still a blocker.
- An `eslint-disable` suppressing a forbidden pattern is still a blocker.
- "The happy path works" or author seniority never softens a bright-line rule into an advisory suggestion.
- Score the failure first; use likelihood only to prioritize the fix, never to decide whether it blocks.

---

## 2. 🔴 Always blocking criteria

Pull requests containing any of the following violations must **not** be approved:

### 1. Hardcoded colors and untokenized values

- **Zero raw hex, rgb, or hsl values**: Every color in styles or components must be a design token (`vars.color.*`) or derived from tokens via CSS `light-dark()`, `color-mix()`, or `calc()`.
- **Zero hardcoded spacing or radii**: Margin, padding, gap, and border-radius must consume `vars.spacing.*` and `vars.radius.*`.
- **"No suitable token exists" is not an exception**: Propose adding or generating the appropriate token in `contract.ts` or theme files; do not commit inline literals.

### 2. Raw `<div>` for layout or spacing

- Monorepo components and documentation pages must **never** use raw `<div>` tags with `display: flex`, `flex-direction`, or custom spacing styles.
- **Enforce layout destinations**:
  - Row flexbox $\rightarrow$ `<HStack>`
  - Column flexbox $\rightarrow$ `<VStack>`
  - Directional flexbox $\rightarrow$ `<Stack>`
  - Responsive content container $\rightarrow$ `<Container>`
  - Prose or document flow spacing $\rightarrow$ `<Flow>`
  - Application frame $\rightarrow$ `<AppFrame>`, `<Panel>`, `<Sidebar>`, `<SideNav>`

### 3. Monolithic input elements

- Never permit monolithic form inputs (`<Input label="..." error="..." />`).
- All form controls must be authored using compound `<Field.*>` slots:
  - `<Field.Root>`
  - `<Field.Label>`
  - `<Field.Input>` / `<Field.Textarea>`
  - `<Field.Error>`
  - `<Field.Description>`
  - `<Field.Group>`

### 4. Zero `any` and no type casting (`as Type`)

- **Never allow `any`**: Flag any appearance of `any`. Require `unknown` with narrowing, type guards, or discriminated unions.
- **Never allow `as` type assertions**: Flag `as Type` casts that silence compiler checks.
- **Tests**: Require invariant checks (`if (!(el instanceof HTMLInputElement)) throw ...`) instead of `expect((el as HTMLInputElement)...)`.

### 5. Intermediate barrel files (`oxc/no-barrel-file`)

- Internal imports within the monorepo must import directly from target modules (for example, `import { useFocus } from '../hooks/useFocus.js';`).
- Intermediate barrels like `src/components/index.ts`, `src/hooks/index.ts`, or wildcard `export *` from sub-directories are strictly prohibited.

### 6. React 19 component authoring violations

- **No `React.forwardRef`**: Components must accept `ref?: React.Ref<T>` directly as a prop.
- **Ref composition**: Internal and forwarded refs must be composed via `useMergeRefs(...)`.
- **Typing**: Props must extend `ElementProps<T>` from `packages/core/src/ElementProps.ts`, not raw `React.HTMLAttributes<T>`.

### 7. Untokenized or Tailwind utilities

- Monorepo code must use `@cumulo/css` (`style()`, `recipe()`, `cx()`). No Tailwind classes or inline `style={{ ... }}` props are permitted.

---

## 3. 🟡 Warnings and advisory findings

Flag the following for author attention and review:

- **Missing accessibility wiring**: Ensure custom interactive components wire `aria-labelledby`, `aria-describedby`, and keyboard handlers (arrow navigation, Enter/Space activation, Escape dismissal).
- **Redundant recipe variants**: Flag variant dimensions defined in `defaultVariants` that are not universally applicable to all variant permutations.
- **JSDoc documentation**: Ensure exported props interfaces on public components carry descriptive JSDoc comments for automated docgen extraction.
- **Testing scope**: Ensure component unit tests verify real DOM behavior and accessibility states (`toBeInTheDocument()`, `data-state="open"`), never private CSS classes or computed styles.

---

## 4. Reviewer checklist

Before approving any PR:

- [ ] Are all color, spacing, and geometry styles referencing `vars.*` tokens?
- [ ] Are all layout arrangements composed with Cumulo layout primitives instead of raw `<div>`s?
- [ ] Are form inputs using compound `Field.*` subcomponents?
- [ ] Is TypeScript 100% strictly typed (zero `any`, zero `as` assertions)?
- [ ] Are internal imports direct and free of intermediate barrels?
- [ ] Did `pnpm check` and `pnpm test` pass with zero warnings or errors?
