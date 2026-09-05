import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Field } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Field accessibility', () => {
  it('automatically connects label and input via id, htmlFor, and aria-labelledby', () => {
    render(
      <Field.Root>
        <Field.Label>Username</Field.Label>
        <Field.Input placeholder="Enter username" />
      </Field.Root>,
    );

    const input = screen.getByPlaceholderText('Enter username');
    const label = screen.getByText('Username');

    expect(input.id).toBeDefined();
    expect(input.id).not.toBe('');
    expect(label).toHaveAttribute('for', input.id);
    expect(input).toHaveAttribute('aria-labelledby', label.id);
    expect(screen.getByLabelText('Username')).toBe(input);
  });

  it('associates input with description via aria-describedby', () => {
    render(
      <Field.Root id="email-field">
        <Field.Label>Email</Field.Label>
        <Field.Input placeholder="user@example.com" />
        <Field.Description>We will never share your email address.</Field.Description>
      </Field.Root>,
    );

    const input = screen.getByPlaceholderText('user@example.com');
    const description = screen.getByText('We will never share your email address.');

    expect(description).toHaveAttribute('id', 'email-field-description');
    expect(input).toHaveAttribute('aria-describedby', 'email-field-description');
    expect(input).toHaveAccessibleDescription('We will never share your email address.');
  });

  it('associates input with error message via aria-describedby and sets aria-invalid', () => {
    render(
      <Field.Root id="email-field">
        <Field.Label>Email</Field.Label>
        <Field.Input placeholder="user@example.com" />
        <Field.Error>Please enter a valid email address.</Field.Error>
      </Field.Root>,
    );

    const input = screen.getByPlaceholderText('user@example.com');
    const error = screen.getByText('Please enter a valid email address.');

    expect(error).toHaveAttribute('id', 'email-field-error');
    expect(input).toHaveAttribute('aria-describedby', 'email-field-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeInvalid();
  });

  it('chains both description and error IDs in aria-describedby', () => {
    render(
      <Field.Root id="pwd-field">
        <Field.Label>Password</Field.Label>
        <Field.Input type="password" placeholder="Password" />
        <Field.Description>Must be at least 8 characters.</Field.Description>
        <Field.Error>Password is too weak.</Field.Error>
      </Field.Root>,
    );

    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('aria-describedby', 'pwd-field-description pwd-field-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('propagates isInvalid from Field.Root to input even without Field.Error', () => {
    render(
      <Field.Root isInvalid>
        <Field.Label>Username</Field.Label>
        <Field.Input placeholder="Username" />
      </Field.Root>,
    );

    const input = screen.getByPlaceholderText('Username');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeInvalid();
  });

  it('leaves aria-invalid and aria-describedby unset when valid and no descriptions exist', () => {
    render(
      <Field.Root>
        <Field.Label>Full Name</Field.Label>
        <Field.Input placeholder="Full Name" />
      </Field.Root>,
    );

    const input = screen.getByPlaceholderText('Full Name');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).toBeValid();
  });

  it('respects user-provided custom IDs, htmlFor, aria-labelledby, and aria-describedby overrides', () => {
    render(
      <Field.Root id="custom-root">
        <Field.Label id="custom-label-id" htmlFor="custom-input-id">
          Custom Label
        </Field.Label>
        <Field.Input
          id="custom-input-id"
          aria-labelledby="custom-label-id"
          aria-describedby="custom-desc-id"
          placeholder="Custom Input"
        />
        <Field.Description id="custom-desc-id">Custom description</Field.Description>
        <Field.Error id="custom-err-id">Custom error</Field.Error>
      </Field.Root>,
    );

    const input = screen.getByPlaceholderText('Custom Input');
    const label = screen.getByText('Custom Label');
    const desc = screen.getByText('Custom description');
    const err = screen.getByText('Custom error');

    expect(input.id).toBe('custom-input-id');
    expect(label.id).toBe('custom-label-id');
    expect(label).toHaveAttribute('for', 'custom-input-id');
    expect(desc.id).toBe('custom-desc-id');
    expect(err.id).toBe('custom-err-id');
    expect(input).toHaveAttribute('aria-labelledby', 'custom-label-id');
    expect(input).toHaveAttribute('aria-describedby', 'custom-desc-id');
  });

  it('allows explicit aria-invalid override on Field.Input', () => {
    render(
      <Field.Root isInvalid={true}>
        <Field.Label>Username</Field.Label>
        <Field.Input placeholder="Username" aria-invalid={false} />
      </Field.Root>,
    );

    const input = screen.getByPlaceholderText('Username');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toBeValid();
  });

  it('dynamically updates aria-describedby and aria-invalid when error is toggled', async () => {
    const user = userEvent.setup();

    render(<DynamicForm />);

    const input = screen.getByPlaceholderText('Email');
    const toggleBtn = screen.getByText('Toggle Error');

    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute('aria-describedby', 'dynamic-field-description');

    await user.click(toggleBtn);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'dynamic-field-description dynamic-field-error',
    );
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();

    await user.click(toggleBtn);

    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute('aria-describedby', 'dynamic-field-description');
    expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
  });

  it('dynamically updates aria-describedby when description is unmounted', async () => {
    const user = userEvent.setup();

    render(<DynamicDescForm />);
    const input = screen.getByPlaceholderText('Code');
    expect(input).toHaveAttribute('aria-describedby', 'desc-field-description');

    await user.click(screen.getByText('Hide Desc'));
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});

function DynamicDescForm() {
  const [showDesc, setShowDesc] = useState(true);
  return (
    <Field.Root id="desc-field">
      <Field.Label>Code</Field.Label>
      <Field.Input placeholder="Code" />
      {showDesc && <Field.Description>Help text</Field.Description>}
      <button onClick={() => setShowDesc(false)}>Hide Desc</button>
    </Field.Root>
  );
}

function DynamicForm() {
  const [showError, setShowError] = useState(false);
  return (
    <Field.Root id="dynamic-field">
      <Field.Label>Email</Field.Label>
      <Field.Input placeholder="Email" />
      <Field.Description>Enter your email address</Field.Description>
      {showError && <Field.Error>Invalid email address</Field.Error>}
      <button onClick={() => setShowError((prev) => !prev)}>Toggle Error</button>
    </Field.Root>
  );
}
