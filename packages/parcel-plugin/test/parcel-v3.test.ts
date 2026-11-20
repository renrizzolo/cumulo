import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { extractCss } from '../src/extractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_DIR = path.resolve(__dirname, '..');
const PARCEL_BIN = path.resolve(PACKAGE_DIR, 'node_modules/.bin/parcel');
const TEMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'cumulo-parcel-v3-test-'));

function setupFixtureNodeModules(projectDir: string): void {
  const pkgNodeModules = path.join(PACKAGE_DIR, 'node_modules');
  const targetNodeModules = path.join(projectDir, 'node_modules');
  fs.mkdirSync(targetNodeModules, { recursive: true });

  for (const entry of fs.readdirSync(pkgNodeModules)) {
    if (entry === '.bin') continue;
    const src = path.join(pkgNodeModules, entry);
    const dest = path.join(targetNodeModules, entry);

    if (entry.startsWith('@')) {
      fs.mkdirSync(dest, { recursive: true });
      for (const scoped of fs.readdirSync(src)) {
        fs.symlinkSync(path.join(src, scoped), path.join(dest, scoped), 'junction');
      }
    } else {
      fs.symlinkSync(src, dest, 'junction');
    }
  }

  const cumuloScopeDir = path.join(targetNodeModules, '@cumulo');
  fs.mkdirSync(cumuloScopeDir, { recursive: true });
  const pluginLink = path.join(cumuloScopeDir, 'parcel-plugin');
  if (!fs.existsSync(pluginLink)) {
    fs.symlinkSync(PACKAGE_DIR, pluginLink, 'junction');
  }
}

function cleanDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  fs.mkdirSync(dir, { recursive: true });
}

