import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as Avatar from '../src/components/Avatar.js';
import { AvatarGroup, getInitials } from '../src/components/Avatar.js';

describe('getInitials helper', () => {
  it('extracts two uppercase initials from multi-word names', () => {
    expect(getInitials('Jane Doe')).toBe('JD');
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('John Ronald Reuel Tolkien')).toBe('JT');
  });

  it('handles single word names and whitespace', () => {
    expect(getInitials('Madonna')).toBe('MA');
    expect(getInitials('   Linus   ')).toBe('LI');
    expect(getInitials('')).toBe('');
    expect(getInitials(undefined)).toBe('');
  });
});

describe('Avatar Component', () => {
  it('renders role="img" and accessible label from name or alt', () => {
    render(<Avatar.Root name="Grace Hopper" />);

    const avatar = screen.getByRole('img', { name: 'Grace Hopper' });
    expect(avatar).toBeInTheDocument();
    expect(screen.getByText('GH')).toBeInTheDocument();
  });

  it('renders squircle corner shape without crashing', () => {
    render(<Avatar.Root shape="squircle" name="Grace Hopper" />);
    expect(screen.getByRole('img', { name: 'Grace Hopper' })).toBeInTheDocument();
  });

  it('renders custom fallback initials when provided', () => {
    render(<Avatar.Root fallback="CT" aria-label="Custom Tech" />);

    expect(screen.getByRole('img', { name: 'Custom Tech' })).toBeInTheDocument();
    expect(screen.getByText('CT')).toBeInTheDocument();
  });

  it('renders SVG placeholder icon when neither name nor initials are provided', () => {
    const { container } = render(<Avatar.Root aria-label="Anonymous User" />);

    expect(screen.getByRole('img', { name: 'Anonymous User' })).toBeInTheDocument();
    const svg = container.querySelector('svg');
    if (!svg) {
      throw new Error('Expected fallback SVG icon to be present');
    }
    expect(svg).toBeInTheDocument();
  });

  it('supports compound syntax with Avatar.Root, Fallback, and Badge', () => {
    render(
      <Avatar.Root aria-label="Alex Chen">
        <Avatar.Fallback name="Alex Chen" />
        <Avatar.Badge status="online" />
      </Avatar.Root>,
    );

    expect(screen.getByRole('img', { name: 'Alex Chen' })).toBeInTheDocument();
    expect(screen.getByText('AC')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Status: online' })).toBeInTheDocument();
  });

  it('supports individual subcomponents Avatar.Fallback, Avatar.Badge, and Avatar.Image', () => {
    render(
      <Avatar.Root aria-label="Standalone Parts">
        <Avatar.Fallback name="Standalone Parts" />
        <Avatar.Badge status="online" />
        <Avatar.Image src="" alt="Standalone Parts" />
      </Avatar.Root>,
    );

    expect(screen.getByRole('img', { name: 'Standalone Parts' })).toBeInTheDocument();
    expect(screen.getByText('SP')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Status: online' })).toBeInTheDocument();
  });

  it('renders status indicators with appropriate accessible name', () => {
    const { rerender } = render(
      <Avatar.Root aria-label="User">
        <Avatar.Badge status="busy" />
      </Avatar.Root>,
    );

    expect(screen.getByRole('status', { name: 'Status: busy' })).toBeInTheDocument();

    rerender(
      <Avatar.Root aria-label="User">
        <Avatar.Badge status="away" />
      </Avatar.Root>,
    );

    expect(screen.getByRole('status', { name: 'Status: away' })).toBeInTheDocument();
  });

  it('does not duplicate initials when name is provided on Avatar.Root alongside child subcomponents', () => {
    const { container } = render(
      <Avatar.Root name="Alice Walker">
        <Avatar.Fallback name="Alice Walker" />
        <Avatar.Badge status="online" />
      </Avatar.Root>,
    );

    const fallbacks = container.querySelectorAll('span[aria-hidden="true"]');
    const initialsSpans = Array.from(fallbacks).filter((el) => el.textContent === 'AW');
    expect(initialsSpans).toHaveLength(1);
    expect(screen.getByRole('status', { name: 'Status: online' })).toBeInTheDocument();
  });

  it('inherits name from context when Avatar.Fallback is rendered without name prop', () => {
    render(
      <Avatar.Root name="Dana Davis">
        <Avatar.Fallback />
        <Avatar.Badge status="online" />
      </Avatar.Root>,
    );

    expect(screen.getByText('DD')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Status: online' })).toBeInTheDocument();
  });

  it('renders direct shorthand with status badge without duplicating fallback', () => {
    render(
      <Avatar.Root name="Bob Smith">
        <Avatar.Badge status="away" />
      </Avatar.Root>,
    );

    expect(screen.getByText('BS')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Status: away' })).toBeInTheDocument();
  });
});

describe('AvatarGroup Component', () => {
  it('renders avatars inside a group role', () => {
    render(
      <AvatarGroup>
        <Avatar.Root name="Alice Adams" />
        <Avatar.Root name="Bob Baker" />
      </AvatarGroup>,
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Alice Adams' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Bob Baker' })).toBeInTheDocument();
  });

  it('supports Avatar.Group compound namespace syntax', () => {
    render(
      <Avatar.Group>
        <Avatar.Root name="Alice Adams" />
        <Avatar.Root name="Bob Baker" />
      </Avatar.Group>,
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Alice Adams' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Bob Baker' })).toBeInTheDocument();
  });

  it('truncates avatars when max is exceeded and displays +N overflow', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar.Root name="Alice Adams" />
        <Avatar.Root name="Bob Baker" />
        <Avatar.Root name="Charlie Clark" />
        <Avatar.Root name="Dana Davis" />
      </AvatarGroup>,
    );

    expect(screen.getByRole('img', { name: 'Alice Adams' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Bob Baker' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Charlie Clark' })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Dana Davis' })).not.toBeInTheDocument();

    const overflow = screen.getByRole('img', { name: '2 more' });
    expect(overflow).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
