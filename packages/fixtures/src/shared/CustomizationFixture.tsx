import { style, recipe } from '@cumulo/css';
import React from 'react';

import { containerQuery } from '../../../core/src/breakpoints.js';
import { Button } from '../../../core/src/components/Button.js';
import * as Card from '../../../core/src/components/Card.js';

export const overrideCardStyle = style(
  {
    padding: '48px',
    backgroundColor: 'rgb(255, 0, 0)',
  },
  'consumer-card-override',
);

export const overrideButtonStyle = style(
  {
    backgroundColor: 'rgb(16, 185, 129)',
    borderRadius: '0px',
  },
  'consumer-btn-override',
);

export const containerWrapperStyle = style(
  {
    containerType: 'inline-size',
    containerName: 'demo-card',
  },
  'cq-wrapper',
);

export const containerResponsiveRecipe = recipe(
  {
    breakpoints: {
      wide: containerQuery('400px', 'demo-card'),
    },
    responsiveVariants: ['layout'],
    base: {
      display: 'flex',
    },
    variants: {
      layout: {
        stack: { flexDirection: 'column' },
        row: { flexDirection: 'row' },
      },
    },
  },
  'cq-box',
);

export function OverrideFixture(): React.JSX.Element {
  return (
    <div>
      <Card.Root data-testid="override-card" padding="md" className={overrideCardStyle.className}>
        Card content
      </Card.Root>
      <Button
        data-testid="override-btn"
        variant="primary"
        className={overrideButtonStyle.className}
      >
        Click
      </Button>
    </div>
  );
}

export function ResponsiveFixture(): React.JSX.Element {
  return (
    <Card.Root
      data-testid="responsive-card"
      padding={{ initial: 'xs', md: 'xl' }}
      direction={{ initial: 'column', md: 'row' }}
      gap="md"
    >
      <span>A</span>
      <span>B</span>
    </Card.Root>
  );
}

export function ContainerQueryFixture(): React.JSX.Element {
  return (
    <div
      data-testid="cq-parent"
      className={containerWrapperStyle.className}
      style={{ width: '300px' }}
    >
      <div
        data-testid="cq-child"
        className={containerResponsiveRecipe({ layout: { initial: 'stack', wide: 'row' } })}
      >
        <span>1</span>
        <span>2</span>
      </div>
    </div>
  );
}

export function ControlStyleFixture(): React.JSX.Element {
  return (
    <div>
      <Button data-testid="btn-primary" variant="primary">
        Primary
      </Button>
      <Button data-testid="btn-ghost" variant="ghost">
        Ghost
      </Button>
    </div>
  );
}
