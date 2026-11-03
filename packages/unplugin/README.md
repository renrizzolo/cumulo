# @cumulo/unplugin

Universal build plugin for Cumulo CSS with support for Vite, Webpack, Next.js, Rollup, and esbuild.

Cumulo is a zero-runtime CSS system: styles written in `@cumulo/core` and `@cumulo/css` generate scoped atomic classes, but the CSS declarations are extracted ahead-of-time at build time. **A bundler plugin is mandatory for `@cumulo/core` and `@cumulo/css` to emit static CSS.**

## Installation

```bash
pnpm add -D @cumulo/unplugin
# or
npm install -D @cumulo/unplugin
# or
yarn add -D @cumulo/unplugin
```

## Bundler Integration

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cumulo } from '@cumulo/unplugin/vite';

export default defineConfig({
  plugins: [react(), cumulo()],
});
```

### Next.js

Cumulo supports Next.js with both **Turbopack** (default in Next.js 16+) and **Webpack**, across App Router and Pages Router.

#### Option A: PostCSS (Recommended for Turbopack & Webpack)

Because Turbopack executes CSS transforms via PostCSS rather than Webpack plugins, use `@cumulo/unplugin/postcss`. This requires **zero** changes to `next.config.mjs` and works identically under Turbopack and Webpack.

1. **Configure PostCSS** in `postcss.config.mjs`:

```js
// postcss.config.mjs
export default {
  plugins: {
    '@cumulo/unplugin/postcss': {},
  },
};
```

2. **Add `@cumulo;`** to your global stylesheet (`app/globals.css` for App Router, or `styles/globals.css` for Pages Router):

```css
/* app/globals.css or styles/globals.css */
@cumulo;
```

#### Option B: Webpack via `withCumulo`

If you are using Next.js with Webpack (`next build --webpack` or Next.js 14/15) and prefer not to use PostCSS, wrap your `next.config.mjs` with `withCumulo` from `@cumulo/unplugin/next`:

```js
// next.config.mjs
import { withCumulo } from '@cumulo/unplugin/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config options
};

export default withCumulo(nextConfig);
```

### Webpack

```js
// webpack.config.js
const { cumulo } = require('@cumulo/unplugin/webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    cumulo(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
};
```

### Rollup

```js
// rollup.config.js
import { cumulo } from '@cumulo/unplugin/rollup';

export default {
  plugins: [cumulo()],
};
```

### esbuild

```js
// build.js
import * as esbuild from 'esbuild';
import { cumulo } from '@cumulo/unplugin/esbuild';

await esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outdir: 'dist',
  plugins: [cumulo()],
});
```

### Universal Unplugin

You can also import the core unplugin directly:

```ts
import { cumulo, unplugin } from '@cumulo/unplugin';
```

## Plugin Options

```ts
cumulo({
  include: ['./src/**/*.{ts,tsx}'],
  exclude: ['**/*.stories.{ts,tsx}'],
});
```

- `include`: `(string | RegExp)[]` — Custom file patterns to process.
- `exclude`: `(string | RegExp)[]` — File patterns to exclude.
- `virtualModuleId`: `string` — Custom virtual CSS module identifier (default: `'.cumulo.css'`).
- `injectStyles`: `boolean` — Whether to inject styles automatically in development (default: `true`).

## Exports

Every bundler entrypoint (`/vite`, `/webpack`, `/next`, `/postcss`, `/rollup`, `/esbuild`) exports:

- `cumulo` (named export)
- `default` (default export)

## License

MIT
