# Cumulo Monorepo — Maintainer & Agent Instructions (CLAUDE.md)

Instructions for Claude Code and coding agents working inside the **Cumulo repository**. See [AGENTS.md](./AGENTS.md) for complete details.

### Monorepo Invariants (Private)

- **Zero `any` & No `as` casting**: Use `unknown` with narrowing and invariant checks.
- **No intermediate barrel files (`oxc/no-barrel-file`)**: Import directly from source files, never from `index.ts` sub-barrels.
- **React 19 component authoring**: Accept `ref?: React.Ref<T>` directly as a prop (no `React.forwardRef`); merge with `useMergeRefs(...)`.
- **Testing**: Test behavior and accessibility (`aria-*`), never assert class names or recipe CSS in unit tests.

### Cumulo UI Patterns (When writing components/docs in this repo)

- **No `<div>` for layout** $\rightarrow$ Use `<Stack>`, `<HStack>`, `<VStack>`, `<Container>`, or `<Flow>`.
- **No monolithic `<Input>`** $\rightarrow$ Use compound `<Field.Root>`, `<Field.Label>`, `<Field.Input>`, `<Field.Error>`.
- **No Tailwind / inline CSS** $\rightarrow$ Use `@cumulo/css` (`style()`, `recipe()`, `vars.*`).

### Pre-Commit Verification

```bash
pnpm check        # Runs: type-check + lint:fix + format
pnpm test         # Runs all unit and bundler tests
```
