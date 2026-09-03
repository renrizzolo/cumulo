import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../src/components/Textarea.js';
import { Field } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Textarea Component', () => {
  it('renders a textarea with default variants', () => {
    render(<Textarea aria-label="Bio" placeholder="Tell us about yourself" />);
    const textarea = screen.getByRole('textbox', { name: 'Bio' });

    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Tell us about yourself');
  });

  it('handles user typing', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Feedback" />);

    const textarea = screen.getByRole('textbox', { name: 'Feedback' });
    await user.type(textarea, 'Great product!');

    expect(textarea).toHaveValue('Great product!');
  });

  it('integrates seamlessly with Field compound component and registers ids', () => {
    render(
      <Field.Root isInvalid>
        <Field.Label>Comments</Field.Label>
        <Field.Textarea />
        <Field.Description>Max 500 characters</Field.Description>
        <Field.Error>Comment is required</Field.Error>
      </Field.Root>,
    );

    const textarea = screen.getByRole('textbox', { name: 'Comments' });
    expect(textarea).toBeInvalid();
    expect(textarea.getAttribute('aria-describedby')).toBeDefined();
  });
});
