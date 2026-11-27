'use client';

import { Code } from '@cumulo/core/components/Code';
import * as Table from '@cumulo/core/components/Table';
import { Text } from '@cumulo/core/components/Text';
import { vars, type VarPath, type VarValue } from '@cumulo/core/contract';
import { style } from '@cumulo/css';
import React, { useEffect, useState } from 'react';

export type TokenName = VarPath;
export type TokenVariable = VarValue;

export type TokenPreview =
  | 'spacing'
  | 'size'
  | 'radius'
  | 'font-size'
  | 'font-family'
  | 'font-weight'
  | 'line-height'
  | 'color'
  | 'shadow'
  | 'duration'
  | 'easing';

export interface TokenItem {
  name: TokenName;
  variable: TokenVariable;
  value?: string;
  description?: string;
  preview?: TokenPreview;
}

export type TokenCategory =
  | 'spacing'
  | 'space'
  | 'size'
  | 'container'
  | 'radius'
  | 'radii'
  | 'typography'
  | 'font'
  | 'surface'
  | 'seed'
  | 'shadow'
  | 'transition'
  | 'control'
  | 'field';

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
      preview: 'spacing',
    },
    {
      name: 'vars.spacing["3xs"]',
      variable: 'var(--theme-spacing-3xs)',
      value: '0.125rem (2px)',
      preview: 'spacing',
    },
    {
      name: 'vars.spacing["2xs"]',
      variable: 'var(--theme-spacing-2xs)',
      value: '0.25rem (4px)',
      preview: 'spacing',
    },
    {
      name: 'vars.spacing.xs',
      variable: 'var(--theme-spacing-xs)',
      value: '0.5rem (8px)',
      preview: 'spacing',
    },
    {
      name: 'vars.spacing.sm',
      variable: 'var(--theme-spacing-sm)',
      value: '0.75rem (12px)',
      preview: 'spacing',
    },
    {
      name: 'vars.spacing.md',
      variable: 'var(--theme-spacing-md)',
      value: '1rem (16px)',
      preview: 'spacing',
    },
    {
      name: 'vars.spacing.lg',
      variable: 'var(--theme-spacing-lg)',
      value: '1.5rem (24px)',
      preview: 'spacing',
    },
    {
      name: 'vars.spacing.xl',
      variable: 'var(--theme-spacing-xl)',
      value: '2rem (32px)',
      preview: 'spacing',
    },
    {
      name: 'vars.spacing["2xl"]',
      variable: 'var(--theme-spacing-2xl)',
      value: '3rem (48px)',
      preview: 'spacing',
    },
  ],
  size: [
    {
      name: 'vars.size["4xs"]',
      variable: 'var(--theme-size-4xs)',
      value: '0.75rem (12px)',
      preview: 'size',
    },
    {
      name: 'vars.size["3xs"]',
      variable: 'var(--theme-size-3xs)',
      value: '1rem (16px)',
      preview: 'size',
    },
    {
      name: 'vars.size["2xs"]',
      variable: 'var(--theme-size-2xs)',
      value: '1.25rem (20px)',
      preview: 'size',
    },
    {
      name: 'vars.size.xs',
      variable: 'var(--theme-size-xs)',
      value: '1.5rem (24px)',
      preview: 'size',
    },
    {
      name: 'vars.size.sm',
      variable: 'var(--theme-size-sm)',
      value: '2rem (32px)',
      preview: 'size',
    },
    {
      name: 'vars.size.md',
      variable: 'var(--theme-size-md)',
      value: '2.5rem (40px)',
      preview: 'size',
    },
    {
      name: 'vars.size.lg',
      variable: 'var(--theme-size-lg)',
      value: '3rem (48px)',
      preview: 'size',
    },
    {
      name: 'vars.size.xl',
      variable: 'var(--theme-size-xl)',
      value: '3.5rem (56px)',
      preview: 'size',
    },
  ],
  container: [
    {
      name: 'vars.container.sm',
      variable: 'var(--theme-container-sm)',
      value: '640px',
    },
    {
      name: 'vars.container.md',
      variable: 'var(--theme-container-md)',
      value: '768px',
    },
    {
      name: 'vars.container.lg',
      variable: 'var(--theme-container-lg)',
      value: '1024px',
    },
    {
      name: 'vars.container.xl',
      variable: 'var(--theme-container-xl)',
      value: '1280px',
    },
    {
      name: 'vars.container["2xl"]',
      variable: 'var(--theme-container-2xl)',
      value: '1440px',
    },
  ],
  radius: [
    {
      name: 'vars.radius.none',
      variable: 'var(--theme-radius-none)',
      value: '0px',
      preview: 'radius',
    },
    {
      name: 'vars.radius.control',
      variable: 'var(--theme-radius-control)',
      value: '0.375rem (6px)',
      preview: 'radius',
    },
    {
      name: 'vars.radius.md',
      variable: 'var(--theme-radius-md)',
      value: '0.375rem (6px)',
      preview: 'radius',
    },
    {
      name: 'vars.radius.lg',
      variable: 'var(--theme-radius-lg)',
      value: '0.5rem (8px)',
      preview: 'radius',
    },
    {
      name: 'vars.radius.xl',
      variable: 'var(--theme-radius-xl)',
      value: '0.75rem (12px)',
      preview: 'radius',
    },
    {
      name: 'vars.radius["2xl"]',
      variable: 'var(--theme-radius-2xl)',
      value: '1rem (16px)',
      preview: 'radius',
    },
    {
      name: 'vars.radius.full',
      variable: 'var(--theme-radius-full)',
      value: '9999px',
      preview: 'radius',
    },
  ],
  typography: [
    {
      name: 'vars.font.sans',
      variable: 'var(--theme-font-sans)',
      description: 'Primary UI sans-serif font stack',
      preview: 'font-family',
    },
    {
      name: 'vars.font.mono',
      variable: 'var(--theme-font-mono)',
      description: 'Monospace font stack for code and keyboard shortcuts',
      preview: 'font-family',
    },
    {
      name: 'vars.font.size["2xs"]',
      variable: 'var(--theme-font-size-2xs)',
      value: '0.6875rem (11px)',
      description: 'Micro badges, caption footnotes',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size.xs',
      variable: 'var(--theme-font-size-xs)',
      value: '0.75rem (12px)',
      description: 'Secondary labels, helper text',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size.sm',
      variable: 'var(--theme-font-size-sm)',
      value: '0.875rem (14px)',
      description: 'Form inputs, table contents',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size.base',
      variable: 'var(--theme-font-size-base)',
      value: '1rem (16px)',
      description: 'Standard body text',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size.md',
      variable: 'var(--theme-font-size-md)',
      value: '1.125rem (18px)',
      description: 'Lead paragraphs, subheadings',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size.lg',
      variable: 'var(--theme-font-size-lg)',
      value: '1.25rem (20px)',
      description: 'Card headings, section titles',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size.xl',
      variable: 'var(--theme-font-size-xl)',
      value: '1.5rem (24px)',
      description: 'Medium page headings',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size["2xl"]',
      variable: 'var(--theme-font-size-2xl)',
      value: '1.875rem (30px)',
      description: 'Major section titles',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size["3xl"]',
      variable: 'var(--theme-font-size-3xl)',
      value: '2.25rem (36px)',
      description: 'Page titles',
      preview: 'font-size',
    },
    {
      name: 'vars.font.size["4xl"]',
      variable: 'var(--theme-font-size-4xl)',
      value: '3rem (48px)',
      description: 'Hero displays',
      preview: 'font-size',
    },
    {
      name: 'vars.font.weight.light',
      variable: 'var(--theme-font-weight-light)',
      value: '300',
      preview: 'font-weight',
    },
    {
      name: 'vars.font.weight.normal',
      variable: 'var(--theme-font-weight-normal)',
      value: '400',
      preview: 'font-weight',
    },
    {
      name: 'vars.font.weight.medium',
      variable: 'var(--theme-font-weight-medium)',
      value: '500',
      preview: 'font-weight',
    },
    {
      name: 'vars.font.weight.semibold',
      variable: 'var(--theme-font-weight-semibold)',
      value: '600',
      preview: 'font-weight',
    },
    {
      name: 'vars.font.weight.bold',
      variable: 'var(--theme-font-weight-bold)',
      value: '700',
      preview: 'font-weight',
    },
    {
      name: 'vars.line.height.none',
      variable: 'var(--theme-line-height-none)',
      value: '1',
      preview: 'line-height',
    },
    {
      name: 'vars.line.height.tight',
      variable: 'var(--theme-line-height-tight)',
      value: '1.25',
      preview: 'line-height',
    },
    {
      name: 'vars.line.height.normal',
      variable: 'var(--theme-line-height-normal)',
      value: '1.45',
      preview: 'line-height',
    },
    {
      name: 'vars.line.height.relaxed',
      variable: 'var(--theme-line-height-relaxed)',
      value: '1.65',
      preview: 'line-height',
    },
  ],
  surface: [
    {
      name: 'vars.surface.bg.DEFAULT',
      variable: 'var(--surface-bg)',
      description: 'Current surface background level',
      preview: 'color',
    },
    {
      name: 'vars.surface.bg.next',
      variable: 'var(--surface-bg-next)',
      description: 'Next nested surface background for inputs & hovers',
      preview: 'color',
    },
    {
      name: 'vars.surface.bg.image',
      variable: 'var(--surface-bg-image)',
      description: 'Optional background gradient or texture on surfaces (default: none)',
    },
    {
      name: 'vars.surface.fg',
      variable: 'var(--surface-fg)',
      description: 'Contextual high-contrast foreground text',
      preview: 'color',
    },
    {
      name: 'vars.surface.border',
      variable: 'var(--surface-border)',
      description: 'Contextual surface boundary border',
      preview: 'color',
    },
    {
      name: 'vars.surface.stroke.width',
      variable: 'var(--surface-stroke-width)',
      description: 'Surface border thickness (default: 1px)',
    },
    {
      name: 'vars.surface.shadow',
      variable: 'var(--surface-shadow)',
      description: 'Contextual surface elevation shadow',
      preview: 'shadow',
    },
    {
      name: 'vars.surface.secondary.DEFAULT',
      variable: 'var(--surface-secondary)',
      description: 'Secondary button/chip container background',
      preview: 'color',
    },
    {
      name: 'vars.surface.primary.DEFAULT',
      variable: 'var(--surface-primary)',
      description: 'Primary branded interactive surface background',
      preview: 'color',
    },
    {
      name: 'vars.surface.muted',
      variable: 'var(--surface-muted)',
      description: 'Muted text, descriptions, and secondary elements',
      preview: 'color',
    },
    {
      name: 'vars.surface.subtle',
      variable: 'var(--surface-subtle)',
      description: 'Subtle text, placeholders, icons, and hints',
      preview: 'color',
    },
  ],
  seed: [
    {
      name: 'vars.seed.primary',
      variable: 'var(--color-primary-base)',
      description: 'Base primary brand seed color',
      preview: 'color',
    },
    {
      name: 'vars.seed.success',
      variable: 'var(--color-success-base)',
      description: 'Base success validation seed color',
      preview: 'color',
    },
    {
      name: 'vars.seed.warning',
      variable: 'var(--color-warning-base)',
      description: 'Base warning attention seed color',
      preview: 'color',
    },
    {
      name: 'vars.seed.error',
      variable: 'var(--color-error-base)',
      description: 'Base error danger seed color',
      preview: 'color',
    },
    {
      name: 'vars.seed.info',
      variable: 'var(--color-info-base)',
      description: 'Base information notice seed color',
      preview: 'color',
    },
    {
      name: 'vars.seed.grey',
      variable: 'var(--color-grey-base)',
      description: 'Base neutral grey seed color',
      preview: 'color',
    },
  ],
  shadow: [
    {
      name: 'vars.shadow["0"]',
      variable: 'var(--theme-shadow-0)',
      description: 'Flat surface boundary shadow',
      preview: 'shadow',
    },
    {
      name: 'vars.shadow["1"]',
      variable: 'var(--theme-shadow-1)',
      description: 'Elevated card / dropdown shadow',
      preview: 'shadow',
    },
    {
      name: 'vars.shadow["2"]',
      variable: 'var(--theme-shadow-2)',
      description: 'Floating modal / dialog shadow',
      preview: 'shadow',
    },
  ],
  transition: [
    {
      name: 'vars.duration.snappy',
      variable: 'var(--theme-duration-snappy)',
      value: '55ms',
      description: 'Micro-interactions (checkboxes, press states)',
      preview: 'duration',
    },
    {
      name: 'vars.duration.fast',
      variable: 'var(--theme-duration-fast)',
      value: '125ms',
      description: 'Hover, focus, and color transitions',
      preview: 'duration',
    },
    {
      name: 'vars.duration.normal',
      variable: 'var(--theme-duration-normal)',
      value: '200ms',
      description: 'Overlays, popovers, and panels',
      preview: 'duration',
    },
    {
      name: 'vars.duration.slow',
      variable: 'var(--theme-duration-slow)',
      value: '280ms',
      description: 'Drawers and larger layout transitions',
      preview: 'duration',
    },
    {
      name: 'vars.ease.default',
      variable: 'var(--theme-ease-default)',
      value: 'cubic-bezier(0.4, 0, 0.2, 1)',
      description: 'Standard UI easing curve',
      preview: 'easing',
    },
  ],
  control: [
    {
      name: 'vars.control.depth',
      variable: 'var(--theme-control-depth)',
      value: '1',
      description: 'Scalar multiplier for raised / 3D control highlights and shadows',
    },
    {
      name: 'vars.control.border.width',
      variable: 'var(--theme-control-border-width)',
      value: '1px',
      description: 'Border thickness for buttons and selection controls',
    },
    {
      name: 'vars.control.bg.image.DEFAULT',
      variable: 'var(--theme-control-bg-image)',
      value: 'none',
      description: 'Optional sheen or gradient overlay on controls',
    },
    {
      name: 'vars.control.bg.image.hover',
      variable: 'var(--theme-control-bg-image-hover)',
      value: 'var(--theme-control-bg-image)',
      description: 'Hover sheen or gradient overlay on controls',
    },
    {
      name: 'vars.control.shadow.DEFAULT',
      variable: 'var(--theme-control-shadow)',
      value: 'none',
      description: 'Resting bevel/elevation shadow on controls',
    },
    {
      name: 'vars.control.shadow.hover',
      variable: 'var(--theme-control-shadow-hover)',
      value: 'var(--theme-control-shadow)',
      description: 'Hover shadow on controls',
    },
    {
      name: 'vars.control.shadow.active',
      variable: 'var(--theme-control-shadow-active)',
      value: 'none',
      description: 'Pressed/active shadow on controls',
    },
    {
      name: 'vars.control.primary.border',
      variable: 'var(--theme-control-primary-border)',
      value: 'transparent',
      description: 'Border color for primary buttons',
    },
    {
      name: 'vars.control.secondary.border',
      variable: 'var(--theme-control-secondary-border)',
      value: 'transparent',
      description: 'Border color for secondary buttons',
    },
    {
      name: 'vars.control.active.transform',
      variable: 'var(--theme-control-active-transform)',
      value: 'scale(0.98)',
      description: 'Active press transform on buttons',
    },
    {
      name: 'vars.control.text.shadow',
      variable: 'var(--theme-control-text-shadow)',
      value: 'none',
      description: 'Optional text shadow on primary controls',
    },
  ],
  field: [
    {
      name: 'vars.field.border.width',
      variable: 'var(--theme-field-border-width)',
      value: '1px',
      description: 'Border thickness for inputs, textareas, and selects',
    },
    {
      name: 'vars.field.bg.image',
      variable: 'var(--theme-field-bg-image)',
      value: 'none',
      description: 'Optional background gradient on form fields',
    },
    {
      name: 'vars.field.shadow',
      variable: 'var(--theme-field-shadow)',
      value: 'none',
      description: 'Optional inset or resting shadow on form fields',
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

const transitionTrackStyle = style({
  width: '6.5rem',
  padding: vars.spacing['3xs'],
  borderRadius: vars.radius.md,
  backgroundColor: vars.surface.secondary.DEFAULT,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
  boxSizing: 'border-box',
});

const transitionBoxStyle = style({
  width: vars.size.xs,
  height: vars.size.xs,
  borderRadius: vars.radius.control,
  backgroundColor: vars.primary.DEFAULT,
  transitionProperty: 'transform',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

const descriptionCellStyle = style(
  {
    minWidth: '200px',
  },
  'token-table-description-cell',
);

function renderPreview(token: TokenItem, transitionAtEnd: boolean): React.JSX.Element | null {
  switch (token.preview) {
    case 'spacing':
    case 'size':
      return (
        <div
          className={previewBarStyle.className}
          style={{
            width: token.variable,
          }}
        />
      );
    case 'radius':
      return (
        <div
          className={previewBoxStyle.className}
          style={{
            borderRadius: token.variable,
          }}
        />
      );
    case 'font-size':
      return <Text style={{ fontSize: token.variable, fontWeight: 600 }}>Aa</Text>;
    case 'font-family':
      return <Text style={{ fontFamily: token.variable, fontWeight: 500 }}>Aa Bb</Text>;
    case 'font-weight':
      return <Text style={{ fontWeight: token.variable }}>Aa</Text>;
    case 'line-height':
      return (
        <Text size="xs" style={{ lineHeight: token.variable }}>
          Line 1
          <br />
          Line 2
        </Text>
      );
    case 'color':
      return (
        <div className={colorSwatchStyle.className} style={{ backgroundColor: token.variable }} />
      );
    case 'shadow':
      return (
        <div
          className={previewBoxStyle.className}
          style={{
            boxShadow: token.variable,
            borderRadius: vars.radius.md,
            borderColor: vars.surface.border,
          }}
        />
      );
    case 'duration':
    case 'easing': {
      const translateX = transitionAtEnd
        ? `translateX(calc(6.5rem - ${vars.size.xs} - ${vars.spacing['3xs']} * 2 - 2px))`
        : 'translateX(0)';
      return (
        <div className={transitionTrackStyle.className} aria-hidden="true">
          <div
            className={transitionBoxStyle.className}
            style={{
              transform: translateX,
              transitionDuration: token.preview === 'duration' ? token.variable : '700ms',
              transitionTimingFunction:
                token.preview === 'easing' ? token.variable : vars.ease.default,
            }}
          />
        </div>
      );
    }
    default:
      return null;
  }
}

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
  const hasPreview = resolvedTokens.some((token) => token.preview !== undefined);
  const hasTransitionPreview = resolvedTokens.some(
    (token) => token.preview === 'duration' || token.preview === 'easing',
  );

  const [transitionAtEnd, setTransitionAtEnd] = useState(false);

  useEffect(() => {
    if (!hasTransitionPreview) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setTransitionAtEnd((prev) => !prev);
    }, 1100);
    return () => {
      window.clearInterval(id);
    };
  }, [hasTransitionPreview]);

  return (
    <Table.Root variant="bordered">
      <Table.Header>
        <Table.Row>
          <Table.Head>Token (JS Accessor)</Table.Head>
          <Table.Head>CSS Custom Property</Table.Head>
          <Table.Head>Value / Description</Table.Head>
          {hasPreview && <Table.Head>Preview</Table.Head>}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {resolvedTokens.map((token) => (
          <Table.Row key={token.name}>
            <Table.Cell>
              <Code variant="base">{token.name}</Code>
            </Table.Cell>
            <Table.Cell>
              <Code variant="base">{token.variable}</Code>
            </Table.Cell>
            <Table.Cell className={descriptionCellStyle.className}>
              <Text size="sm">
                {token.value && token.description
                  ? `${token.value} — ${token.description}`
                  : token.value || token.description}
              </Text>
            </Table.Cell>
            {hasPreview && <Table.Cell>{renderPreview(token, transitionAtEnd)}</Table.Cell>}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
