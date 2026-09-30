'use client';

import React from 'react';
import { style } from '@cumulo/css';
import { Link, type RoutePath, type RouteHtml, type PageProps } from '@renr/parcel-rsc-router';
import { routesByPage } from '../../routes';
import {
  Sidebar,
  SidebarToggle,
  Panel,
  SideNav,
  SideNavGroup,
  SideNavItem,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  vars,
} from '@cumulo/core';
import { Version } from './Version';

export interface NavItem {
  label: string;
  path: RoutePath;
  htmlPath: RouteHtml;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

const navContainerStyle = style({
  minHeight: '100vh',
  '@media': {
    '(max-width: 959px)': {
      display: 'none !important',
    },
  },
});

const sidebarHeaderStyle = style({
  height: '3.5rem',
  minHeight: '3.5rem',
  boxSizing: 'border-box',
  paddingInline: vars.spacing.md,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: `padding ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        paddingInline: vars.spacing.xs,
        justifyContent: 'center',
      },
  },
});

const brandLinkStyle = style({
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  marginBottom: vars.spacing.md,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  opacity: 1,
  transform: 'translateX(0)',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, transform ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        opacity: 0,
        transform: 'translateX(-8px)',
        pointerEvents: 'none',
        width: 0,
      },
  },
});

const brandIconStyle = style({
  fontSize: '20px',
  lineHeight: 1,
});

const footerStyle = style({
  marginTop: 'auto',
  paddingLeft: vars.spacing.xs,
  paddingTop: vars.spacing.md,
  overflow: 'hidden',
  opacity: 1,
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, max-height ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        opacity: 0,
        maxHeight: 0,
        paddingTop: 0,
        pointerEvents: 'none',
      },
  },
});

export const DOC_SECTIONS: NavSection[] = [
  {
    title: 'Docs',
    items: [
      { label: 'Overview', path: '/', htmlPath: '/index.html' },
      { label: '@cumulo/css Engine', path: '/css', htmlPath: '/css.html' },
      { label: '@cumulo/core Tokens', path: '/tokens', htmlPath: '/tokens.html' },
      {
        label: 'Theme Builder',
        path: '/theme-builder',
        htmlPath: '/theme-builder.html',
        badge: 'Playground',
      },
    ],
  },
];

export const COMPONENT_SECTIONS: NavSection[] = [
  {
    title: 'Layout & Structure',
    items: [
      {
        label: 'AppFrame',
        path: '/components/app-frame',
        htmlPath: '/components/app-frame.html',
        badge: 'Compound',
      },
      { label: 'Container', path: '/components/container', htmlPath: '/components/container.html' },
      { label: 'Divider', path: '/components/divider', htmlPath: '/components/divider.html' },
      { label: 'Flow', path: '/components/flow', htmlPath: '/components/flow.html' },
      {
        label: 'Panel',
        path: '/components/panel',
        htmlPath: '/components/panel.html',
        badge: 'New',
      },
      {
        label: 'Sidebar',
        path: '/components/sidebar',
        htmlPath: '/components/sidebar.html',
        badge: 'New',
      },
      {
        label: 'SideNav',
        path: '/components/side-nav',
        htmlPath: '/components/side-nav.html',
        badge: 'New',
      },
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
      {
        label: 'ButtonGroup',
        path: '/components/button-group',
        htmlPath: '/components/button-group.html',
        badge: 'Compound',
      },
      { label: 'Checkbox', path: '/components/checkbox', htmlPath: '/components/checkbox.html' },
      {
        label: 'Field',
        path: '/components/field',
        htmlPath: '/components/field.html',
        badge: 'Compound',
      },
      { label: 'Input', path: '/components/input', htmlPath: '/components/input.html' },
      { label: 'Radio', path: '/components/radio', htmlPath: '/components/radio.html' },
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

export interface NavContentProps {
  currentPage?: PageProps['currentPage'];
  pages?: PageProps['pages'];
  onNavigate?: () => void;
  showBrand?: boolean;
}

export function NavContent({
  currentPage,
  onNavigate,
  showBrand = true,
}: NavContentProps): React.JSX.Element {
  const currentUrl = currentPage?.url || '';
  const currentPath = currentPage?.url ? routesByPage[currentPage.url]?.path : undefined;

  const isItemActive = (item: NavItem) => currentPath === item.path || currentUrl === item.htmlPath;

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
      <SideNav aria-label="Documentation navigation">
        {/* Overview / Documentation Section */}
        {DOC_SECTIONS.map((section) => (
          <SideNavGroup key={section.title} title={section.title}>
            {section.items.map((item) => (
              <SideNavItem
                key={item.path}
                as={Link}
                to={item.path}
                onClick={onNavigate}
                active={isItemActive(item)}
                label={item.label}
                badge={item.badge ? <Badge variant="outline">{item.badge}</Badge> : undefined}
              />
            ))}
          </SideNavGroup>
        ))}

        {/* Components Group */}
        <SideNavGroup title="Components">
          {COMPONENT_SECTIONS.map((section) => {
            const hasActiveItem = section.items.some(isItemActive);

            return (
              <SideNavGroup
                key={section.title}
                collapsible
                defaultOpen={hasActiveItem || section.title === 'Layout & Structure'}
                title={section.title}
                badge={<Badge variant="secondary">{section.items.length}</Badge>}
              >
                {section.items.map((item) => (
                  <SideNavItem
                    key={item.path}
                    as={Link}
                    to={item.path}
                    onClick={onNavigate}
                    active={isItemActive(item)}
                    label={item.label}
                    badge={item.badge ? <Badge variant="outline">{item.badge}</Badge> : undefined}
                  />
                ))}
              </SideNavGroup>
            );
          })}
        </SideNavGroup>
      </SideNav>

      {/* Footer Info */}
      <VStack gap="3xs" className={footerStyle.className}>
        <Text size="xs" color="subtle">
          Cumulo <Version />
        </Text>
      </VStack>
    </>
  );
}

export interface NavProps {
  currentPage?: PageProps['currentPage'];
  pages?: PageProps['pages'];
}

export function Nav({ currentPage, pages }: NavProps): React.JSX.Element {
  return (
    <Sidebar expandOnHover className={navContainerStyle.className}>
      <Panel
        direction="row"
        padding="none"
        divider="bottom"
        className={sidebarHeaderStyle.className}
      >
        <Link to="/" className={brandLinkStyle.className}>
          <HStack gap="xs" align="center">
            <span className={brandIconStyle.className}>📦</span>
            <VStack gap="3xs">
              <Heading as="h4" size="sm">
                Cumulo UI
              </Heading>
              <Text type="caption" color="muted">
                Design System & Engine
              </Text>
            </VStack>
          </HStack>
        </Link>
        <SidebarToggle />
      </Panel>
      <Panel scrollable padding="sm">
        <NavContent currentPage={currentPage} pages={pages} showBrand={false} />
      </Panel>
    </Sidebar>
  );
}
