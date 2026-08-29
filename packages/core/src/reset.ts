import { style, sheet } from '@cumulo/css';
import { vars } from './contract.js';

export const baseResetStyle = style({
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  border: 0,
  fontFamily: vars.font.sans,
  color: vars.surface.fg,
  backgroundColor: vars.surface.bg.DEFAULT,
  lineHeight: 1.5,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

/**
 * Injects modern base CSS reset into the global stylesheet.
 */
export function injectGlobalReset(): void {
  const resetRules = [
    `*, *::before, *::after { box-sizing: border-box; margin: 0; }`,
    `html { -moz-text-size-adjust: none; -webkit-text-size-adjust: none; text-size-adjust: none; }`,
    `body { min-height: 100vh; line-height: 1.5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; font-family: ${vars.font.sans}; color: ${vars.surface.fg}; background-color: ${vars.surface.bg.DEFAULT}; }`,
    `img, picture, video, canvas, svg { display: block; max-width: 100%; }`,
    `input, button, textarea, select { font: inherit; color: inherit; }`,
    `p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }`,
    `h1, h2, h3, h4, h5, h6 { text-wrap: balance; }`,
    `p, li, figcaption { text-wrap: pretty; }`,
    `#root, #__next, #app { isolation: isolate; }`,
  ];
  sheet.insertRules(resetRules);
}
