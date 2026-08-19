import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/vite.ts',
    'src/webpack.ts',
    'src/rollup.ts',
    'src/esbuild.ts',
    'src/parcel.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: false,
});
