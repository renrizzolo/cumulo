# @cumulo/parcel-transformer

Parcel v2 transformer plugin for Cumulo static CSS extraction.

> Using Parcel v3 (`^3.0.0-alpha.3`)? Use the native Rust plugin [`@cumulo/parcel-plugin`](../parcel-plugin/README.md) instead.

Cumulo is a zero-runtime CSS system: styles written in `@cumulo/core` and `@cumulo/css` generate scoped atomic classes, but the CSS declarations are extracted ahead-of-time at build time. **A bundler plugin is mandatory for `@cumulo/core` and `@cumulo/css` to emit static CSS.**

## Installation

```bash
pnpm add -D @cumulo/parcel-transformer
# or
npm install -D @cumulo/parcel-transformer
# or
yarn add -D @cumulo/parcel-transformer
```

## Configuration

Configure the transformer in your `.parcelrc`:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.{ts,tsx,js,jsx}": ["@cumulo/parcel-transformer", "..."]
  }
}
```

## How It Works

The transformer intercepts TypeScript and JavaScript files containing `@cumulo/core` components or `@cumulo/css` rules, evaluates style definitions ahead of time, and emits a linked CSS asset that Parcel bundles into your output stylesheet. It does not rewrite JavaScript; for client bundles without style definitions and the CSS compiler, use [`@cumulo/parcel-plugin`](../parcel-plugin/README.md) on Parcel v3.

## License

MIT
