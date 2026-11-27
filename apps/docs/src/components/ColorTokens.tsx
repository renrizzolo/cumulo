'use client';

import * as Popover from '@cumulo/core/components/Popover';
import { HStack } from '@cumulo/core/components/Stack';
import { Text } from '@cumulo/core/components/Text';
import { vars, type VarPath, VarValue } from '@cumulo/core/contract';
import { Intent } from '@cumulo/core/intents';
import { create, style } from '@cumulo/css';
import React, { useState, useCallback } from 'react';

type ColorIntent = Intent | 'grey';
type ColorStep = (typeof STEPS)[number];

interface IntentScaleItem {
  key: ColorIntent;
  label: string;
  seed: string;
  name: VarPath;
}

const INTENT_SCALES: readonly IntentScaleItem[] = [
  {
    key: 'primary',
    label: 'Primary',
    seed: vars.seed.primary,
    name: 'vars.seed.primary',
  },
  {
    key: 'success',
    label: 'Success',
    seed: vars.seed.success,
    name: 'vars.seed.success',
  },
  {
    key: 'warning',
    label: 'Warning',
    seed: vars.seed.warning,
    name: 'vars.seed.warning',
  },
  {
    key: 'error',
    label: 'Error',
    seed: vars.seed.error,
    name: 'vars.seed.error',
  },
  {
    key: 'info',
    label: 'Info',
    seed: vars.seed.info,
    name: 'vars.seed.info',
  },
  {
    key: 'grey',
    label: 'Grey',
    seed: vars.seed.grey,
    name: 'vars.seed.grey',
  },
] as const;

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

const colorGridStyle = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(10, minmax(0, 64px))',
  gap: vars.spacing.xs,
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    },
    '(max-width: 480px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
});

const scaleGrid = create({
  parent: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    alignItems: 'center',
    gap: vars.spacing.md,
    '@media': {
      '(max-width: 768px)': {
        gridTemplateColumns: '1fr',
      },
    },
  },
  row: {
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
    alignItems: 'center',
    '@media': {
      '(max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: vars.spacing.xs,
      },
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
  const cssVar: VarValue = `var(--theme-${intent}-${step})`;
  const varPath = `vars.${intent}[${step}]`;

  const isLightStep = step <= 400;

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  }, []);

  return (
    <Popover.Root>
      <Popover.Trigger
        className={colorSwatchStyle.className}
        aria-label="open copy menu"
        style={{
          backgroundColor: cssVar,
          color: isLightStep ? 'light-dark(#0f172a, #f8fafc)' : 'light-dark(#ffffff, #0f172a)',
        }}
      >
        {copied ? (
          <span className={copiedFeedbackStyle.className}>Copied!</span>
        ) : (
          <span className={stepLabelStyle.className}>{step}</span>
        )}
      </Popover.Trigger>
      <Popover.Content placement="bottom" size="sm">
        <HStack gap="sm">
          <Popover.Close
            width="full"
            onClick={() => {
              void handleCopy(cssVar);
            }}
          >
            Copy CSS
          </Popover.Close>
          <Popover.Close
            width="full"
            onClick={() => {
              void handleCopy(varPath);
            }}
          >
            Copy JS
          </Popover.Close>
        </HStack>
      </Popover.Content>
    </Popover.Root>
  );
}

export function ColorTokens() {
  return (
    <div className={scaleGrid.parent.className}>
      {INTENT_SCALES.map((scale) => (
        <div key={scale.key} className={scaleGrid.row.className}>
          <Text type="label">{scale.label}</Text>
          <div className={colorGridStyle.className}>
            {STEPS.map((step) => (
              <Swatch key={step} intent={scale.key} step={step} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
