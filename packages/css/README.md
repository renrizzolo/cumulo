# @cumulo/css

Lightweight, zero-dependency, type-safe CSS framework inspired by StyleX and Vanilla Extract. Designed for high-performance design systems, zero-FOUC theming, and multi-bundler compile-time CSS extraction.

## Features

- **Zero Dependencies**: Pure native TypeScript implementation with no external runtime baggage.
- **Ultra-Light Footprint**: ~4.0 kB gzip (~3.5 kB brotli) in production builds.
- **Compile-Time Extraction**: Extracts static CSS at build time via `@cumulo/unplugin` (Vite, Rollup, Webpack, esbuild, Parcel v2 and v3 via `@cumulo/parcel-transformer` / `@cumulo/parcel-plugin`) with automatic runtime stylesheet fallback.
- **Lean Runtime Entrypoint**: `@cumulo/css/runtime` (~0.9 kB gzip) is what rewritten modules import in client bundles. It contains no stylesheet registry, hashing, or CSS compiler.
- **Strictly Type-Safe**: Complete TypeScript types for standard CSS properties, pseudo-classes, pseudo-elements, container queries, `@starting-style`, and nested media queries.
- **High-Performance Variant Recipes**: First-class `recipe()` primitive with variant defaults, overrides, compound variants, and recipe inheritance.
- **Type-Safe Theme Contracts**: `createThemeContract()` and `createTheme()` for guaranteed contract parity across multiple brand themes and color schemes.
- **Pretty Fast**: Sub-microsecond variant resolution and class merging.

---

## Installation

```bash
pnpm add @cumulo/css
```

---

## Core API

### `style()`

Create atomic, deterministic CSS classes with support for pseudo-classes, pseudo-elements, media queries, `@starting-style`, and nested selectors:

```ts
import { style } from '@cumulo/css';

export const buttonStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: 6,
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  transition: 'background-color 150ms ease',
  ':hover': {
    backgroundColor: '#2563eb',
  },
  '@media': {
    '(max-width: 640px)': {
      width: '100%',
    },
  },
});
```

### `recipe()`

Create multi-dimensional variant styles with default variants and compound matches:

```ts
import { recipe } from '@cumulo/css';

export const buttonRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 500,
    borderRadius: 6,
  },
  variants: {
    variant: {
      solid: { backgroundColor: '#3b82f6', color: '#fff' },
      outline: { border: '1px solid #3b82f6', color: '#3b82f6' },
      ghost: { backgroundColor: 'transparent', color: '#3b82f6' },
    },
    size: {
      sm: { height: 32, padding: '0 12px', fontSize: 13 },
      md: { height: 40, padding: '0 16px', fontSize: 14 },
      lg: { height: 48, padding: '0 20px', fontSize: 16 },
    },
  },
  compoundVariants: [
    {
      variants: { variant: 'solid', size: 'lg' },
      style: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    },
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});

// Call with defaults:
buttonRecipe();

// Call with overrides:
buttonRecipe({ variant: 'outline', size: 'lg' });
```

### `createThemeContract()` & `createTheme()`

Define type-safe CSS custom property contracts, implement themes, and override scoped variables via `.$set()`:

```ts
import { createThemeContract, createTheme, recipe } from '@cumulo/css';

export const vars = createThemeContract({
  colors: {
    primary: null,
    background: null,
    text: null,
  },
  radii: {
    sm: null,
    md: null,
  },
});

export const lightTheme = createTheme(vars, {
  colors: {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#0f172a',
  },
  radii: {
    sm: '4px',
    md: '8px',
  },
});

// Override contract variables in style rules or recipes without manual strings:
export const buttonRecipe = recipe({
  base: {
    backgroundColor: vars.colors.background,
  },
  variants: {
    active: {
      true: {
        ...vars.$set({
          colors: {
            background: vars.colors.primary,
          },
        }),
      },
    },
  },
});
```

### `cx()`

Pretty fast class name merger supporting strings, arrays, conditionals, and object maps:

```ts
import { cx } from '@cumulo/css';

const className = cx(
  'btn',
  isActive && 'btn-active',
  { 'btn-disabled': isDisabled },
  customClassName,
);
```

---

## Benchmarks

<!-- benchmarks:start -->

Benchmarked with **Vitest Bench** (`packages/css/bench/css.bench.ts`) on Node 24 (V8).

| Benchmark Test                             |  Operations / sec   | Mean Latency | p99 Latency |  Samples  |
| :----------------------------------------- | :-----------------: | :----------: | :---------: | :-------: |
| **`cx` (simple strings)**                  | **9,715,882 ops/s** |  `0.10 µs`   |  `0.20 µs`  | 9,467,659 |
| **`cx` (mixed conditionals & objects)**    | **3,306,562 ops/s** |  `0.30 µs`   |  `0.50 µs`  | 3,154,459 |
| **`recipe` (default variants)**            | **2,786,281 ops/s** |  `0.40 µs`   |  `0.50 µs`  | 2,684,062 |
| **`recipe` (overriding variants)**         | **2,474,152 ops/s** |  `0.40 µs`   |  `0.60 µs`  | 2,398,669 |
| **`recipe` (compound variant match)**      | **1,947,318 ops/s** |  `0.50 µs`   |  `0.70 µs`  | 1,912,729 |
| **`style` (simple atomic)**                |  **606,700 ops/s**  |  `1.70 µs`   |  `2.00 µs`  |  595,304  |
| **`keyframes` definition**                 |  **382,300 ops/s**  |  `2.70 µs`   |  `3.10 µs`  |  376,336  |
| **`style` (complex with media & pseudos)** |  **159,321 ops/s**  |  `6.40 µs`   |  `7.30 µs`  |  157,079  |
| **`createTheme` instantiation**            |  **130,330 ops/s**  |  `7.80 µs`   | `11.40 µs`  |  128,421  |

<!-- benchmarks:end -->
