import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Label } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Label component', () => {
  it('associates with an input and focuses on click', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="target-input">Username</Label>
        <input id="target-input" />
      </div>,
    );

    const label = screen.getByText('Username');
    const input = screen.getByLabelText('Username');

    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'target-input');
    expect(input).toBeInTheDocument();

    await user.click(label);
    expect(input).toHaveFocus();
  });
});
