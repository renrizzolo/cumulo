'use client';

import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { style, cx } from '@cumulo/css';
import { Link, type RoutePath } from '@renr/parcel-rsc-router';
import {
  Surface,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  vars,
} from '@cumulo/core';

export interface NavItem {
  label: string;
  path: RoutePath;
  htmlPath: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

const navContainerStyle = style({
  width: '270px',
  minWidth: '270px',
  minHeight: '100vh',
  borderRadius: 0,
  borderTop: 'none',
  borderBottom: 'none',
  borderLeft: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  boxSizing: 'border-box',
  overflowY: 'auto',
  '@media': {
    '(max-width: 959px)': {
      display: 'none !important',
    },
  },
});

const brandLinkStyle = style({
  textDecoration: 'none',
  color: 'inherit',
  paddingLeft: vars.spacing.xs,
  marginBottom: vars.spacing.xs,
});

const brandIconStyle = style({
  fontSize: '24px',
});

const sectionTriggerStyle = style({
  width: '100%',
  padding: `${vars.spacing['2xs']} ${vars.spacing.xs}`,
  borderRadius: vars.radius.md,
  fontWeight: vars.font.weight.semibold,
  whiteSpace: 'nowrap',
  border: 'none',
  cursor: 'pointer',
  transition: `color ${vars.duration.fast} ${vars.ease.default}, background-color ${vars.duration.fast} ${vars.ease.default}`,
  ':hover': {
    color: vars.surface.fg,
    backgroundColor: vars.surface.bg.next,
  },
});

const chevronIconStyle = style({
  transition: `transform ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(90deg)',
    },
  },
});

const navItemStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radius.md,
  color: vars.surface.fg,
  fontSize: vars.font.size.xs,
  textDecoration: 'none',
  transition: `background-color ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}`,
  ':hover': {
    backgroundColor: vars.surface.bg.next,
  },
});

const navItemActiveStyle = style({
  color: vars.primary.DEFAULT,
  backgroundColor: vars.surface.bg.next,
});

const footerStyle = style({
  marginTop: 'auto',
  paddingLeft: vars.spacing.xs,
  paddingTop: vars.spacing.md,
});

const sectionTitleStyle = style({
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  paddingLeft: vars.spacing.xs,
  fontSize: '11px',
  fontWeight: 600,
});

export const DOC_SECTIONS: NavSection[] = [
  {
    title: 'Docs',
    items: [
      { label: 'Overview', path: '/', htmlPath: '/index.html' },
      { label: '@cumulo/css Engine', path: '/css', htmlPath: '/css.html' },
      { label: '@cumulo/core Tokens', path: '/tokens', htmlPath: '/tokens.html' },
    ],
  },
];

export const COMPONENT_SECTIONS: NavSection[] = [
  {
    title: 'Layout & Structure',
    items: [
      { label: 'Container', path: '/components/container', htmlPath: '/components/container.html' },
      { label: 'Divider', path: '/components/divider', htmlPath: '/components/divider.html' },
      { label: 'Flow', path: '/components/flow', htmlPath: '/components/flow.html' },
      { label: 'Stack', path: '/components/stack', htmlPath: '/components/stack.html' },
      {
        label: 'Surface',
        path: '/components/surface',
        htmlPath: '/components/surface.html',
        badge: 'Core',
      },
    ],
  },
  {
    title: 'Forms & Inputs',
    items: [
      { label: 'Button', path: '/components/button', htmlPath: '/components/button.html' },
      { label: 'Checkbox', path: '/components/checkbox', htmlPath: '/components/checkbox.html' },
      {
        label: 'Field',
        path: '/components/field',
        htmlPath: '/components/field.html',
        badge: 'Compound',
      },
      { label: 'Input', path: '/components/input', htmlPath: '/components/input.html' },
      { label: 'Switch', path: '/components/switch', htmlPath: '/components/switch.html' },
      { label: 'Textarea', path: '/components/textarea', htmlPath: '/components/textarea.html' },
    ],
  },
  {
    title: 'Typography & Content',
    items: [
      { label: 'Badge', path: '/components/badge', htmlPath: '/components/badge.html' },
      { label: 'Card', path: '/components/card', htmlPath: '/components/card.html' },
      { label: 'Code', path: '/components/code', htmlPath: '/components/code.html' },
      { label: 'Heading', path: '/components/heading', htmlPath: '/components/heading.html' },
      { label: 'Table', path: '/components/table', htmlPath: '/components/table.html' },
      { label: 'Text', path: '/components/text', htmlPath: '/components/text.html' },
    ],
  },
  {
    title: 'Overlays & Disclosure',
    items: [
      {
        label: 'Collapsible',
        path: '/components/collapsible',
        htmlPath: '/components/collapsible.html',
        badge: 'Compound',
      },
      {
        label: 'Dialog',
        path: '/components/dialog',
        htmlPath: '/components/dialog.html',
        badge: 'Native',
      },
      {
        label: 'Popover',
        path: '/components/popover',
        htmlPath: '/components/popover.html',
        badge: 'Native',
      },
      {
        label: 'Tabs',
        path: '/components/tabs',
        htmlPath: '/components/tabs.html',
        badge: 'Compound',
      },
      {
        label: 'ThemeToggle',
        path: '/components/theme-toggle',
        htmlPath: '/components/theme-toggle.html',
      },
    ],
  },
];

export const NAV_SECTIONS: NavSection[] = [...DOC_SECTIONS, ...COMPONENT_SECTIONS];

function ChevronRightIcon(): React.JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={chevronIconStyle.className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export interface NavContentProps {
  currentPage?: PageProps['currentPage'];
  onNavigate?: () => void;
  showBrand?: boolean;
}

export function NavContent({
  currentPage,
  onNavigate,
  showBrand = true,
}: NavContentProps): React.JSX.Element {
  const currentUrl = currentPage?.url || '';

  const isItemActive = (item: NavItem) =>
    currentUrl === item.htmlPath ||
    currentUrl === item.path ||
    (item.path === '/' && (currentUrl === '/index.html' || currentUrl === ''));

  const renderLink = (item: NavItem) => {
    const isActive = isItemActive(item);

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        className={cx(navItemStyle.className, isActive && navItemActiveStyle.className)}
      >
        <span>{item.label}</span>
        {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
      </Link>
    );
  };

  return (
    <>
      {showBrand && (
        <Link to="/" onClick={onNavigate} className={brandLinkStyle.className}>
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
      )}

      {/* Navigation Sections */}
      <VStack gap="md">
        {/* Overview / Documentation Section */}
        {DOC_SECTIONS.map((section) => (
          <VStack key={section.title} gap="xs">
            <Text type="label" size="xs" color="muted" className={sectionTitleStyle.className}>
              {section.title}
            </Text>
            <VStack gap="3xs">{section.items.map(renderLink)}</VStack>
          </VStack>
        ))}

        {/* Components Group */}
        <VStack gap="xs">
          <Text type="label" size="xs" color="muted" className={sectionTitleStyle.className}>
            Components
          </Text>
          <VStack gap="2xs">
            {COMPONENT_SECTIONS.map((section) => {
              const hasActiveItem = section.items.some(isItemActive);

              return (
                <CollapsibleRoot key={section.title} defaultOpen={hasActiveItem || true}>
                  <CollapsibleTrigger variant="ghost" className={sectionTriggerStyle.className}>
                    <HStack gap="xs" align="center" flex="auto">
                      <ChevronRightIcon />
                      <Text as="span" size="sm" weight="semibold">
                        {section.title}
                      </Text>
                    </HStack>
                    <Badge variant="secondary">{section.items.length}</Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <VStack gap="3xs" style={{ paddingLeft: vars.spacing.lg }}>
                      {section.items.map(renderLink)}
                    </VStack>
                  </CollapsibleContent>
                </CollapsibleRoot>
              );
            })}
          </VStack>
        </VStack>
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
    </>
  );
}

export function Nav({
  currentPage,
}: {
  currentPage?: PageProps['currentPage'];
}): React.JSX.Element {
  return (
    <Surface level={1} padding="md" className={navContainerStyle.className}>
      <NavContent currentPage={currentPage} />
    </Surface>
  );
}
