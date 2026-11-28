import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect, vi } from 'vitest';

import { withCumulo } from '../src/next.js';
import cumuloPostcss from '../src/postcss.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Next.js withCumulo helper', () => {
  it('wraps webpack config and adds plugin without mutating transpilePackages', () => {
    const originalConfig = {
      reactStrictMode: true,
      transpilePackages: ['some-pkg'],
    };

    const enhancedConfig = withCumulo(originalConfig);
    expect(enhancedConfig.reactStrictMode).toBe(true);
    expect(enhancedConfig.transpilePackages).toEqual(['some-pkg']);
    expect(typeof enhancedConfig.webpack).toBe('function');

    const plugins: unknown[] = [];
    const webpackConfig = { plugins };
    if (typeof enhancedConfig.webpack === 'function') {
      const result = enhancedConfig.webpack(webpackConfig, {
        buildId: 'test',
        dev: false,
        isServer: false,
        defaultLoaders: {},
      });
      expect(result.plugins?.length).toBe(1);
    }
  });

  it('calls existing user webpack hook if provided', () => {
    const userWebpackMock = vi.fn((config) => ({
      ...config,
      userFlag: true,
    }));

    const enhancedConfig = withCumulo({
      webpack: userWebpackMock,
    });

    if (typeof enhancedConfig.webpack === 'function') {
      const result = enhancedConfig.webpack(
        { plugins: [] },
        {
          buildId: 'test',
          dev: false,
          isServer: false,
          defaultLoaders: {},
        },
      );
      expect(userWebpackMock).toHaveBeenCalled();
      expect(result.userFlag).toBe(true);
    }
  });
});

describe('PostCSS Cumulo plugin', () => {
  it('has postcss marker flag set to true', () => {
    expect(cumuloPostcss.postcss).toBe(true);
  });

  it('scans files and appends extracted CSS rules to root', async () => {
    const plugin = cumuloPostcss({
      include: ['packages/fixtures/src/shared/basic.ts', 'packages/fixtures/src/shared/theme.ts'],
    });

    let appendedCss = '';
    const mockRoot = {
      append(css: string): void {
        appendedCss += css;
      },
      walk(): void {},
    };

    const mockMessages: unknown[] = [];
    const mockHelpers = {
      result: {
        opts: { from: 'globals.css' },
        messages: mockMessages,
      },
    };

    await plugin.Once(mockRoot, mockHelpers);

    expect(appendedCss).toContain('.basic-box-');
    expect(appendedCss).toContain('display:flex');
    expect(mockMessages.length).toBeGreaterThan(0);
  });

  it('extracts CSS for app files that only import @cumulo/core components without @cumulo/css', async () => {
    const fs = await import('node:fs');
    const os = await import('node:os');
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cumulo-postcss-core-only-'));
    const srcDir = path.join(tempDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'Page.tsx'),
      `import { Button } from '@cumulo/core/components/Button';\nexport default function Page() { return <Button>Click</Button>; }\n`,
      'utf-8',
    );

    const originalCwd = process.cwd();
    try {
      process.chdir(tempDir);
      const plugin = cumuloPostcss();

      let appendedCss = '';
      const mockRoot = {
        append(css: string): void {
          appendedCss += css;
        },
        walk(): void {},
      };
      const mockMessages: unknown[] = [];

      await plugin.Once(mockRoot, {
        result: { opts: { from: 'globals.css' }, messages: mockMessages },
      });

      expect(appendedCss).toContain('.btn-base-');
      expect(mockMessages.length).toBe(1);
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('automatically syncs a standalone vars contract (with opt-in custom vars) when theme option is set', async () => {
    const fs = await import('node:fs');
    const os = await import('node:os');
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cumulo-postcss-theme-sync-'));
    const srcDir = path.join(tempDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    const cssPath = path.join(srcDir, 'styles.css');
    const outPath = path.join(srcDir, 'vars.ts');
    fs.writeFileSync(
      cssPath,
      `:root {\n  --theme-radius-md: 0.777rem;\n  --brand-accent: #ff4400;\n}\n`,
      'utf-8',
    );

    const originalCwd = process.cwd();
    try {
      process.chdir(tempDir);
      const plugin = cumuloPostcss({
        theme: {
          css: './src/styles.css',
          out: './src/vars.ts',
          includeCustomVars: true,
        },
      });

      const mockMessages: unknown[] = [];
      await plugin.Once(
        { append(): void {}, walk(): void {} },
        { result: { opts: { from: 'globals.css' }, messages: mockMessages } },
      );

      expect(fs.existsSync(outPath)).toBe(true);
      const generated = fs.readFileSync(outPath, 'utf-8');
      expect(generated).toContain('/** 0.777rem */');
      expect(generated).toContain("accent: 'var(--brand-accent)'");
      expect(generated).toContain('/** #ff4400 */');
      expect(mockMessages).toContainEqual(
        expect.objectContaining({
          type: 'dependency',
          plugin: 'cumulo-postcss',
          file: fs.realpathSync(cssPath),
        }),
      );
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('prunes unused responsive CSS rules while preserving used Stack responsive variants and custom theme breakpoints', async () => {
    const fs = await import('node:fs');
    const os = await import('node:os');
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cumulo-postcss-responsive-'));
    const srcDir = path.join(tempDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'styles.css'),
      `:root {\n  --theme-breakpoint-md: 800px;\n}\n`,
      'utf-8',
    );
    fs.writeFileSync(
      path.join(srcDir, 'Page.tsx'),
      `import { Stack } from '@cumulo/core/components/Stack';
export default function Page() {
  return <Stack direction={{ initial: 'column', md: 'row' }} gap={{ initial: 'sm', lg: 'xl' }} />;
}
`,
      'utf-8',
    );

    const originalCwd = process.cwd();
    try {
      process.chdir(tempDir);
      const plugin = cumuloPostcss({
        theme: {
          css: './src/styles.css',
          out: './src/vars.ts',
        },
      });

      let appendedCss = '';
      await plugin.Once(
        {
          append(css: string): void {
            appendedCss += css;
          },
          walk(): void {},
        },
        { result: { opts: { from: 'globals.css' }, messages: [] } },
      );

      // Uses custom overridden md breakpoint (800px) and default lg breakpoint (1024px)
      expect(appendedCss).toContain('@media (min-width: 800px)');
      expect(appendedCss).toContain('@media (min-width: 1024px)');
      expect(appendedCss).toContain('flex-direction:row');
      expect(appendedCss).toContain('gap:var(--theme-spacing-xl)');

      // Unused breakpoints sm (640px), xl (1280px), 2xl (1440px) must be pruned completely
      expect(appendedCss).not.toContain('@media (min-width: 640px)');
      expect(appendedCss).not.toContain('@media (min-width: 1280px)');
      expect(appendedCss).not.toContain('@media (min-width: 1440px)');
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
