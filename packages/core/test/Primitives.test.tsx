import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, Button, Grid, Input, Kbd, Link, Select, Spinner } from '../src/index.js';

describe('Button loading state', () => {
  it('sets aria-busy and prevents clicks when loading is true', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button loading onClick={onClick}>
        Save Changes
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save Changes' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Input adornments', () => {
  it('renders leading and trailing slots alongside input', () => {
    render(
      <Input
        placeholder="Search..."
        leading={<span data-testid="leading-icon">🔍</span>}
        trailing={<Kbd data-testid="trailing-kbd">/</Kbd>}
      />,
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trailing-kbd')).toBeInTheDocument();
  });
});

describe('Select Component', () => {
  it('renders placeholder option and handles value selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        aria-label="Framework"
        placeholder="Select framework"
        defaultValue=""
        onChange={onChange}
      >
        <option value="react">React</option>
        <option value="solid">Solid</option>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: 'Framework' });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Select framework' })).toBeDisabled();

    await user.selectOptions(select, 'react');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue('react');
  });
});

describe('Alert Component', () => {
  it('uses role="status" for info/success and role="alert" for warning/error', () => {
    const { rerender } = render(
      <Alert.Root intent="info">
        <Alert.Icon />
        <Alert.Content>
          <Alert.Title>Update available</Alert.Title>
          <Alert.Description>A new version is ready to install.</Alert.Description>
        </Alert.Content>
      </Alert.Root>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Update available')).toBeInTheDocument();

    rerender(
      <Alert.Root intent="error">
        <Alert.Icon />
        <Alert.Content>
          <Alert.Title>Deployment failed</Alert.Title>
        </Alert.Content>
      </Alert.Root>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('Grid, Spinner, Kbd, and Link primitives', () => {
  it('renders without crashing and exposes expected roles', () => {
    render(
      <Grid columns={2} gap="md">
        <Grid.Item colSpan={2}>
          <Spinner label="Fetching data" />
          <Kbd>⌘K</Kbd>
          <Link href="https://example.com" external>
            External Docs
          </Link>
        </Grid.Item>
      </Grid>,
    );

    expect(screen.getByRole('status', { name: 'Fetching data' })).toBeInTheDocument();
    expect(screen.getByText('⌘K').tagName).toBe('KBD');
    const link = screen.getByRole('link', { name: 'External Docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
