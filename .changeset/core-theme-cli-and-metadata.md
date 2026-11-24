---
'@cumulo/core': minor
---

**Breaking:** Remove the `generate-theme --in-place` CLI flag (mutating `node_modules` is ephemeral and unsafe with pnpm hard links); use `--out <path>` or the bundler plugin `theme` option instead.

Add opt-in `--include-custom` / `includeCustomVars` to include custom consumer CSS variables in generated `vars` contracts, skip disk writes when output is unchanged, export `generateTheme`/`runThemeGeneration` from `@cumulo/core/cli`, attach build-time metadata to `vars`, decouple `Heading` from `Text` via `textSharedRecipe`, and resolve `intents.ts` secondary var map lazily.
