'use client';

import React, { useState, useCallback } from 'react';
import { create, style } from '@cumulo/css';
import { Text, vars, type VarPath, Button } from '@cumulo/core';
import { Intent } from '@cumulo/core/intents';

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
  '@container': {
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
  },
  child: {
    display: 'grid',
    gridTemplateColumns: 'subgrid',
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
  const tokenVar = vars[intent][step];
  const cssVar = tokenVar.replace(/^var\((--[^)]+)\)$/, '$1');
  const isLightStep = step <= 400;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(tokenVar);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  }, [tokenVar]);

  return (
    <Button
      type="button"
      className={colorSwatchStyle.className}
      onClick={handleCopy}
      aria-label={`Copy ${cssVar}`}
      style={{
        backgroundColor: tokenVar,
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
    <div className={scaleGrid.parent.className}>
      {INTENT_SCALES.map((scale) => (
        <React.Fragment key={scale.key}>
          <Text type="label">{scale.label}</Text>
          <div className={colorGridStyle.className}>
            {STEPS.map((step) => (
              <Swatch key={step} intent={scale.key} step={step} />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
