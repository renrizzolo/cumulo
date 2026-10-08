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
  type VarPath,
  type VarValue,
} from '@cumulo/core';

export type TokenName = VarPath;
export type TokenVariable = VarValue;

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
      variable: 'var(--theme-spacing-none)',
      value: '0px',
      category: 'spacing',
    },
    {
      name: 'vars.spacing["3xs"]',
      variable: 'var(--theme-spacing-3xs)',
      value: '0.125rem (2px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing["2xs"]',
      variable: 'var(--theme-spacing-2xs)',
      value: '0.25rem (4px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.xs',
      variable: 'var(--theme-spacing-xs)',
      value: '0.5rem (8px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.sm',
      variable: 'var(--theme-spacing-sm)',
      value: '0.75rem (12px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.md',
      variable: 'var(--theme-spacing-md)',
      value: '1rem (16px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.lg',
      variable: 'var(--theme-spacing-lg)',
      value: '1.5rem (24px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing.xl',
      variable: 'var(--theme-spacing-xl)',
      value: '2rem (32px)',
      category: 'spacing',
    },
    {
      name: 'vars.spacing["2xl"]',
      variable: 'var(--theme-spacing-2xl)',
      value: '3rem (48px)',
      category: 'spacing',
    },
  ],
  radius: [
    {
      name: 'vars.radius.none',
      variable: 'var(--theme-radius-none)',
      value: '0px',
      category: 'radius',
    },
    {
      name: 'vars.radius.control',
      variable: 'var(--theme-radius-control)',
      value: '0.375rem (6px)',
      category: 'radius',
    },
    {
      name: 'vars.radius.md',
      variable: 'var(--theme-radius-md)',
      value: '0.375rem (6px)',
      category: 'radius',
    },
    {
      name: 'vars.radius.lg',
      variable: 'var(--theme-radius-lg)',
      value: '0.5rem (8px)',
      category: 'radius',
    },
    {
      name: 'vars.radius.xl',
      variable: 'var(--theme-radius-xl)',
      value: '0.75rem (12px)',
      category: 'radius',
    },
    {
      name: 'vars.radius["2xl"]',
      variable: 'var(--theme-radius-2xl)',
      value: '1rem (16px)',
      category: 'radius',
    },
    {
      name: 'vars.radius.full',
      variable: 'var(--theme-radius-full)',
      value: '9999px',
      category: 'radius',
    },
  ],
  typography: [
    {
      name: 'vars.font.size["2xs"]',
      variable: 'var(--theme-font-size-2xs)',
      value: '0.6875rem (11px)',
      description: 'Micro badges, caption footnotes',
      category: 'font',
    },
    {
      name: 'vars.font.size.xs',
      variable: 'var(--theme-font-size-xs)',
      value: '0.75rem (12px)',
      description: 'Secondary labels, helper text',
      category: 'font',
    },
    {
      name: 'vars.font.size.sm',
      variable: 'var(--theme-font-size-sm)',
      value: '0.875rem (14px)',
      description: 'Form inputs, table contents',
      category: 'font',
    },
    {
      name: 'vars.font.size.base',
      variable: 'var(--theme-font-size-base)',
      value: '1rem (16px)',
      description: 'Standard body text',
      category: 'font',
    },
    {
      name: 'vars.font.size.md',
      variable: 'var(--theme-font-size-md)',
      value: '1.125rem (18px)',
      description: 'Lead paragraphs, subheadings',
      category: 'font',
    },
    {
      name: 'vars.font.size.lg',
      variable: 'var(--theme-font-size-lg)',
      value: '1.25rem (20px)',
      description: 'Card headings, section titles',
      category: 'font',
    },
    {
      name: 'vars.font.size.xl',
      variable: 'var(--theme-font-size-xl)',
      value: '1.5rem (24px)',
      description: 'Medium page headings',
      category: 'font',
    },
    {
      name: 'vars.font.size["2xl"]',
      variable: 'var(--theme-font-size-2xl)',
      value: '1.875rem (30px)',
      description: 'Major section titles',
      category: 'font',
    },
    {
      name: 'vars.font.size["3xl"]',
      variable: 'var(--theme-font-size-3xl)',
      value: '2.25rem (36px)',
      description: 'Page titles',
      category: 'font',
    },
    {
      name: 'vars.font.size["4xl"]',
      variable: 'var(--theme-font-size-4xl)',
      value: '3rem (48px)',
      description: 'Hero displays',
      category: 'font',
    },
  ],
  surface: [
    {
      name: 'vars.surface.bg.DEFAULT',
      variable: 'var(--surface-bg)',
      description: 'Current surface background level',
      category: 'surface',
    },
    {
      name: 'vars.surface.bg.next',
      variable: 'var(--surface-bg-next)',
      description: 'Next nested surface background for inputs & hovers',
      category: 'surface',
    },
    {
      name: 'vars.surface.fg',
      variable: 'var(--surface-fg)',
      description: 'Contextual high-contrast foreground text',
      category: 'surface',
    },
    {
      name: 'vars.surface.border',
      variable: 'var(--surface-border)',
      description: 'Contextual surface boundary border',
      category: 'surface',
    },
    {
      name: 'vars.surface.secondary.DEFAULT',
      variable: 'var(--surface-secondary)',
      description: 'Secondary button/chip container background',
      category: 'surface',
    },
    {
      name: 'vars.surface.primary.DEFAULT',
      variable: 'var(--surface-primary)',
      description: 'Primary branded interactive surface background',
      category: 'surface',
    },
    {
      name: 'vars.surface.muted',
      variable: 'var(--surface-muted)',
      description: 'Subtle text, icons, and deactivated elements',
      category: 'surface',
    },
  ],
  seed: [
    {
      name: 'vars.seed.primary',
      variable: 'var(--color-primary-base)',
      description: 'Base primary brand seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.success',
      variable: 'var(--color-success-base)',
      description: 'Base success validation seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.warning',
      variable: 'var(--color-warning-base)',
      description: 'Base warning attention seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.error',
      variable: 'var(--color-error-base)',
      description: 'Base error danger seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.info',
      variable: 'var(--color-info-base)',
      description: 'Base information notice seed color',
      category: 'seed',
    },
    {
      name: 'vars.seed.grey',
      variable: 'var(--color-grey-base)',
      description: 'Base neutral grey seed color',
      category: 'seed',
    },
  ],
  shadow: [
    {
      name: 'vars.shadow["0"]',
      variable: 'var(--theme-shadow-0)',
      description: 'Flat surface boundary shadow',
      category: 'shadow',
    },
    {
      name: 'vars.shadow["1"]',
      variable: 'var(--theme-shadow-1)',
      description: 'Elevated card / dropdown shadow',
      category: 'shadow',
    },
    {
      name: 'vars.shadow["2"]',
      variable: 'var(--theme-shadow-2)',
      description: 'Floating modal / dialog shadow',
      category: 'shadow',
    },
  ],
};

