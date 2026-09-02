import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, tabsListRecipe } from '../src/components/Tabs.js';

describe('Tabs Component', () => {
  it('renders tab list, triggers and default selected content', () => {
    render(
      <Tabs defaultValue="account">
        <Tabs.List>
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Tabs.Trigger value="password">Password</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="account">Account Settings Panel</Tabs.Content>
        <Tabs.Content value="password">Password Settings Panel</Tabs.Content>
      </Tabs>,
    );

    const accountTab = screen.getByRole('tab', { name: 'Account' });
    const passwordTab = screen.getByRole('tab', { name: 'Password' });

    expect(accountTab).toHaveAttribute('aria-selected', 'true');
    expect(passwordTab).toHaveAttribute('aria-selected', 'false');

    expect(screen.getByText('Account Settings Panel')).toBeInTheDocument();
    expect(screen.queryByText('Password Settings Panel')).not.toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    render(
      <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
      </Tabs>,
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);

    expect(handleValueChange).toHaveBeenCalledWith('tab2');
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('navigates between tabs using arrow keys', async () => {
    render(
      <Tabs defaultValue="first">
        <Tabs.List>
          <Tabs.Trigger value="first">First</Tabs.Trigger>
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
          <Tabs.Trigger value="third">Third</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="first">First Panel</Tabs.Content>
        <Tabs.Content value="second">Second Panel</Tabs.Content>
        <Tabs.Content value="third">Third Panel</Tabs.Content>
      </Tabs>,
    );

    const firstTab = screen.getByRole('tab', { name: 'First' });
    firstTab.focus();

    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');

    const secondTab = screen.getByRole('tab', { name: 'Second' });
    fireEvent.keyDown(secondTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Third' })).toHaveAttribute('aria-selected', 'true');

    const thirdTab = screen.getByRole('tab', { name: 'Third' });
    fireEvent.keyDown(thirdTab, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports pill and bordered variants', () => {
    const pill = tabsListRecipe({ variant: 'pill' });
    const bordered = tabsListRecipe({ variant: 'bordered' });

    expect(pill).toContain(tabsListRecipe.classNames.variants.variant.pill);
    expect(bordered).toContain(tabsListRecipe.classNames.variants.variant.bordered);
  });
});
