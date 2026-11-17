import { cumulo as webpackPlugin } from './webpack.js';
import type { CumuloPluginOptions } from './types.js';

export interface NextWebpackConfig {
  plugins?: unknown[];
  resolve?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface NextConfigObject {
  webpack?: (config: NextWebpackConfig, context: unknown) => NextWebpackConfig;
  [key: string]: unknown;
}

/**
 * Next.js plugin wrapper for Cumulo CSS with Webpack.
 * Wraps next.config to register the Cumulo Webpack plugin for CSS extraction.
 *
 * Note: If using Turbopack (Next.js default), use `@cumulo/unplugin/postcss` in
 * `postcss.config.js` instead, which requires zero `next.config` changes.
 */
export function withCumulo(
  nextConfig: NextConfigObject = {},
  options?: CumuloPluginOptions,
): NextConfigObject {
  return {
    ...nextConfig,
    webpack(config: NextWebpackConfig, context: unknown): NextWebpackConfig {
      const plugins = Array.isArray(config.plugins) ? config.plugins : [];
      plugins.push(webpackPlugin(options));
      config.plugins = plugins;

      const resolve = config.resolve ?? {};
      resolve.preferRelative = true;
      config.resolve = resolve;

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, context);
      }
      return config;
    },
  };
}

export const cumulo = withCumulo;
export default withCumulo;