const previewBarStyle = style({
  height: vars.size.xs,
  backgroundColor: vars.primary.DEFAULT,
  borderRadius: vars.radius.md,
});

const previewBoxStyle = style({
  width: vars.size.md,
  height: vars.size.md,
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: vars.primary.DEFAULT,
  backgroundColor: vars.surface.bg.DEFAULT,
});

const colorSwatchStyle = style({
  width: vars.size.md,
  height: vars.size.md,
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
              <Code variant="base">{token.name}</Code>
            </TableCell>
            <TableCell>
              <Code variant="base">{token.variable}</Code>
            </TableCell>
            <TableCell>
              <Text size="sm">{token.value || token.description}</Text>
            </TableCell>
            <TableCell>
              {token.category === 'spacing' && (
                <div
                  className={previewBarStyle.className}
                  style={{
                    width: token.variable,
                  }}
                />
              )}
              {token.category === 'radius' && (
                <div
                  className={previewBoxStyle.className}
                  style={{
                    borderRadius: token.variable,
                  }}
                />
              )}
              {token.category === 'font' && (
                <Text style={{ fontSize: token.variable, fontWeight: 600 }}>Aa</Text>
              )}
              {token.category === 'surface' && (
                <div
                  className={colorSwatchStyle.className}
                  style={{ backgroundColor: token.variable }}
                />
              )}
              {token.category === 'seed' && (
                <div
                  className={colorSwatchStyle.className}
                  style={{ backgroundColor: token.variable }}
                />
              )}
              {token.category === 'shadow' && (
                <div
                  className={previewBoxStyle.className}
                  style={{
                    boxShadow: token.variable,
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
