import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import * as vite from 'vite';
import react from '@vitejs/plugin-react';
import * as rollup from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import rollupEsbuild from 'rollup-plugin-esbuild';
import * as esbuild from 'esbuild';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { cumulo as vitePlugin } from '@cumulo/unplugin/vite';
import { cumulo as rollupPlugin } from '@cumulo/unplugin/rollup';
import { cumulo as esbuildPlugin } from '@cumulo/unplugin/esbuild';
import { cumulo as webpackPlugin } from '@cumulo/unplugin/webpack';

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
  fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
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
  fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  fs.mkdirSync(outDir, { recursive: true });

  let extractedCss = '';

  const bundle = await rollup.rollup({
    input: path.resolve(FIXTURES_DIR, 'entry.tsx'),
    plugins: [
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      nodeResolve({
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
      }),
      commonjs(),
      rollupPlugin() as unknown as rollup.InputPluginOption,
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
  fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
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
  fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
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
  fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
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

export async function buildNextAppRouter(
  outDir: string,
  options?: { turbopack?: boolean },
): Promise<BundlerBuildResult> {
  fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  fs.mkdirSync(outDir, { recursive: true });

  const appDir = path.resolve(outDir, 'app');
  fs.mkdirSync(appDir, { recursive: true });

  const packageJson = JSON.stringify(
    {
      name: 'next-app-fixture',
      private: true,
      type: 'module',
    },
    null,
    2,
  );
  fs.writeFileSync(path.resolve(outDir, 'package.json'), packageJson, 'utf-8');

  const tsconfig = JSON.stringify(
    {
      compilerOptions: {
        target: 'ESNext',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        noEmit: true,
        esModuleInterop: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
      },
      include: ['app/**/*', 'next-env.d.ts'],
    },
    null,
    2,
  );
  fs.writeFileSync(path.resolve(outDir, 'tsconfig.json'), tsconfig, 'utf-8');

  const nextConfigContent = options?.turbopack
    ? `
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  experimental: { turbopackPluginRuntimeStrategy: 'forceWorkerThreads' },
};

export default nextConfig;
`
    : `
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
`;
  fs.writeFileSync(path.resolve(outDir, 'next.config.mjs'), nextConfigContent, 'utf-8');

  const postcssConfigContent = `
export default {
  plugins: {
    '@cumulo/unplugin/postcss': {},
  },
};
`;
  fs.writeFileSync(path.resolve(outDir, 'postcss.config.mjs'), postcssConfigContent, 'utf-8');
  fs.writeFileSync(path.resolve(appDir, 'globals.css'), `@cumulo;\n`, 'utf-8');

  const layoutContent = `
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
  fs.writeFileSync(path.resolve(appDir, 'layout.tsx'), layoutContent, 'utf-8');

  const pageContent = `
import { style, recipe } from '@cumulo/css';

const boxStyle = style({
  display: 'flex',
  padding: 16,
}, 'next-app-box');

const buttonRecipe = recipe({
  base: {
    borderRadius: 8,
  },
  variants: {
    intent: {
      primary: { color: 'blue' },
      danger: { color: 'red' },
    },
  },
}, 'next-app-btn');

export default function Page() {
  return (
    <main className={boxStyle.className}>
      <button className={buttonRecipe({ intent: 'primary' })}>App Button</button>
    </main>
  );
}
`;
  fs.writeFileSync(path.resolve(appDir, 'page.tsx'), pageContent, 'utf-8');

  const nextBin = path.resolve(__dirname, '../../node_modules/next/dist/bin/next');
  const buildFlag = options?.turbopack ? '' : ' --webpack';
  let retries = 2;
  while (retries >= 0) {
    try {
      execSync(`node "${nextBin}" build${buildFlag}`, {
        cwd: outDir,
        encoding: 'utf-8',
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'production',
          NEXT_TELEMETRY_DISABLED: '1',
        },
      });
      break;
    } catch (err: unknown) {
      let output = '';
      if (err instanceof Error) {
        output += err.message;
      }
      if (typeof err === 'object' && err !== null) {
        if ('stdout' in err && (typeof err.stdout === 'string' || Buffer.isBuffer(err.stdout))) {
          output += '\nSTDOUT:\n' + String(err.stdout);
        }
        if ('stderr' in err && (typeof err.stderr === 'string' || Buffer.isBuffer(err.stderr))) {
          output += '\nSTDERR:\n' + String(err.stderr);
        }
      }
      if (retries > 0 && output.includes('EPERM')) {
        retries--;
        continue;
      }
      throw new Error(`Next.js build failed:\n${output}`, { cause: err });
    }
  }

  let cssContent = '';
  const searchDirs = [
    path.resolve(outDir, '.next/static/css'),
    path.resolve(outDir, '.next/static/chunks'),
  ];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.endsWith('.css')) {
          cssContent += '\n' + fs.readFileSync(path.resolve(dir, f), 'utf-8');
        }
      }
    }
  }

  return {
    bundlerName: options?.turbopack
      ? 'Next.js App Router (Turbopack)'
      : 'Next.js App Router (Webpack)',
    outDir,
    htmlPath: path.resolve(outDir, '.next/server/app/index.html'),
    htmlContent: '',
    cssContent,
    jsContent: '',
  };
}

export async function buildNextPagesRouter(
  outDir: string,
  options?: { turbopack?: boolean },
): Promise<BundlerBuildResult> {
  fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  fs.mkdirSync(outDir, { recursive: true });

  const pagesDir = path.resolve(outDir, 'pages');
  const stylesDir = path.resolve(outDir, 'styles');
  fs.mkdirSync(pagesDir, { recursive: true });
  fs.mkdirSync(stylesDir, { recursive: true });

  const packageJson = JSON.stringify(
    {
      name: 'next-pages-fixture',
      private: true,
      type: 'module',
    },
    null,
    2,
  );
  fs.writeFileSync(path.resolve(outDir, 'package.json'), packageJson, 'utf-8');

  const tsconfig = JSON.stringify(
    {
      compilerOptions: {
        target: 'ESNext',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        noEmit: true,
        esModuleInterop: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
      },
      include: ['pages/**/*', 'styles/**/*', 'next-env.d.ts'],
    },
    null,
    2,
  );
  fs.writeFileSync(path.resolve(outDir, 'tsconfig.json'), tsconfig, 'utf-8');

  const nextConfigContent = options?.turbopack
    ? `
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  experimental: { turbopackPluginRuntimeStrategy: 'forceWorkerThreads' },
};

export default nextConfig;
`
    : `
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
`;
  fs.writeFileSync(path.resolve(outDir, 'next.config.mjs'), nextConfigContent, 'utf-8');

  const postcssConfigContent = `
export default {
  plugins: {
    '@cumulo/unplugin/postcss': {},
  },
};
`;
  fs.writeFileSync(path.resolve(outDir, 'postcss.config.mjs'), postcssConfigContent, 'utf-8');

  const globalsCss = `@cumulo;\n`;
  fs.writeFileSync(path.resolve(stylesDir, 'globals.css'), globalsCss, 'utf-8');

  const appContent = `
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
`;
  fs.writeFileSync(path.resolve(pagesDir, '_app.tsx'), appContent, 'utf-8');

  const indexContent = `
import { style, recipe } from '@cumulo/css';

const pageStyle = style({
  display: 'flex',
  padding: 24,
}, 'next-pages-box');

const badgeRecipe = recipe({
  base: {
    padding: 6,
  },
  variants: {
    status: {
      active: { color: 'green' },
      inactive: { color: 'gray' },
    },
  },
}, 'next-pages-badge');

export default function HomePage() {
  return (
    <div className={pageStyle.className}>
      <span className={badgeRecipe({ status: 'active' })}>Active</span>
    </div>
  );
}
`;
  fs.writeFileSync(path.resolve(pagesDir, 'index.tsx'), indexContent, 'utf-8');

  const nextBin = path.resolve(__dirname, '../../node_modules/next/dist/bin/next');
  const buildFlag = options?.turbopack ? '' : ' --webpack';
  let retries = 2;
  while (retries >= 0) {
    try {
      execSync(`node "${nextBin}" build${buildFlag}`, {
        cwd: outDir,
        encoding: 'utf-8',
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'production',
          NEXT_TELEMETRY_DISABLED: '1',
        },
      });
      break;
    } catch (err: unknown) {
      let output = '';
      if (err instanceof Error) {
        output += err.message;
      }
      if (typeof err === 'object' && err !== null) {
        if ('stdout' in err && (typeof err.stdout === 'string' || Buffer.isBuffer(err.stdout))) {
          output += '\nSTDOUT:\n' + String(err.stdout);
        }
        if ('stderr' in err && (typeof err.stderr === 'string' || Buffer.isBuffer(err.stderr))) {
          output += '\nSTDERR:\n' + String(err.stderr);
        }
      }
      if (retries > 0 && output.includes('EPERM')) {
        retries--;
        continue;
      }
      throw new Error(`Next.js build failed:\n${output}`, { cause: err });
    }
  }

  let cssContent = '';
  const searchDirs = [
    path.resolve(outDir, '.next/static/css'),
    path.resolve(outDir, '.next/static/chunks'),
  ];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.endsWith('.css')) {
          cssContent += '\n' + fs.readFileSync(path.resolve(dir, f), 'utf-8');
        }
      }
    }
  }

  return {
    bundlerName: options?.turbopack
      ? 'Next.js Pages Router (Turbopack)'
      : 'Next.js Pages Router (Webpack)',
    outDir,
    htmlPath: path.resolve(outDir, '.next/server/pages/index.html'),
    htmlContent: '',
    cssContent,
    jsContent: '',
  };
}
