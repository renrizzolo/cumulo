import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Input } from '../src';

afterEach(() => {
  cleanup();
});

describe('Input component', () => {
  it('renders without crashing', () => {
    render(<Input placeholder="Search" />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('handles user typing in controlled mode', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function ControlledInput() {
      const [val, setVal] = useState('');
      return (
        <Input
          aria-label="Username"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            handleChange(e.target.value);
          }}
        />
      );
    }

    render(<ControlledInput />);
    const input = screen.getByRole('textbox', { name: 'Username' });

    await user.type(input, 'testuser');
    expect(input).toHaveValue('testuser');
    expect(handleChange).toHaveBeenCalledTimes(8);
  });

  it('prevents typing when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input aria-label="Disabled Input" disabled onChange={handleChange} />);

    const input = screen.getByRole('textbox', { name: 'Disabled Input' });
    expect(input).toBeDisabled();

    await user.type(input, 'hello');
    expect(handleChange).not.toHaveBeenCalled();
  });
});