function collectFilesByExt(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFilesByExt(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function runParcelBuild(args: string[], cwd: string): string {
  try {
    return execFileSync(PARCEL_BIN, ['build', ...args], {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });
  } catch (err: unknown) {
    let details = err instanceof Error ? err.message : String(err);
    if (typeof err === 'object' && err !== null) {
      if ('stdout' in err && (typeof err.stdout === 'string' || Buffer.isBuffer(err.stdout))) {
        details += `\nSTDOUT:\n${String(err.stdout)}`;
      }
      if ('stderr' in err && (typeof err.stderr === 'string' || Buffer.isBuffer(err.stderr))) {
        details += `\nSTDERR:\n${String(err.stderr)}`;
      }
    }
    throw new Error(`Parcel v3 build failed:\n${details}`, { cause: err });
  }
}

afterAll(() => {
  fs.rmSync(TEMP_ROOT, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
});

describe('@cumulo/parcel-plugin (Parcel v3 native plugin)', () => {
  it('extractCss extracts styles and reports local file dependencies', async () => {
    const dir = path.join(TEMP_ROOT, 'unit-extract');
    cleanDir(dir);

    const tokensFile = path.join(dir, 'tokens.ts');
    const baseFile = path.join(dir, 'Base.tsx');
    const compFile = path.join(dir, 'Card.tsx');

    fs.writeFileSync(
      tokensFile,
      `export const CARD_PADDING = 20;\nexport const CARD_BG = '#123456';\n`,
      'utf-8',
    );

    fs.writeFileSync(
      baseFile,
      `import { style } from '@cumulo/css';\nexport const baseStyle = style({ color: '#00aa00' }, 'unit-base');\n`,
      'utf-8',
    );

    const code = `
import { style, recipe, keyframes } from '@cumulo/css';
import { CARD_PADDING, CARD_BG } from './tokens.js';
import { baseStyle } from './Base.js';

export const spin = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } }, 'unit-spin');

export const cardStyle = style({
  padding: CARD_PADDING,
  backgroundColor: CARD_BG,
}, 'unit-card');

export const tagRecipe = recipe({
  base: { display: 'inline-flex' },
  variants: {
    tone: {
      info: { color: 'blue' },
      warn: { color: 'orange' },
    },
  },
}, 'unit-tag');

export const combined = [baseStyle.className, cardStyle.className];
`;
    fs.writeFileSync(compFile, code, 'utf-8');

    const result = await extractCss({
      filePath: compFile,
      code,
      projectRoot: PACKAGE_DIR,
    });

    expect(result.warning).toBeUndefined();
    expect(result.css).toContain('.unit-card-');
    expect(result.css).toContain('padding:20px;');
    expect(result.css).toContain('background-color:#123456;');
    expect(result.css).toContain('@keyframes unit-spin-');
    expect(result.css).toContain('.unit-tag-base-');
    expect(result.css).toContain('.unit-tag-tone-info-');
    // Imported modules are transformed independently by Parcel; their CSS must not be duplicated here.
    expect(result.css).not.toContain('.unit-base-');
    expect(result.dependencies).toContain(tokensFile);
    expect(result.dependencies).toContain(baseFile);

    // Compile-time JS rewrite replaces style/recipe/keyframes with @cumulo/css/runtime helpers
    // and prunes imports that were only referenced inside rewritten calls.
    expect(result.code).toBeDefined();
    expect(result.code).toContain("from '@cumulo/css/runtime'");
    expect(result.code).toContain('__cumuloStyle(');
    expect(result.code).toContain('__cumuloRecipe(');
    expect(result.code).toContain('__cumuloKeyframes(');
    expect(result.code).not.toContain('./tokens.js');
    expect(result.code).not.toContain("from '@cumulo/css'");
    expect(result.code).toContain('./Base.js');
  });

  it('builds a standard Parcel v3 browser app and extracts static CSS', () => {
    const dir = path.join(TEMP_ROOT, 'browser-app');
    const srcDir = path.join(dir, 'src');
    const distDir = path.join(dir, 'dist');
    cleanDir(dir);
    fs.mkdirSync(srcDir, { recursive: true });
    setupFixtureNodeModules(dir);

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'parcel-v3-browser-fixture', private: true, type: 'module' }, null, 2),
      'utf-8',
    );

    fs.writeFileSync(
      path.join(dir, '.parcelrc'),
      JSON.stringify(
        {
          extends: '@parcel/config-default',
          transformers: {
            '*.{js,mjs,jsx,ts,tsx}': ['@cumulo/parcel-plugin', '...', '@cumulo/parcel-plugin'],
            'cumulo-css:*': ['@cumulo/parcel-plugin'],
          },
        },
        null,
        2,
      ),
      'utf-8',
    );

    fs.writeFileSync(
      path.join(srcDir, 'tokens.ts'),
      `export const ACCENT_BORDER = '2px solid #0055ff';\n`,
      'utf-8',
    );

    fs.writeFileSync(
      path.join(srcDir, 'App.tsx'),
      `import '@cumulo/core/theme.css';
import { Button, VStack, vars } from '@cumulo/core';
import { create, cx, keyframes, recipe, style } from '@cumulo/css';
import { ACCENT_BORDER } from './tokens.js';

const pulse = keyframes(
  {
    '0%': { opacity: 0.5 },
    '100%': { opacity: 1 },
  },
  'p3-pulse',
);

const wrapperStyle = style(
  {
    display: 'flex',
    padding: vars.spacing.md,
    border: ACCENT_BORDER,
  },
  'p3-wrapper',
);

const slots = create(
  {
    badge: {
      animation: \`\${pulse} 1s infinite\`,
      borderRadius: 6,
    },
  },
  'p3-slot',
);

const baseBtn = recipe(
  {
    base: { cursor: 'pointer' },
    variants: {
      intent: {
        primary: { backgroundColor: '#0066ff' },
        danger: { backgroundColor: '#cc0000' },
      },
    },
  },
  'p3-btn',
);

const extendedBtn = recipe(
  {
    extend: baseBtn,
    variants: {
      shape: {
        pill: { borderRadius: 9999 },
      },
    },
  },
  'p3-ext',
);

export function App() {
  return (
    <main className={cx(wrapperStyle)}>
      <VStack gap="md">
        <span className={cx(slots.badge)}>Parcel v3</span>
        <button className={extendedBtn({ intent: 'primary', shape: 'pill' })}>Custom</button>
        <Button variant="primary">Cumulo Core Button</Button>
      </VStack>
    </main>
  );
}
`,
      'utf-8',
    );

    fs.writeFileSync(
      path.join(srcDir, 'entry.tsx'),
      `import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
`,
      'utf-8',
    );

    fs.writeFileSync(
      path.join(srcDir, 'index.html'),
      `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Parcel v3 Fixture</title></head>
  <body>
    <div id="root"></div>
    <script type="module" src="./entry.tsx"></script>
  </body>
</html>
`,
      'utf-8',
    );

    const buildOutput = runParcelBuild(['src/index.html', '--dist-dir', distDir], dir);
    expect(buildOutput).not.toContain('Stylesheets are imported in conflicting orders');

    const htmlPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(htmlPath)).toBe(true);
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toMatch(/<link[^>]+rel=["']?stylesheet["']?[^>]+href=["']?[^"'\s>]+\.css["']?/);

    const cssFiles = collectFilesByExt(distDir, '.css');
    expect(cssFiles.length).toBeGreaterThan(0);

    const allCss = cssFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');
    expect(allCss).toContain('.p3-wrapper-');
    expect(allCss).toContain('#05f');
    expect(allCss).toContain('@keyframes p3-pulse-');
    expect(allCss).toContain('.p3-slot-badge-');
    expect(allCss).toContain('.p3-btn-intent-primary-');
    expect(allCss).toContain('.p3-ext-shape-pill-');
    // Extracted from @cumulo/core Button component inside workspace/node_modules
    expect(allCss).toContain('.btn-base-');

    // Verify client JS bundles stripped build-time CSS compiler, sheet, and vars contract
    const jsFiles = collectFilesByExt(distDir, '.js');
    expect(jsFiles.length).toBeGreaterThan(0);
    const allJs = jsFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');
    expect(allJs).toContain('p3-wrapper-');
    expect(allJs).not.toContain('compileStyleRule');
    expect(allJs).not.toContain('__CUMULO_STYLESHEET__');
    expect(allJs).not.toContain('--theme-primary-50');
  }, 60000);

  it('extracts CSS from both Server Components and "use client" components in Parcel v3 RSC builds', () => {
    const dir = path.join(TEMP_ROOT, 'rsc-app');
    const srcDir = path.join(dir, 'src');
    const distDir = path.join(dir, 'dist');
    cleanDir(dir);
    fs.mkdirSync(srcDir, { recursive: true });
    setupFixtureNodeModules(dir);

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify(
        {
          name: 'parcel-v3-rsc-fixture',
          private: true,
          type: 'module',
          source: 'src/server.tsx',
          targets: {
            default: {
              context: 'react-server',
              distDir: 'dist',
            },
          },
          dependencies: {
            react: '^19.2.8',
            'react-dom': '^19.2.8',
          },
        },
        null,
        2,
      ),
      'utf-8',
    );

    fs.writeFileSync(
      path.join(dir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            jsx: 'react-jsx',
            module: 'ESNext',
            moduleResolution: 'bundler',
          },
        },
        null,
        2,
      ),
      'utf-8',
    );

    fs.writeFileSync(
      path.join(dir, '.parcelrc'),
      JSON.stringify(
        {
          extends: '@parcel/config-default',
          transformers: {
            '*.{js,mjs,jsx,ts,tsx}': ['@cumulo/parcel-plugin', '...', '@cumulo/parcel-plugin'],
            'cumulo-css:*': ['@cumulo/parcel-plugin'],
          },
        },
        null,
        2,
      ),
      'utf-8',
    );

    // Client component with "use client" on line 1 (must NOT be broken by prepending imports)
    fs.writeFileSync(
      path.join(srcDir, 'ClientDemo.tsx'),
      `"use client";

import { useState } from 'react';
import { Button, VStack, vars } from '@cumulo/core';
import { cx, recipe, style } from '@cumulo/css';

const clientCardStyle = style(
  {
    padding: vars.spacing.md,
    borderRadius: vars.radius.md,
    backgroundColor: '#f5f5f5',
  },
  'rsc-client-card',
);

const counterBadgeRecipe = recipe(
  {
    base: { fontWeight: 700 },
    variants: {
      active: {
        true: { color: '#008800' },
        false: { color: '#666666' },
      },
    },
  },
  'rsc-client-badge',
);

export function ClientDemo() {
  const [count, setCount] = useState(0);
  return (
    <section className={cx(clientCardStyle)}>
      <VStack gap="md">
        <span className={counterBadgeRecipe({ active: count > 0 })}>Count: {count}</span>
        <Button type="button" variant="secondary" onClick={() => setCount((c) => c + 1)}>
          Increment
        </Button>
      </VStack>
    </section>
  );
}
`,
      'utf-8',
    );

    // Server component with "use server-entry" on line 1, importing @cumulo/core/theme.css,
    // server-only styles, and the client island
    fs.writeFileSync(
      path.join(srcDir, 'Page.tsx'),
      `"use server-entry";

import '@cumulo/core/theme.css';
import { Container, Panel, vars } from '@cumulo/core';
import { cx, style } from '@cumulo/css';
import { ClientDemo } from './ClientDemo';

const serverHeaderStyle = style(
  {
    display: 'flex',
    justifyContent: 'space-between',
    gap: vars.spacing.sm,
    padding: 12,
  },
  'rsc-server-header',
);

export function Page() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>RSC Cumulo Fixture</title>
      </head>
      <body>
        <Container size="lg" padding="md">
          <Panel as="header" padding="sm" className={cx(serverHeaderStyle)}>
            <h1>Parcel v3 RSC + Cumulo</h1>
          </Panel>
          <ClientDemo />
        </Container>
      </body>
    </html>
  );
}
`,
      'utf-8',
    );

    // Server entry that uses @parcel/rsc/server renderHTML so we can verify real rendered HTML resources
    fs.writeFileSync(
      path.join(srcDir, 'server.tsx'),
      `import { renderHTML } from '@parcel/rsc/server';
import { Page } from './Page';

async function main() {
  const stream = await renderHTML(<Page />, { component: Page });
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let html = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
  }
  html += decoder.decode();
  process.stdout.write(html);
}

void main();
`,
      'utf-8',
    );

    runParcelBuild([], dir);

    const cssFiles = collectFilesByExt(distDir, '.css');
    expect(cssFiles.length).toBeGreaterThan(0);

    const allCss = cssFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');

    // Server Component styles extracted
    expect(allCss).toContain('.rsc-server-header-');
    // "use client" Client Component styles extracted
    expect(allCss).toContain('.rsc-client-card-');
    expect(allCss).toContain('.rsc-client-badge-base-');
    expect(allCss).toContain('.rsc-client-badge-active-true-');
    // @cumulo/core component styles extracted (Button from client, Container/Panel from server)
    expect(allCss).toContain('.btn-base-');

    // Execute the built RSC server bundle and verify the rendered HTML links stylesheets
    const serverBundle = path.join(distDir, 'server.js');
    expect(fs.existsSync(serverBundle)).toBe(true);
    const renderedHtml = execFileSync(process.execPath, [serverBundle], {
      cwd: dir,
      encoding: 'utf-8',
    });

    expect(renderedHtml).toContain('Parcel v3 RSC + Cumulo');
    expect(renderedHtml).toContain('Increment');
    expect(renderedHtml).toMatch(
      /<link[^>]+rel=["']?stylesheet["']?[^>]+href=["']?[^"'\s>]+\.css["']?/,
    );

    // Verify every linked stylesheet in the rendered HTML exists and collectively contains
    // both Server Component and Client Component CSS!
    const linkedHrefs = Array.from(
      renderedHtml.matchAll(
        /<link[^>]+rel=["']?stylesheet["']?[^>]+href=["']?([^"'\s>]+\.css)["']?/g,
      ),
      (m) => m[1],
    );
    expect(linkedHrefs.length).toBeGreaterThan(0);

    const linkedCss = linkedHrefs
      .map((href) => {
        const cleanHref = href.replace(/^\//, '');
        return fs.readFileSync(path.join(distDir, cleanHref), 'utf-8');
      })
      .join('\n');

    expect(linkedCss).toContain('.rsc-server-header-');
    expect(linkedCss).toContain('.rsc-client-card-');
    expect(linkedCss).toContain('.rsc-client-badge-base-');
    expect(linkedCss).toContain('.btn-base-');
    expect(linkedCss).toContain('--color-primary');

    // Verify built JS bundles stripped build-time CSS compiler, sheet, and vars contract
    const jsFiles = collectFilesByExt(distDir, '.js');
    expect(jsFiles.length).toBeGreaterThan(0);
    const allJs = jsFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');
    expect(allJs).not.toContain('compileStyleRule');
    expect(allJs).not.toContain('__CUMULO_STYLESHEET__');
    expect(allJs).not.toContain('--theme-primary-50');
  }, 60000);

  it('invalidates cached CSS when an imported token file changes and survives stray console.log output', () => {
    const dir = path.join(TEMP_ROOT, 'cache-invalidation');
    const srcDir = path.join(dir, 'src');
    const distDir = path.join(dir, 'dist');
    cleanDir(dir);
    fs.mkdirSync(srcDir, { recursive: true });
    setupFixtureNodeModules(dir);

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'parcel-v3-cache-fixture', private: true, type: 'module' }, null, 2),
      'utf-8',
    );

    fs.writeFileSync(
      path.join(dir, '.parcelrc'),
      JSON.stringify(
        {
          extends: '@parcel/config-default',
          transformers: {
            '*.{js,mjs,jsx,ts,tsx}': ['@cumulo/parcel-plugin', '...', '@cumulo/parcel-plugin'],
            'cumulo-css:*': ['@cumulo/parcel-plugin'],
          },
        },
        null,
        2,
      ),
      'utf-8',
    );

    const tokensPath = path.join(srcDir, 'tokens.ts');
    fs.writeFileSync(tokensPath, `export const THEME_COLOR = '#112233';\n`, 'utf-8');

    // Also includes a top-level console.log to verify user stdout never corrupts worker IPC
    fs.writeFileSync(
      path.join(srcDir, 'Box.tsx'),
      `import { style } from '@cumulo/css';
import { THEME_COLOR } from './tokens.js';

console.log('stray user module stdout during evaluation');

export const boxStyle = style(
  {
    backgroundColor: THEME_COLOR,
    padding: 10,
  },
  'cache-box',
);

export function Box() {
  return <div className={boxStyle.className}>Box</div>;
}
`,
      'utf-8',
    );

    // File that only uses cx (no CSS rules) — should pass through cleanly
    fs.writeFileSync(
      path.join(srcDir, 'helper.ts'),
      `import { cx } from '@cumulo/css';
export function combine(a: string, b: string): string {
  return cx(a, b);
}
`,
      'utf-8',
    );

    fs.writeFileSync(
      path.join(srcDir, 'entry.tsx'),
      `import { Box } from './Box';
import { combine } from './helper';
console.log(Box, combine('a', 'b'));
`,
      'utf-8',
    );

    fs.writeFileSync(
      path.join(srcDir, 'index.html'),
      `<!DOCTYPE html><html><head></head><body><script type="module" src="./entry.tsx"></script></body></html>`,
      'utf-8',
    );

    // Build 1
    runParcelBuild(['src/index.html', '--dist-dir', distDir], dir);
    const css1 = collectFilesByExt(distDir, '.css')
      .map((f) => fs.readFileSync(f, 'utf-8'))
      .join('\n');
    expect(css1).toContain('.cache-box-');
    expect(css1).toMatch(/#112233|#123/);

    // Modify ONLY the imported tokens.ts file (leaving Box.tsx untouched) and rebuild with warm cache
    fs.writeFileSync(tokensPath, `export const THEME_COLOR = '#445566';\n`, 'utf-8');
    fs.rmSync(distDir, { recursive: true, force: true });

    runParcelBuild(['src/index.html', '--dist-dir', distDir], dir);
    const css2 = collectFilesByExt(distDir, '.css')
      .map((f) => fs.readFileSync(f, 'utf-8'))
      .join('\n');
    expect(css2).toContain('.cache-box-');
    expect(css2).toMatch(/#445566|#456/);
    expect(css2).not.toMatch(/#112233|#123/);
  }, 60000);
});
