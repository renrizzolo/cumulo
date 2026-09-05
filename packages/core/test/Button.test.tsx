import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../src/components/Button';

afterEach(() => {
  cleanup();
});

describe('Button component', () => {
  it('renders without crashing', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events when enabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Submit</Button>);

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click events when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Disabled Action
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Disabled Action' });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders icon at start or end relative to content', () => {
    const { rerender } = render(
      <Button icon={<span data-testid="icon">★</span>} iconPosition="start">
        Star
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button.firstChild).toHaveAttribute('data-testid', 'icon');

    rerender(
      <Button icon={<span data-testid="icon">★</span>} iconPosition="end">
        Star
      </Button>,
    );
    expect(button.lastChild).toHaveAttribute('data-testid', 'icon');
  });
});
