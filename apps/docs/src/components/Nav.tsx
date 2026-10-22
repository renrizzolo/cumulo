'use client';

// Docs Navigation Component updated 2
import React from 'react';
import { style } from '@cumulo/css';
import { Link, type RoutePath, type RouteHtml, type PageProps } from '@renr/parcel-rsc-router';
import { routesByPage } from '../../routes';
import {
  SidebarRoot,
  SidebarHeader,
  SidebarFooter,
  Panel,
  SideNav,
  SideNavGroup,
  SideNavItem,
  VStack,
  Text,
  Badge,
  Button,
  vars,
  useSidebar,
} from '@cumulo/core';
import { Version } from './Version';
import { Logo } from './Logo';

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

const desktopNavContainerStyle = style({
  '@media': {
    '(max-width: 959px)': {
      display: 'none !important',
    },
  },
});

const mobileNavContainerStyle = style({
  '@media': {
    '(min-width: 960px)': {
      display: 'none !important',
    },
  },
});

const mobileBackdropStyle = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(4px)',
  zIndex: 35,
  '@media': {
    '(min-width: 960px)': {
      display: 'none !important',
    },
  },
});

function CloseIcon(): React.JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

const brandLinkStyle = style({
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
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
      {
        label: 'Tooltip',
        path: '/components/tooltip',
        htmlPath: '/components/tooltip.html',
        badge: 'Native',
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
          <Logo size="md" />
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
          {(() => {
            const hasAnyComponentActive = COMPONENT_SECTIONS.some((s) =>
              s.items.some(isItemActive),
            );
            return COMPONENT_SECTIONS.map((section) => {
              const hasActiveItem = section.items.some(isItemActive);

              return (
                <SideNavGroup
                  key={section.title}
                  collapsible
                  defaultOpen={
                    hasActiveItem ||
                    (!hasAnyComponentActive && section.title === 'Layout & Structure')
                  }
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
            });
          })()}
        </SideNavGroup>
      </SideNav>

      {/* Footer Info in standalone drawer */}
      {showBrand && (
        <VStack gap="3xs" style={{ marginTop: 'auto', paddingTop: vars.spacing.md }}>
          <Text size="xs" color="subtle">
            Cumulo <Version />
          </Text>
        </VStack>
      )}
    </>
  );
}

export interface NavProps {
  currentPage?: PageProps['currentPage'];
  pages?: PageProps['pages'];
}

export function SidebarNav({ currentPage, pages }: NavProps): React.JSX.Element {
  const sidebar = useSidebar();
  // navigating should collapse the sidebar on small screens
  const handleNavigate = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 960) {
      sidebar.setCollapsed(true);
    }
  };

  return (
    <>
      {/* Desktop Sidebar (docked push) */}
      <SidebarRoot
        collapsedWidth={'0px'}
        variant="docked"
        className={desktopNavContainerStyle.className}
      >
        <Panel padding="sm" divider="bottom">
          <SidebarHeader
            title={
              <Link to="/" className={brandLinkStyle.className}>
                <Logo />
              </Link>
            }
          />
        </Panel>
        <Panel scrollbar="thin" padding="sm" flex={1}>
          <NavContent currentPage={currentPage} pages={pages} showBrand={false} />
          <SidebarFooter style={{ marginTop: 'auto', paddingTop: vars.spacing.md }}>
            <Text size="xs" color="subtle">
              Cumulo <Version />
            </Text>
          </SidebarFooter>
        </Panel>
      </SidebarRoot>

      {/* Mobile Backdrop Overlay */}
      {!sidebar.visuallyCollapsed && (
        <div
          className={mobileBackdropStyle.className}
          onClick={() => sidebar.setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar (overlay) */}
      <SidebarRoot
        type="overlay"
        collapsedWidth={'0px'}
        variant="docked"
        className={mobileNavContainerStyle.className}
      >
        <Panel padding="sm" divider="bottom">
          <SidebarHeader
            title={
              <Link to="/" onClick={handleNavigate} className={brandLinkStyle.className}>
                <Logo />
              </Link>
            }
          >
            <Button
              size="sm"
              variant="ghost"
              shape="round"
              onClick={() => sidebar.setCollapsed(true)}
              aria-label="Close navigation menu"
            >
              <CloseIcon />
            </Button>
          </SidebarHeader>
        </Panel>
        <Panel scrollbar="thin" padding="sm">
          <NavContent
            currentPage={currentPage}
            pages={pages}
            showBrand={false}
            onNavigate={handleNavigate}
          />
          <SidebarFooter style={{ marginTop: 'auto', paddingTop: vars.spacing.md }}>
            <Text size="xs" color="subtle">
              Cumulo <Version />
            </Text>
          </SidebarFooter>
        </Panel>
      </SidebarRoot>
    </>
  );
}
