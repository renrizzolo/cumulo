# @cumulo/parcel-plugin

Native Parcel v3 (`^3.0.0-alpha.3`) plugin for Cumulo static CSS extraction.

Cumulo is a zero-runtime CSS system: styles written with `@cumulo/core` and `@cumulo/css` generate scoped atomic classes, while the CSS declarations are extracted ahead of time during the build. **A bundler plugin is required for `@cumulo/core` and `@cumulo/css` to emit static CSS.**

> Using Parcel v2? Use [`@cumulo/parcel-transformer`](../parcel-transformer/README.md) instead.

## Installation

```bash
pnpm add -D @cumulo/parcel-plugin
# or
npm install -D @cumulo/parcel-plugin
# or
yarn add -D @cumulo/parcel-plugin
```

## Configuration

Register `@cumulo/parcel-plugin` in your `.parcelrc` for both your JS/TS/JSX/TSX sources and the `cumulo-css:*` named pipeline:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.{js,mjs,jsx,ts,tsx}": ["@cumulo/parcel-plugin", "..."],
    "cumulo-css:*": ["@cumulo/parcel-plugin"]
  }
}
```

### Optional Filtering

You can optionally configure `include` or `exclude` substring patterns in `package.json`:

```json
{
  "@cumulo/parcel-plugin": {
    "exclude": [".stories.tsx"]
  }
}
```

## How It Works

Parcel v3 transformers mutate assets in place rather than returning multiple assets. `@cumulo/parcel-plugin` uses a native Rust `parcel-plugin` (`cdylib`) with a two-pass named pipeline (`cumulo-css:*`):

1. **Pass 1 (JS/TS/JSX/TSX asset)**: Fast-filters files in Rust for `@cumulo/css` and `@cumulo/core` style usage. For matching files that produce CSS, adds a stylesheet dependency to `cumulo-css:./<filename>` without modifying the source text (preserving top-of-file directives such as `"use client"`).
2. **Pass 2 (`cumulo-css:*` asset)**: Evaluates style definitions via a persistent Node/Jiti worker (supporting imported tokens, `vars`, and `recipe()` extensions), registers any imported local dependencies with Parcel for cache invalidation, and converts the asset in place to `css` so Parcel's built-in CSS pipeline bundles and optimizes it.

Works cleanly across standard browser builds and Parcel v3 React Server Components (RSC) builds (both Server Components and `"use client"` components).

## License

MIT
