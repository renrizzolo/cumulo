import { style } from '@cumulo/css';

// Generated at test time by the Cumulo CLI (`generate-theme --out`).
// @ts-expect-error generated test file
import { vars } from './.temp/vars.js';

export const generatedVarsBox = style(
  {
    borderRadius: vars.radius.md,
    color: vars.seed.primary,
    padding: vars.spacing.md,
  },
  'generated-vars-box',
);

export const inlineRadius = vars.radius.md;
