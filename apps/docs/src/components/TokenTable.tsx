'use client';

import React from 'react';
import { style } from '@cumulo/css';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Code,
  Text,
  vars,
  type ThemeToken,
  type VarPath,
} from '@cumulo/core';

export type TokenName = VarPath | (string & {});
export type TokenVariable = ThemeToken | (string & {});

export interface TokenItem {
  name: TokenName;
  variable: TokenVariable;
  value?: string;
  description?: string;
  category?: 'spacing' | 'radius' | 'font' | 'shadow' | 'surface' | 'seed' | 'color';
}

export type TokenCategory =
  | 'spacing'
  | 'space'
  | 'radius'
  | 'radii'
  | 'typography'
  | 'font'
  | 'surface'
  | 'seed'
  | 'shadow';

export interface TokenTableProps {
  category?: TokenCategory;
  type?: TokenCategory;
  tokens?: TokenItem[];
}

const PREDEFINED_TOKENS: Record<string, TokenItem[]> = {
  spacing: [
    {
      name: 'vars.spacing.none',
      variable: '--theme-spacing-none',
      value: '0px',
      category: 'spacing',
    },
    {
      name: 'vars.spacing["3xs"]',
      variable: '--theme-spacing-3xs',
      value: '0.125rem (2px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing["2xs"]',
      variable: '--theme-spacing-2xs',
      value: '0.25rem (4px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.xs',
      variable: '--theme-spacing-xs',
      value: '0.5rem (8px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.sm',
      variable: '--theme-spacing-sm',
      value: '0.75rem (12px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.md',
      variable: '--theme-spacing-md',
      value: '1rem (16px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.lg',
      variable: '--theme-spacing-lg',
      value: '1.5rem (24px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.xl',
      variable: '--theme-spacing-xl',
      value: '2rem (32px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing["2xl"]',
      variable: '--theme-spacing-2xl',
      value: '3rem (48px)',
      category: 'spacing',
    },
  ],
  radius: [
    { name: 'vars.radius.none', variable: '--theme-radius-none', value: '0px', category: 'radius' },
    {
      name: 'vars.radius.md',
      variable: '--theme-radius-md',
      value: '0.375rem (6px)',
      category: 'radius',
    },
    {
      name: 'vars.radius.lg',
      variable: '--theme-radius-lg',
      value: '0.5rem (8px)',
      category: 'radius',
    },
    {
      name: 'vars.radius.xl',
      variable: '--theme-radius-xl',
      value: '0.75rem (12px)',
      category: 'radius',
    },
    {
      name: 'vars.radius["2xl"]',
      variable: '--theme-radius-2xl',
      value: '1rem (16px)',
      category: 'radius',
    },
    {
      name: 'vars.radius.full',
      variable: '--theme-radius-full',
      value: '9999px',
      category: 'radius',
    },
  ],
  typography: [
    {
      name: 'vars.font.size["2xs"]',
      variable: '--theme-font-size-2xs',
      value: '0.6875rem (11px)',
      description: 'Micro badges, caption footnotes',
      category: 'font',
    },
    {
      name: 'vars.font.size.xs',
      variable: '--theme-font-size-xs',
      value: '0.75rem (12px)',
      description: 'Secondary labels, helper text',
      category: 'font',
    },
    {
      name: 'vars.font.size.sm',
      variable: '--theme-font-size-sm',
      value: '0.875rem (14px)',
      description: 'Form inputs, table contents',
      category: 'font',
    },
    {
      name: 'vars.font.size.base',
      variable: '--theme-font-size-base',
      value: '1rem (16px)',
      description: 'Standard body text',
      category: 'font',
    },
    {
      name: 'vars.font.size.md',
      variable: '--theme-font-size-md',
      value: '1.125rem (18px)',
      description: 'Lead paragraphs, subheadings',
      category: 'font',
    },
    {
      name: 'vars.font.size.lg',
      variable: '--theme-font-size-lg',
      value: '1.25rem (20px)',
      description: 'Card headings, section titles',
      category: 'font',
    },
    {
      name: 'vars.font.size.xl',
      variable: '--theme-font-size-xl',
      value: '1.5rem (24px)',
      description: 'Medium page headings',
      category: 'font',
    },
    {
      name: 'vars.font.size["2xl"]',
      variable: '--theme-font-size-2xl',
      value: '1.875rem (30px)',
      description: 'Major section titles',
      category: 'font',
    },
    {
      name: 'vars.font.size["3xl"]',
      variable: '--theme-font-size-3xl',
      value: '2.25rem (36px)',
      description: 'Page titles',
      category: 'font',
    },
    {
      name: 'vars.font.size["4xl"]',
      variable: '--theme-font-size-4xl',
      value: '3rem (48px)',
      description: 'Hero displays',
      category: 'font',
    },
  ],
  surface: [
    {
      name: 'vars.surface.bg.DEFAULT',
      variable: '--surface-bg',
      description: 'Current surface background level',
      category: 'surface',
    },
    {
      name: 'vars.surface.bg.next',
      variable: '--surface-bg-next',
      description: 'Next nested surface background for inputs & hovers',
      category: 'surface',
    },
    {
      name: 'vars.surface.fg',
      variable: '--surface-fg',
      description: 'Contextual high-contrast foreground text',
      category: 'surface',
    },
    {
      name: 'vars.surface.border',
      variable: '--surface-border',
      description: 'Contextual surface boundary border',
      category: 'surface',
    },
    {
      name: 'vars.surface.secondary.DEFAULT',
      variable: '--surface-secondary',
      description: 'Secondary button/chip container background',
      category: 'surface',
    },
    {
      name: 'vars.surface.primary.DEFAULT',
      variable: '--theme-surface-primary',
      description: 'Primary branded interactive surface background',
      category: 'surface',
    },
    {
      name: 'vars.surface.muted',
      variable: '--surface-muted',
      description: 'Subtle text, icons, and deactivated elements',
      category: 'surface',
    },
  ],
  seed: [
    {
      name: 'vars.seed.primary',
      variable: '--color-primary-base',
      description: 'Base primary brand seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.success',
      variable: '--color-success-base',
      description: 'Base success validation seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.warning',
      variable: '--color-warning-base',
      description: 'Base warning attention seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.error',
      variable: '--color-error-base',
      description: 'Base error danger seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.info',
      variable: '--color-info-base',
      description: 'Base information notice seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.grey',
      variable: '--color-grey-base',
      description: 'Base neutral grey seed color',
      category: 'seed',
    },
  ],
  shadow: [
    {
      name: 'vars.shadow["0"]',
      variable: '--theme-shadow-0',
      description: 'Flat surface boundary shadow',
      category: 'shadow',
    },
    {
      name: 'vars.shadow["1"]',
      variable: '--theme-shadow-1',
      description: 'Elevated card / dropdown shadow',
      category: 'shadow',
    },
    {
      name: 'vars.shadow["2"]',
      variable: '--theme-shadow-2',
      description: 'Floating modal / dialog shadow',
      category: 'shadow',
    },
  ],
};

