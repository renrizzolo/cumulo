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
  it('renders a label associated with an input and focuses on click', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="target-input" className="custom-label">
          Username
        </Label>
        <input id="target-input" />
      </div>,
    );

    const label = screen.getByText('Username');
    const input = screen.getByLabelText('Username');

    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'target-input');
    expect(label).toHaveClass('custom-label');
    expect(input).toBeInTheDocument();

    await user.click(label);
    expect(input).toHaveFocus();
  });
});
