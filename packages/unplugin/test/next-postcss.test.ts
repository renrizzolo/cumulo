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

    const webpackConfig = { plugins: [] as unknown[] };
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
});
