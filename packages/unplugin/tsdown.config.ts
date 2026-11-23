import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: [
      'src/index.ts',
      'src/vite.ts',
      'src/webpack.ts',
      'src/rollup.ts',
      'src/esbuild.ts',
      'src/parcel.ts',
      'src/next.ts',
    ],
    format: ['esm', 'cjs'],
    dts: true,
    clean: !process.argv.includes('--watch'),
    exports: true,
    outputOptions: {
      // Entries intentionally expose both named and default exports.
      exports: 'named',
    },
    inputOptions: {
      // The ESM build uses import.meta.resolve; the CJS build falls back to createRequire.
      checks: { emptyImportMeta: false },
    },
  },
  {
    entry: ['src/extractor.ts', 'src/postcss.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    exports: true,
    inputOptions: {
      // The ESM build uses import.meta.resolve; the CJS build falls back to createRequire.
      checks: { emptyImportMeta: false },
    },
  },
]);
