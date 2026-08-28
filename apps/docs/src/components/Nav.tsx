import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { Link, type RoutePath } from '@renr/parcel-rsc-router';
import { Surface, VStack, HStack, Heading, Text, Badge, Divider } from '@cumulo/core';

interface NavItem {
  label: string;
  path: RoutePath;
  htmlPath: string;
  badge?: string;
}

const DOC_PAGES: NavItem[] = [
  { label: 'Overview', path: '/', htmlPath: '/index.html' },
  { label: '@cumulo/css Engine', path: '/css', htmlPath: '/css.html' },
  { label: '@cumulo/core Tokens', path: '/tokens', htmlPath: '/tokens.html' },
];

const COMPONENT_PAGES: NavItem[] = [
  { label: 'Badge', path: '/components/badge', htmlPath: '/components/badge.html' },
  { label: 'Button', path: '/components/button', htmlPath: '/components/button.html' },
  { label: 'Card', path: '/components/card', htmlPath: '/components/card.html' },
  { label: 'Code', path: '/components/code', htmlPath: '/components/code.html' },
  { label: 'Container', path: '/components/container', htmlPath: '/components/container.html' },
  { label: 'Divider', path: '/components/divider', htmlPath: '/components/divider.html' },
  {
    label: 'Field',
    path: '/components/field',
    htmlPath: '/components/field.html',
    badge: 'Compound',
  },
  { label: 'Heading', path: '/components/heading', htmlPath: '/components/heading.html' },
  { label: 'Input', path: '/components/input', htmlPath: '/components/input.html' },
  { label: 'Stack', path: '/components/stack', htmlPath: '/components/stack.html' },
  {
    label: 'Surface',
    path: '/components/surface',
    htmlPath: '/components/surface.html',
    badge: 'Core',
  },
  { label: 'Table', path: '/components/table', htmlPath: '/components/table.html' },
  { label: 'Text', path: '/components/text', htmlPath: '/components/text.html' },
  {
    label: 'ThemeToggle',
    path: '/components/theme-toggle',
    htmlPath: '/components/theme-toggle.html',
  },
];

export function Nav({
  currentPage,
}: {
  currentPage?: PageProps['currentPage'];
}): React.JSX.Element {
  const currentUrl = currentPage?.url || '';

  const renderLink = (item: NavItem) => {
    const isActive =
      currentUrl === item.htmlPath ||
      currentUrl === item.path ||
      (item.path === '/' && (currentUrl === '/index.html' || currentUrl === '/'));

    return (
      <Link
        key={item.path}
        to={item.path}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderRadius: 'var(--theme-radius-md, 6px)',
          color: isActive ? 'var(--theme-primary, #6366f1)' : 'var(--surface-fg)',
          backgroundColor: isActive ? 'var(--surface-bg-next)' : 'transparent',
          fontWeight: isActive ? 600 : 400,
          fontSize: '13px',
          textDecoration: 'none',
          transition: 'background-color 0.15s ease, color 0.15s ease',
        }}
      >
        <span>{item.label}</span>
        {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
      </Link>
    );
  };

  return (
    <Surface
      level={1}
      style={{
        width: '260px',
        minWidth: '260px',
        minHeight: '100vh',
        borderRadius: 0,
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Brand Header */}
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', paddingLeft: '8px' }}>
        <HStack gap="sm" align="center">
          <span style={{ fontSize: '24px' }}>📦</span>
          <VStack gap="3xs">
            <Heading as="h3" size="lg">
              Cumulo UI
            </Heading>
            <Text type="caption" color="muted">
              Design System & Engine
            </Text>
          </VStack>
        </HStack>
      </Link>

      <Divider orientation="horizontal" />

      {/* Overview & Guides */}
      <VStack gap="xs">
        <Text
          type="label"
          size="xs"
          color="muted"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingLeft: '8px',
          }}
        >
          Documentation
        </Text>
        <VStack gap="3xs">{DOC_PAGES.map(renderLink)}</VStack>
      </VStack>

      {/* Components Section */}
      <VStack gap="xs">
        <HStack
          justify="between"
          align="center"
          style={{ paddingLeft: '8px', paddingRight: '8px' }}
        >
          <Text
            type="label"
            size="xs"
            color="muted"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Components
          </Text>
          <Badge variant="secondary" size="small">
            {COMPONENT_PAGES.length}
          </Badge>
        </HStack>
        <VStack gap="3xs">{COMPONENT_PAGES.map(renderLink)}</VStack>
      </VStack>

      {/* Footer Info */}
      <VStack gap="3xs" style={{ marginTop: 'auto', paddingLeft: '8px', paddingTop: '16px' }}>
        <Text type="caption" color="muted">
          Cumulo Monorepo
        </Text>
        <Text type="caption" color="muted">
          v0.1.0 • Pure React 19
        </Text>
      </VStack>
    </Surface>
  );
}

export default Nav;
