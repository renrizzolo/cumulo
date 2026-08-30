'use client';

import React, { useState, useCallback } from 'react';
import { style } from '@cumulo/css';
import {
  Text,
  Code,
  HStack,
  VStack,
  vars,
  type ThemeToken,
  type VarPath,
  type Intent,
  Button,
} from '@cumulo/core';

type ColorIntent = Intent | 'grey';
type ColorStep = (typeof STEPS)[number];

interface IntentScaleItem {
  key: ColorIntent;
  label: string;
  seed: ThemeToken;
  name: VarPath;
}

const INTENT_SCALES: readonly IntentScaleItem[] = [
  {
    key: 'primary',
    label: 'Primary',
    seed: '--color-primary-base',
    name: 'vars.seed.primary',
  },
  {
    key: 'success',
    label: 'Success',
    seed: '--color-success-base',
    name: 'vars.seed.success',
  },
  {
    key: 'warning',
    label: 'Warning',
    seed: '--color-warning-base',
    name: 'vars.seed.warning',
  },
  {
    key: 'error',
    label: 'Error',
    seed: '--color-error-base',
    name: 'vars.seed.error',
  },
  {
    key: 'info',
    label: 'Info',
    seed: '--color-info-base',
    name: 'vars.seed.info',
  },
  {
    key: 'grey',
    label: 'Grey',
    seed: '--color-grey-base',
    name: 'vars.seed.grey',
  },
] as const;

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

const scaleContainerStyle = style({
  containerType: 'inline-size',
});

const headerRowStyle = style({
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.spacing.xs,
});

const intentTitleStyle = style({
  fontWeight: vars.font.weight.semibold,
  fontSize: vars.font.size.sm,
  textTransform: 'capitalize',
  color: vars.surface.fg,
});

const colorGridStyle = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(10, minmax(0, 64px))',
  gap: vars.spacing.xs,
  marginBottom: vars.spacing.md,
  '@container': {
    '(max-width: 768px)': {
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    },
    '(max-width: 480px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
});

const colorSwatchStyle = style({
  selectors: {
    '&:hover:not(:active)': {
      transform: 'scale(1.02)',
      opacity: 0.9,
    },
  },
});

const stepLabelStyle = style({
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.bold,
  lineHeight: vars.line.height.tight,
  pointerEvents: 'none',
});

const copiedFeedbackStyle = style({
  fontSize: vars.font.size['2xs'],
  fontWeight: vars.font.weight.semibold,
  lineHeight: vars.line.height.tight,
  pointerEvents: 'none',
  animationDuration: vars.duration.fast,
});

interface SwatchProps {
  intent: ColorIntent;
  step: ColorStep;
}

function Swatch({ intent, step }: SwatchProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const cssVar: ThemeToken = `--theme-${intent}-${step}`;
  const isLightStep = step <= 400;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`var(${cssVar})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  }, [cssVar]);

  return (
    <Button
      type="button"
      className={colorSwatchStyle.className}
      onClick={handleCopy}
      aria-label={`Copy ${cssVar}`}
      style={{
        backgroundColor: `var(${cssVar})`,
        color: isLightStep ? 'light-dark(#0f172a, #f8fafc)' : 'light-dark(#ffffff, #0f172a)',
      }}
    >
      {copied ? (
        <span className={copiedFeedbackStyle.className}>Copied!</span>
      ) : (
        <span className={stepLabelStyle.className}>{step}</span>
      )}
    </Button>
  );
}

export function ColorTokens() {
  return (
    <VStack gap="lg">
      {INTENT_SCALES.map((scale) => (
        <div key={scale.key} className={scaleContainerStyle.className}>
          <HStack className={headerRowStyle.className}>
            <Text className={intentTitleStyle.className}>{scale.label}</Text>
            <Code variant="subtle">{scale.seed}</Code>
          </HStack>
          <div className={colorGridStyle.className}>
            {STEPS.map((step) => (
              <Swatch key={step} intent={scale.key} step={step} />
            ))}
          </div>
        </div>
      ))}
    </VStack>
  );
}
