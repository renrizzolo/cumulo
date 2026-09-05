# @cumulo/css

Lightweight, zero-dependency, type-safe CSS framework inspired by StyleX and Vanilla Extract. Designed for high-performance design systems, zero-FOUC theming, and multi-bundler compile-time CSS extraction.

## Features

- **Zero Dependencies**: Pure native TypeScript implementation with no external runtime baggage.
- **Ultra-Light Footprint**: ~4.0 kB gzip (~3.5 kB brotli) in production builds.
- **Compile-Time Extraction**: Extracts static CSS at build time via `@cumulo/unplugin` (Vite, Rollup, Webpack, esbuild, Parcel) with automatic runtime stylesheet fallback.
- **Strictly Type-Safe**: Complete TypeScript types for standard CSS properties, pseudo-classes, pseudo-elements, container queries, and nested media queries.
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

Create atomic, deterministic CSS classes with support for pseudo-classes, pseudo-elements, media queries, and nested selectors:

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
  selectors: {
    '@media (max-width: 640px)': {
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

Define type-safe CSS custom property contracts and implement themes with zero runtime CSS injection:

```ts
import { createThemeContract, createTheme } from '@cumulo/css';

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

Benchmarked with **Vitest Bench** (`packages/css/bench/css.bench.ts`) on Node 24 (V8).

| Benchmark Test                             |  Operations / sec   | Mean Latency | p99 Latency |  Samples  |
| :----------------------------------------- | :-----------------: | :----------: | :---------: | :-------: |
| **`cx` (simple strings)**                  | **5,316,767 ops/s** |  `0.18 µs`   |  `0.40 µs`  | 4,261,705 |
| **`cx` (mixed conditionals & objects)**    | **3,063,345 ops/s** |  `0.38 µs`   |  `0.79 µs`  | 2,351,092 |
| **`recipe` (default variants)**            | **1,645,423 ops/s** |  `0.77 µs`   |  `1.54 µs`  | 1,281,340 |
| **`recipe` (overriding variants)**         | **1,374,801 ops/s** |  `0.84 µs`   |  `1.66 µs`  | 1,176,495 |
| **`recipe` (compound variant match)**      | **1,084,493 ops/s** |  `1.09 µs`   |  `2.54 µs`  |  898,521  |
| **`style` (simple atomic)**                |  **615,434 ops/s**  |  `1.83 µs`   |  `3.59 µs`  |  562,666  |
| **`keyframes` definition**                 |  **219,567 ops/s**  |  `5.61 µs`   | `37.40 µs`  |  178,643  |
| **`style` (complex with media & pseudos)** |  **150,943 ops/s**  |  `6.99 µs`   | `14.50 µs`  |  142,356  |
| **`createTheme` instantiation**            |  **76,325 ops/s**   |  `15.09 µs`  | `67.10 µs`  |  66,240   |
