// Generated at test time by the Cumulo CLI (`generate-theme --out`).
// Intentionally imports ONLY the generated vars file (no `@cumulo/css`) to verify
// build plugins still detect and inline static theme contract leaves.
// @ts-expect-error generated test file
import { vars } from './.temp/vars.js';

export const standalonePadding = vars.spacing.lg;
