import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FormatConfig } from 'oxfmt';
import { format } from 'oxfmt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isFormatConfig(value: unknown): value is FormatConfig {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Load root oxfmt configuration if present
const rootConfigPath = path.resolve(__dirname, '../../../.oxfmtrc.json');
let oxfmtConfig: FormatConfig | undefined;
if (fs.existsSync(rootConfigPath)) {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(rootConfigPath, 'utf-8'));
    if (isFormatConfig(parsed)) {
      oxfmtConfig = parsed;
    }
  } catch {
    // fallback to default formatting options
  }
}

const cssPath = path.join(__dirname, '../src/theme.css');
const rawCss = fs.readFileSync(cssPath, 'utf-8');

// 1. Extract all CSS custom property declarations (--var-name: ...)
const varRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;
const declaredVars = new Set<string>();

let match;
while ((match = varRegex.exec(rawCss)) !== null) {
  declaredVars.add(match[1]);
}

const sortedVars = Array.from(declaredVars).toSorted();

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, g) => g.toUpperCase());
}

type NestedTree = { [key: string]: string | NestedTree };

function setNestedPath(obj: NestedTree, pathSegments: string[], value: string) {
  let current: NestedTree = obj;
  for (let i = 0; i < pathSegments.length - 1; i++) {
    const key = kebabToCamel(pathSegments[i]);
    const existing = current[key];
    if (typeof existing === 'string') {
      const next: NestedTree = { DEFAULT: existing };
      current[key] = next;
      current = next;
    } else if (typeof existing === 'object' && existing !== null) {
      current = existing;
    } else {
      const next: NestedTree = {};
      current[key] = next;
      current = next;
    }
  }
  const lastKey = kebabToCamel(pathSegments[pathSegments.length - 1]);
  const lastExisting = current[lastKey];
  if (typeof lastExisting === 'object' && lastExisting !== null) {
    lastExisting.DEFAULT = value;
  } else {
    current[lastKey] = value;
  }
}

/**
 * Dynamically converts a flat list of CSS variables into a nested JavaScript object tree.
 * Example:
 *   --surface-bg-next     -> tree.surface.bgNext = 'var(--surface-bg-next)'
 *   --theme-radius-md     -> tree.radius.md = 'var(--theme-radius-md)'
 *   --theme-primary-50    -> tree.primary['50'] = 'var(--theme-primary-50)'
 *   --color-primary-base  -> tree.seed.primaryBase = 'var(--color-primary-base)'
 */
function buildTreeFromVars(vars: string[]) {
  const tree: NestedTree = {};

  for (const v of vars) {
    const raw = v.replace(/^--/, '');
    let parts = raw.split('-');

    // Normalize group prefix
    if (parts[0] === 'theme') {
      parts = parts.slice(1);
    } else if (parts[0] === 'color' && parts[parts.length - 1] === 'base') {
      parts = ['seed', parts[1]];
    }

    if (parts.length === 0) continue;

    setNestedPath(tree, parts, `var(${v})`);
  }

  return tree;
}

const contractTree = buildTreeFromVars(sortedVars);

// 2. Generate tokens/themeTokens.ts
const tokensPath = path.join(__dirname, '../src/tokens/themeTokens.ts');
let tokensContent = `// Auto-generated from src/theme.css by scripts/generate-theme.ts\n\n`;
tokensContent += `export const themeTokens = [\n`;
for (const v of sortedVars) {
  tokensContent += `  '${v}',\n`;
}
tokensContent += `] as const;\n\n`;
tokensContent += `export type ThemeToken = (typeof themeTokens)[number];\n\n`;
tokensContent += `export const themeVars = {\n`;
for (const v of sortedVars) {
  tokensContent += `  '${v}': 'var(${v})',\n`;
}
tokensContent += `} as const;\n`;

fs.writeFileSync(tokensPath, (await format(tokensPath, tokensContent, oxfmtConfig)).code);

// 3. Generate contract.ts completely derived from the CSS object tree
const contractPath = path.join(__dirname, '../src/contract.ts');
const contractContent = `// Auto-generated from src/theme.css by scripts/generate-theme.ts
export const vars = ${JSON.stringify(contractTree, null, 2)} as const;

export const themeContract = vars;

export type ThemeVars = typeof vars;

export type VarPath<T = typeof vars, Prefix extends string = 'vars'> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: T[K] extends string
        ? K extends \`\${number}\${string}\`
          ? \`\${Prefix}["\${K}"]\`
          : \`\${Prefix}.\${K}\`
        : K extends \`\${number}\${string}\`
          ? VarPath<T[K], \`\${Prefix}["\${K}"]\`>
          : VarPath<T[K], \`\${Prefix}.\${K}\`>;
    }[keyof T & string];
`;

fs.writeFileSync(contractPath, (await format(contractPath, contractContent, oxfmtConfig)).code);
console.log(
  `Extracted ${sortedVars.length} CSS variables from theme.css and generated contract.ts & themeTokens.ts dynamically.`,
);
