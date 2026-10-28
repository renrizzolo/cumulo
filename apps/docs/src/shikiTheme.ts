import { createCssVariablesTheme, type ThemeRegistration } from 'shiki';

/** @see styles.css */
export const cumuloTheme: ThemeRegistration = createCssVariablesTheme({
  name: 'cumulo-theme',
  variablePrefix: '--shiki-',
  fontStyle: true,
});
