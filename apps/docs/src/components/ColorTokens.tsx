import React from 'react';
import { style } from '@cumulo/css';
import { Text, VStack, vars } from '@cumulo/core';

const intentHeadingStyle = style({
  textTransform: 'capitalize',
  fontWeight: vars.font.weight.semibold,
  marginBottom: vars.spacing['2xs'],
  fontSize: vars.font.size.xs,
  color: vars.surface.muted,
});

const colorGridStyle = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))',
  gap: vars.spacing.xs,
  marginBottom: vars.spacing.md,
});

const colorSwatchStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${vars.spacing.xs} ${vars.spacing['2xs']}`,
  borderRadius: vars.radius.md,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
  textAlign: 'center',
  transition: `transform ${vars.duration.fast} ${vars.ease.default}`,
  ':hover': {
    transform: 'scale(1.05)',
  },
});

const stepLabelStyle = style({
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.bold,
});

export function ColorTokens(): React.JSX.Element {
  return (
    <VStack gap="md">
      {['primary', 'success', 'warning', 'error', 'info', 'grey'].map((intent) => (
        <div key={intent}>
          <Text className={intentHeadingStyle.className}>{intent}</Text>
          <div className={colorGridStyle.className}>
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => (
              <div
                key={step}
                className={colorSwatchStyle.className}
                style={{
                  backgroundColor: `var(--theme-${intent}-${step})`,
                  color: `contrast-color(var(--theme-${intent}-${step}))`,
                }}
              >
                <span className={stepLabelStyle.className}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </VStack>
  );
}
