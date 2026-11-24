export interface CumuloThemeOptions {
  /**
   * Path to a custom CSS file containing theme overrides (e.g. './src/styles.css').
   */
  css: string;
  /**
   * Output path for the generated standalone TypeScript `vars` contract file (e.g. './src/vars.ts').
   */
  out: string;
  /**
   * When `true`, custom CSS variables in `css` not defined in Cumulo's default `theme.css`
   * are also included in the generated `vars` contract.
   * Default: false
   */
  includeCustomVars?: boolean;
  /**
   * Optional path to a custom base canonical `theme.css`.
   */
  baseCss?: string;
}

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
  /**
   * Automatically regenerate a typed standalone `vars` contract file whenever the
   * configured custom theme stylesheet changes during builds or watch mode.
   */
  theme?: CumuloThemeOptions;
}