const previewBarStyle = style({
  height: vars.size.xSmall,
  backgroundColor: vars.primary.DEFAULT,
  borderRadius: vars.radius.md,
});

const previewBoxStyle = style({
  width: vars.size.base,
  height: vars.size.base,
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: vars.primary.DEFAULT,
  backgroundColor: vars.surface.bg.DEFAULT,
});

const colorSwatchStyle = style({
  width: vars.size.base,
  height: vars.size.base,
  borderRadius: vars.radius.md,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
});

export function TokenTable({
  category,
  type,
  tokens: customTokens,
}: TokenTableProps): React.JSX.Element {
  const activeKey = category || type || 'spacing';
  const normalizedKey =
    activeKey === 'space'
      ? 'spacing'
      : activeKey === 'radii'
        ? 'radius'
        : activeKey === 'font'
          ? 'typography'
          : activeKey;

  const resolvedTokens = customTokens || PREDEFINED_TOKENS[normalizedKey] || [];

  return (
    <Table variant="bordered">
      <TableHeader>
        <TableRow>
          <TableHead>Token (JS Accessor)</TableHead>
          <TableHead>CSS Custom Property</TableHead>
          <TableHead>Value / Description</TableHead>
          <TableHead>Preview</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resolvedTokens.map((token) => (
          <TableRow key={token.name}>
            <TableCell>
              <Code variant="primary">{token.name}</Code>
            </TableCell>
            <TableCell>
              <Code variant="subtle">{token.variable}</Code>
            </TableCell>
            <TableCell>
              <Text size="sm">{token.value || token.description}</Text>
            </TableCell>
            <TableCell>
              {token.category === 'spacing' && (
                <div
                  className={previewBarStyle.className}
                  style={{
                    width: `var(${token.variable})`,
                  }}
                />
              )}
              {token.category === 'radius' && (
                <div
                  className={previewBoxStyle.className}
                  style={{
                    borderRadius: `var(${token.variable})`,
                  }}
                />
              )}
              {token.category === 'font' && (
                <Text style={{ fontSize: `var(${token.variable})`, fontWeight: 600 }}>Aa</Text>
              )}
              {token.category === 'surface' && (
                <div
                  className={colorSwatchStyle.className}
                  style={{ backgroundColor: `var(${token.variable})` }}
                />
              )}
              {token.category === 'seed' && (
                <div
                  className={colorSwatchStyle.className}
                  style={{ backgroundColor: `var(${token.variable})` }}
                />
              )}
              {token.category === 'shadow' && (
                <div
                  className={previewBoxStyle.className}
                  style={{
                    boxShadow: `var(${token.variable})`,
                    borderRadius: vars.radius.md,
                    borderColor: vars.surface.border,
                  }}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
