import { createCssVariablesTheme, type ThemeRegistration } from 'shiki';

export const cumuloTheme: ThemeRegistration = createCssVariablesTheme({
  name: 'cumulo-theme',
  variablePrefix: '--shiki-',
  fontStyle: true,
});
