export interface CumuloPluginOptions {
  /**
   * Filter which files to process.
   * Defaults to include files importing `@cumulo/css` or `@cumulo/core`.
   */
  include?: (string | RegExp)[];
  /**
   * Filter which files to exclude.
   */
  exclude?: (string | RegExp)[];
  /**
   * Virtual CSS module prefix/name.
   * Default: 'virtual:cumulo.css'
   */
  virtualModuleId?: string;
  /**
   * Whether to inject styles automatically in development.
   * Default: true
   */
  injectStyles?: boolean;
}
