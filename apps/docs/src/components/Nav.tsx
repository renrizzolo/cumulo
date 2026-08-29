import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { style, cx } from '@cumulo/css';
import { Link, type RoutePath } from '@renr/parcel-rsc-router';
import { Surface, VStack, HStack, Heading, Text, Badge, vars } from '@cumulo/core';

interface NavItem {
  label: string;
  path: RoutePath;
  htmlPath: string;
  badge?: string;
}

const navContainerStyle = style({
  width: '270px',
  minWidth: '270px',
  minHeight: '100vh',
  borderRadius: 0,
  borderTop: 'none',
  borderBottom: 'none',
  borderLeft: 'none',
  padding: `${vars.spacing.lg} ${vars.spacing.sm}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
  boxSizing: 'border-box',
  overflowY: 'auto',
});

const brandLinkStyle = style({
  textDecoration: 'none',
  color: 'inherit',
  paddingLeft: vars.spacing.xs,
});

const brandIconStyle = style({
  fontSize: '24px',
});

const sectionHeadingStyle = style({
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  paddingLeft: vars.spacing.xs,
  fontSize: '11px',
  fontWeight: 600,
});

const sectionHeaderHStackStyle = style({
  paddingLeft: vars.spacing.xs,
  paddingRight: vars.spacing.xs,
});

const navItemStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `7px ${vars.spacing.sm}`,
  borderRadius: vars.radius.md,
  color: vars.surface.fg,
  fontWeight: vars.font.weight.normal,
  fontSize: vars.font.size.sm,
  textDecoration: 'none',
  transition: `background-color ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}`,
  ':hover': {
    backgroundColor: vars.surface.bg.next,
  },
});

const navItemActiveStyle = style({
  color: vars.primary.DEFAULT,
  backgroundColor: vars.surface.bg.next,
  fontWeight: vars.font.weight.semibold,
});

const footerStyle = style({
  marginTop: 'auto',
  paddingLeft: vars.spacing.xs,
  paddingTop: vars.spacing.md,
});

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
  { label: 'Flow', path: '/components/flow', htmlPath: '/components/flow.html' },
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
        className={cx(navItemStyle.className, isActive && navItemActiveStyle.className)}
      >
        <span>{item.label}</span>
        {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
      </Link>
    );
  };

  return (
    <Surface level={1} className={navContainerStyle.className}>
      {/* Brand Header */}
      <Link to="/" className={brandLinkStyle.className}>
        <HStack gap="sm" align="center">
          <span className={brandIconStyle.className}>📦</span>
          <VStack gap="3xs">
            <Heading as="h3" size="md">
              Cumulo UI
            </Heading>
            <Text type="caption" color="muted">
              Design System & Engine
            </Text>
          </VStack>
        </HStack>
      </Link>

      {/* Overview & Guides */}
      <VStack gap="xs">
        <Text type="label" size="xs" color="muted" className={sectionHeadingStyle.className}>
          Documentation
        </Text>
        <VStack gap="3xs">{DOC_PAGES.map(renderLink)}</VStack>
      </VStack>

      {/* Components Section */}
      <VStack gap="xs">
        <HStack justify="between" align="center" className={sectionHeaderHStackStyle.className}>
          <Text type="label" size="xs" color="muted" className={sectionHeadingStyle.className}>
            Components
          </Text>
          <Badge variant="secondary">{COMPONENT_PAGES.length}</Badge>
        </HStack>
        <VStack gap="3xs">{COMPONENT_PAGES.map(renderLink)}</VStack>
      </VStack>

      {/* Footer Info */}
      <VStack gap="3xs" className={footerStyle.className}>
        <Text type="caption" color="muted">
          Cumulo Monorepo
        </Text>
        <Text type="caption" color="muted">
          v0.1.0 • React 19
        </Text>
      </VStack>
    </Surface>
  );
}
