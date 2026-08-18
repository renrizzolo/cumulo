import { style, sheet } from '@cumulo/css';
import { vars } from './contract.js';

export const baseResetStyle = style({
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  border: 0,
  fontFamily: vars.fontFamily.sans,
  color: vars.color.fg,
  backgroundColor: vars.color.bg,
  lineHeight: 1.5,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

/**
 * Injects modern base CSS reset into the global stylesheet.
 */
export function injectGlobalReset(): void {
  const resetRules = [
    `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`,
    `html, body { height: 100%; font-family: ${vars.fontFamily.sans}; color: ${vars.color.fg}; background-color: ${vars.color.bg}; }`,
    `img, picture, video, canvas, svg { display: block; max-width: 100%; }`,
    `input, button, textarea, select { font: inherit; color: inherit; }`,
    `p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }`,
    `#root, #__next, #app { isolation: isolate; }`,
  ];
  sheet.insertRules(resetRules);
}
