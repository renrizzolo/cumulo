import { cx, recipe, style } from '@cumulo/css';
import React from 'react';

import * as Grid from '../../../core/src/components/Grid.js';
import { Stack } from '../../../core/src/components/Stack.js';

const containerHostStyle = style(
  {
    containerType: 'inline-size',
    containerName: 'card',
  },
  'resp-container-host',
);

const containerCardRecipe = recipe(
  {
    layer: 'components',
    breakpoints: {
      wide: '@container card (min-width: 500px)',
    },
    base: {
      display: 'flex',
    },
    responsiveVariants: ['layout', 'padding'],
    variants: {
      layout: {
        stacked: { flexDirection: 'column' },
        horizontal: { flexDirection: 'row' },
      },
      padding: {
        sm: { padding: '8px' },
        lg: { padding: '24px' },
      },
    },
    defaultVariants: {
      layout: 'stacked',
      padding: 'sm',
    },
  },
  'resp-container-card',
);

const unlayeredOverride = style(
  {
    gap: '40px',
  },
  'resp-unlayered-override',
);

export function ResponsiveLayoutFixture(): React.JSX.Element {
  return (
    <div>
      <Stack
        data-testid="responsive-stack"
        direction={{ initial: 'column', md: 'row' }}
        gap={{ initial: 'xs', md: 'md', lg: 'xl' }}
      >
        <span>One</span>
        <span>Two</span>
      </Stack>

      <Stack
        data-testid="overridden-stack"
        gap={{ initial: 'xs', md: 'lg' }}
        className={unlayeredOverride.className}
      >
        <span>Override</span>
      </Stack>

      <Grid.Root
        data-testid="responsive-grid"
        columns={{ initial: 1, md: 2, lg: 4 }}
        gap={{ initial: 'sm', lg: 'xl' }}
      >
        <Grid.Item data-testid="responsive-grid-item" colSpan={{ initial: 1, md: 2 }}>
          <span>Cell</span>
        </Grid.Item>
      </Grid.Root>
    </div>
  );
}

export function ResponsiveContainerFixture({ width }: { width: number }): React.JSX.Element {
  return (
    <div
      data-testid="container-host"
      className={containerHostStyle.className}
      style={{ width: `${width}px` }}
    >
      <div
        data-testid="container-card"
        className={cx(
          containerCardRecipe({
            layout: { initial: 'stacked', wide: 'horizontal' },
            padding: { initial: 'sm', wide: 'lg' },
          }),
        )}
      >
        <span>A</span>
        <span>B</span>
      </div>
    </div>
  );
}
