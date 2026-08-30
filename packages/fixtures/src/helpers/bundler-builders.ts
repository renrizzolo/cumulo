import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import * as vite from 'vite';
import react from '@vitejs/plugin-react';
import * as rollup from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import rollupEsbuild from 'rollup-plugin-esbuild';
import * as esbuild from 'esbuild';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { vitePlugin } from '@cumulo/unplugin/vite';
import { rollupPlugin } from '@cumulo/unplugin/rollup';
import { esbuildPlugin } from '@cumulo/unplugin/esbuild';
import { webpackPlugin } from '@cumulo/unplugin/webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, '../shared');
const HTML_TEMPLATE = fs.readFileSync(path.resolve(FIXTURES_DIR, 'index.html'), 'utf-8');

export interface BundlerBuildResult {
  bundlerName: string;
  outDir: string;
  htmlPath: string;
  htmlContent: string;
  cssContent: string;
  jsContent: string;
}

export async function buildWithVite(outDir: string): Promise<BundlerBuildResult> {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const packageRoot = path.resolve(__dirname, '../../');
  const entryHtml = path.resolve(outDir, 'index.html');
  const htmlWithScript = HTML_TEMPLATE.replace(
    '</body>',
    `<script type="module" src="${path.resolve(FIXTURES_DIR, 'entry.tsx').replace(/\\/g, '/')}"></script></body>`,
  );
  fs.writeFileSync(entryHtml, htmlWithScript, 'utf-8');

  await vite.build({
    root: packageRoot,
    configFile: false,
    logLevel: 'silent',
    plugins: [react(), vitePlugin()],
    build: {
      outDir: path.resolve(outDir, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: entryHtml,
      },
    },
  });

  const distDir = path.resolve(outDir, 'dist');
  const files = fs.readdirSync(distDir, { recursive: true }) as string[];
  const cssFile = files.find((f) => f.endsWith('.css'));
  const jsFile = files.find((f) => f.endsWith('.js') || f.endsWith('.mjs'));
  const distHtml = path.resolve(distDir, 'index.html');

  const cssContent = cssFile ? fs.readFileSync(path.resolve(distDir, cssFile), 'utf-8') : '';
  const jsContent = jsFile ? fs.readFileSync(path.resolve(distDir, jsFile), 'utf-8') : '';
  const htmlContent = fs.existsSync(distHtml) ? fs.readFileSync(distHtml, 'utf-8') : '';

  return {
    bundlerName: 'Vite',
    outDir: distDir,
    htmlPath: distHtml,
    htmlContent,
    cssContent,
    jsContent,
  };
}

export async function buildWithRollup(outDir: string): Promise<BundlerBuildResult> {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  let extractedCss = '';

  const bundle = await rollup.rollup({
    input: path.resolve(FIXTURES_DIR, 'entry.tsx'),
    plugins: [
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      resolve({
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
      }),
      commonjs(),
      rollupPlugin(),
      rollupEsbuild({
        jsx: 'automatic',
        target: 'es2022',
      }),
      {
        name: 'css-collector',
        transform(code, id) {
          if (id.endsWith('.cumulo.css')) {
            extractedCss += `\n${code}`;
            return { code: 'export default "";', map: null };
          }
          return null;
        },
      },
    ],
  });

  const { output } = await bundle.generate({
    format: 'iife',
    name: 'CumuloFixture',
  });

  const jsContent = output[0]?.code || '';
  const cssPath = path.resolve(outDir, 'bundle.css');
  const jsPath = path.resolve(outDir, 'bundle.js');
  const htmlPath = path.resolve(outDir, 'index.html');

  fs.writeFileSync(cssPath, extractedCss, 'utf-8');
  fs.writeFileSync(jsPath, jsContent, 'utf-8');

  const htmlContent = HTML_TEMPLATE.replace(
    '</head>',
    `<link rel="stylesheet" href="./bundle.css" /></head>`,
  ).replace('</body>', `<script src="./bundle.js"></script></body>`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  return {
    bundlerName: 'Rollup',
    outDir,
    htmlPath,
    htmlContent,
    cssContent: extractedCss,
    jsContent,
  };
}

export async function buildWithEsbuild(outDir: string): Promise<BundlerBuildResult> {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  await esbuild.build({
    entryPoints: [path.resolve(FIXTURES_DIR, 'entry.tsx')],
    bundle: true,
    outdir: outDir,
    plugins: [esbuildPlugin()],
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.css': 'css',
    },
    metafile: true,
    write: true,
  });

  const files = fs.readdirSync(outDir) as string[];
  const cssFile = files.find((f) => f.endsWith('.css'));
  const jsFile = files.find((f) => f.endsWith('.js'));

  const cssContent = cssFile ? fs.readFileSync(path.resolve(outDir, cssFile), 'utf-8') : '';
  const jsContent = jsFile ? fs.readFileSync(path.resolve(outDir, jsFile), 'utf-8') : '';
  const htmlPath = path.resolve(outDir, 'index.html');

  const htmlContent = HTML_TEMPLATE.replace(
    '</head>',
    cssFile ? `<link rel="stylesheet" href="./${cssFile}" /></head>` : '</head>',
  ).replace(
    '</body>',
    jsFile ? `<script type="module" src="./${jsFile}"></script></body>` : '</body>',
  );
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  return {
    bundlerName: 'esbuild',
    outDir,
    htmlPath,
    htmlContent,
    cssContent,
    jsContent,
  };
}

