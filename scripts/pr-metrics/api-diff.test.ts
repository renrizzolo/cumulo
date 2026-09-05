import { describe, expect, it } from 'vitest';
import {
  captureApiSnapshot,
  computeDiffBlock,
  diffApiSnapshots,
  extractFileExports,
  findDeclarationFiles,
  formatSymbolIdentifier,
  type ApiSnapshot,
} from './api-diff.ts';
import { generateApiDiffSection } from './generate-pr-report.ts';

describe('api-diff', () => {
  describe('extractFileExports', () => {
    it('extracts interface with sorted members and extends clause', () => {
      const source = `
        interface CheckboxProps extends ElementProps<HTMLInputElement> {
          /** JSDoc should be stripped */
          intent?: 'default' | 'error';
          checked?: boolean;
          defaultChecked?: boolean;
        }
        export { CheckboxProps };
      `;

      const result = extractFileExports('components/Checkbox.d.mts', source);
      expect(result.exports.CheckboxProps).toBeDefined();
      expect(result.exports.CheckboxProps.kind).toBe('interface');
      expect(result.exports.CheckboxProps.signature).toBe(
        `CheckboxProps extends ElementProps<HTMLInputElement> {\n  checked?: boolean\n  defaultChecked?: boolean\n  intent?: 'default' | 'error'\n}`,
      );
    });

    it('extracts function normalizing destructured props', () => {
      const source = `
        interface ButtonProps {}
        declare function Button({ variant, size, ref, ...props }: ButtonProps): React.JSX.Element;
        export { Button, ButtonProps };
      `;

      const result = extractFileExports('components/Button.d.mts', source);
      expect(result.exports.Button).toBeDefined();
      expect(result.exports.Button.kind).toBe('function');
      expect(result.exports.Button.signature).toBe(
        'function Button(props: ButtonProps): React.JSX.Element',
      );
    });

    it('extracts recipe variants cleanly without internal CSS rules', () => {
      const source = `
        declare const buttonRecipe: import("@cumulo/css").RecipeFunction<{
          width: {
            auto: { width: string; };
            full: { width: string; };
          };
          intent: {
            primary: {};
            error: { color: string; };
          };
        }>;
        export { buttonRecipe };
      `;

      const result = extractFileExports('components/Button.d.mts', source);
      expect(result.exports.buttonRecipe).toBeDefined();
      expect(result.exports.buttonRecipe.kind).toBe('variable');
      expect(result.exports.buttonRecipe.signature).toBe(
        `const buttonRecipe: RecipeFunction<{\n  intent?: 'error' | 'primary'\n  width?: 'auto' | 'full'\n}>`,
      );
    });

    it('skips package re-exports when source is already a tracked subpath', () => {
      const source = `
        import { Button, ButtonProps } from "./components/Button.mjs";
        export { Button, type ButtonProps };
      `;

      const knownSubpaths = new Set(['components/Button']);
      const result = extractFileExports('index.d.mts', source, knownSubpaths);
      // Sibling subpath exports are deduplicated from index.d.mts
      expect(result.exports.Button).toBeUndefined();
      expect(result.exports.ButtonProps).toBeUndefined();
    });
  });

  describe('computeDiffBlock', () => {
    it('formats added export with + lines', () => {
      const newSignature = `CheckboxProps {\n  checked?: boolean\n}`;
      const diff = computeDiffBlock(undefined, newSignature);
      expect(diff).toContain('```diff');
      expect(diff).toContain('+ CheckboxProps {');
      expect(diff).toContain('+   checked?: boolean');
      expect(diff).toContain('+ }');
    });

    it('formats removed export with - lines', () => {
      const oldSignature = `CheckboxProps {\n  checked?: boolean\n}`;
      const diff = computeDiffBlock(oldSignature, undefined);
      expect(diff).toContain('```diff');
      expect(diff).toContain('- CheckboxProps {');
      expect(diff).toContain('-   checked?: boolean');
      expect(diff).toContain('- }');
    });

    it('formats modified export highlighting changes like React Spectrum', () => {
      const before = `PromptFieldProps {\n  brandColor?: string\n  variant?: 'balanced' | 'prominent' | 'subtle'\n}`;
      const after = `PromptFieldProps {\n  brandColor?: string\n  variant?: 'balanced' | 'prominent' | 'subtle' = 'balanced'\n}`;

      const diff = computeDiffBlock(before, after);
      expect(diff).toContain('```diff');
      expect(diff).toContain(' PromptFieldProps {');
      expect(diff).toContain('   brandColor?: string');
      expect(diff).toContain("-  variant?: 'balanced' | 'prominent' | 'subtle'");
      expect(diff).toContain("+  variant?: 'balanced' | 'prominent' | 'subtle' = 'balanced'");
      expect(diff).toContain(' }');
    });
  });

  describe('formatSymbolIdentifier', () => {
    it('formats root index export', () => {
      expect(formatSymbolIdentifier('@cumulo/core', 'index.d.mts', 'useTheme')).toBe(
        '/@cumulo/core:useTheme',
      );
    });

    it('formats subpath export', () => {
      expect(
        formatSymbolIdentifier('@cumulo/core', 'components/Checkbox.d.mts', 'CheckboxProps'),
      ).toBe('/@cumulo/core/components/Checkbox:CheckboxProps');
    });
  });

  describe('generateApiDiffSection', () => {
    it('renders clean React Spectrum style report', () => {
      const baseSnapshot: ApiSnapshot = {
        timestamp: '2026-09-01T00:00:00Z',
        packages: {
          '@cumulo/core': {
            pkgName: '@cumulo/core',
            files: {
              'components/Checkbox.d.mts': {
                fileRelPath: 'components/Checkbox.d.mts',
                exports: {
                  CheckboxProps: {
                    name: 'CheckboxProps',
                    kind: 'interface',
                    signature: `CheckboxProps {\n  checked?: boolean\n  variant?: 'balanced' | 'prominent'\n}`,
                  },
                },
              },
            },
          },
        },
      };

      const currentSnapshot: ApiSnapshot = {
        timestamp: '2026-09-02T00:00:00Z',
        packages: {
          '@cumulo/core': {
            pkgName: '@cumulo/core',
            files: {
              'components/Checkbox.d.mts': {
                fileRelPath: 'components/Checkbox.d.mts',
                exports: {
                  CheckboxProps: {
                    name: 'CheckboxProps',
                    kind: 'interface',
                    signature: `CheckboxProps {\n  checked?: boolean\n  variant?: 'balanced' | 'prominent' | 'subtle'\n}`,
                  },
                },
              },
            },
          },
        },
      };

      const diffReport = diffApiSnapshots(baseSnapshot, currentSnapshot);
      expect(diffReport.hasChanges).toBe(true);
      expect(diffReport.changes.length).toBe(1);

      const section = generateApiDiffSection(diffReport);
      expect(section).toContain('### 🔍 Public API Changes');
      expect(section).toContain('#### `@cumulo/core`');
      expect(section).toContain('/@cumulo/core/components/Checkbox:CheckboxProps');
      expect(section).toContain('```diff');
      expect(section).toContain("-  variant?: 'balanced' | 'prominent'");
      expect(section).toContain("+  variant?: 'balanced' | 'prominent' | 'subtle'");
      // No bullet points!
      expect(section).not.toContain('- `CheckboxProps`');
      expect(section).not.toContain('**🟢 Added Exports:**');
    });
  });

  describe('findDeclarationFiles & captureApiSnapshot', () => {
    it('finds declaration files and captures snapshots', () => {
      const files = findDeclarationFiles('packages/css/dist');
      expect(Array.isArray(files)).toBe(true);
      if (files.length > 0) {
        expect(files.some((f) => f.endsWith('.d.mts') || f.endsWith('.d.ts'))).toBe(true);
      }

      const snapshot = captureApiSnapshot();
      expect(snapshot.packages['@cumulo/css']).toBeDefined();
      expect(snapshot.packages['@cumulo/core']).toBeDefined();
    });
  });
});
