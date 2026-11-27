import { style } from '@cumulo/css';
import React from 'react';

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

export function StackCardFixture(): React.JSX.Element {
  return (
    <Card.Root data-testid="stack-card" padding="xl" direction="row" gap="md">
      <span>A</span>
      <span>B</span>
    </Card.Root>
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