export async function buildWithWebpack(outDir: string): Promise<BundlerBuildResult> {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    webpack(
      {
        context: path.resolve(__dirname, '../../'),
        mode: 'production',
        entry: path.resolve(FIXTURES_DIR, 'entry.tsx'),
        output: {
          path: outDir,
          filename: 'bundle.js',
          clean: true,
        },
        resolve: {
          extensions: ['.tsx', '.ts', '.jsx', '.js'],
          extensionAlias: {
            '.js': ['.tsx', '.ts', '.jsx', '.js'],
          },
        },
        resolveLoader: {
          modules: [path.resolve(__dirname, '../../node_modules'), 'node_modules'],
        },
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              loader: 'esbuild-loader',
              options: {
                loader: 'tsx',
                target: 'es2022',
              },
            },
            {
              test: /\.css$/,
              use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
          ],
        },
        plugins: [
          webpackPlugin(),
          new MiniCssExtractPlugin({
            filename: 'bundle.css',
          }),
        ],
      },
      (err, stats) => {
        if (err || stats?.hasErrors()) {
          reject(err || new Error(stats?.toString('errors-only')));
        } else {
          resolve();
        }
      },
    );
  });

  const cssPath = path.resolve(outDir, 'bundle.css');
  const jsPath = path.resolve(outDir, 'bundle.js');
  const htmlPath = path.resolve(outDir, 'index.html');

  const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf-8') : '';
  const jsContent = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf-8') : '';

  const htmlContent = HTML_TEMPLATE.replace(
    '</head>',
    `<link rel="stylesheet" href="./bundle.css" /></head>`,
  ).replace('</body>', `<script src="./bundle.js"></script></body>`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  return {
    bundlerName: 'Webpack',
    outDir,
    htmlPath,
    htmlContent,
    cssContent,
    jsContent,
  };
}

export async function buildWithParcel(outDir: string): Promise<BundlerBuildResult> {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const tempSrcDir = path.resolve(outDir, 'src');
  fs.mkdirSync(tempSrcDir, { recursive: true });

  const parcelrcContent = JSON.stringify(
    {
      extends: '@parcel/config-default',
      transformers: {
        '*.{ts,tsx}': ['@cumulo/parcel-transformer', '...'],
      },
    },
    null,
    2,
  );
  fs.writeFileSync(path.resolve(outDir, '.parcelrc'), parcelrcContent, 'utf-8');

  const entryHtml = path.resolve(tempSrcDir, 'index.html');
  const htmlWithScript = HTML_TEMPLATE.replace(
    '</body>',
    `<script type="module" src="${path.resolve(FIXTURES_DIR, 'entry.tsx').replace(/\\/g, '/')}"></script></body>`,
  );
  fs.writeFileSync(entryHtml, htmlWithScript, 'utf-8');

  const distDir = path.resolve(outDir, 'dist');
  execSync(
    `pnpm exec parcel build "${entryHtml}" --dist-dir "${distDir}" --no-cache --no-source-maps`,
    {
      cwd: outDir,
      stdio: 'pipe',
    },
  );

  const files = fs.readdirSync(distDir, { recursive: true }) as string[];
  const cssFile = files.find((f) => f.endsWith('.css'));
  const jsFile = files.find((f) => f.endsWith('.js'));
  const distHtml = path.resolve(distDir, 'index.html');

  const cssContent = cssFile ? fs.readFileSync(path.resolve(distDir, cssFile), 'utf-8') : '';
  const jsContent = jsFile ? fs.readFileSync(path.resolve(distDir, jsFile), 'utf-8') : '';
  const htmlContent = fs.existsSync(distHtml) ? fs.readFileSync(distHtml, 'utf-8') : '';

  return {
    bundlerName: 'Parcel',
    outDir: distDir,
    htmlPath: distHtml,
    htmlContent,
    cssContent,
    jsContent,
  };
}
