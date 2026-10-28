'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keyframes, style } from '@cumulo/css';
import { Link, type RoutePath, type RouteHtml, type PageProps } from '@renr/parcel-rsc-router';
import { routesByPage } from '../../routes';
import {
  Sidebar,
  SideNav,
  Panel,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  Field,
  vars,
  useSidebar,
  Tooltip,
} from '@cumulo/core';
import { Version } from './Version';
import { Logo } from './Logo';

export interface NavItem {
  label: string;
  path: RoutePath;
  htmlPath: RouteHtml;
  badge?: string;
  keywords?: string[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
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

const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
});

const mobileBackdropStyle = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: `color-mix(in oklch, ${vars.fg} 25%, transparent)`,
  backdropFilter: `blur(${vars.spacing['2xs']})`,
  zIndex: 35,
  animation: `${fadeIn} ${vars.duration.normal} ${vars.ease.default}`,
  '@media': {
    '(min-width: 960px)': {
      display: 'none !important',
    },
  },
});

const brandLinkStyle = style({
  textDecoration: 'none',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 0,
});

const searchStickyWrapperStyle = style({
  position: 'sticky',
  top: `calc(-1 * ${vars.spacing.sm})`,
  zIndex: 2,
  backgroundColor: vars.surface.bg.DEFAULT,
  marginTop: `calc(-1 * ${vars.spacing.sm})`,
  paddingTop: vars.spacing.sm,
  paddingBottom: vars.spacing.xs,
  marginInline: `calc(-1 * ${vars.spacing['2xs']})`,
  paddingInline: vars.spacing['2xs'],
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-visually-collapsed="true"] &': {
      opacity: 0,
      pointerEvents: 'none',
    },
  },
});

const searchInputWrapperStyle = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
});

const searchIconContainerStyle = style({
  position: 'absolute',
  insetInlineStart: 0,
  width: vars.size.sm,
  height: vars.size.sm,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.surface.subtle,
  pointerEvents: 'none',
  transition: `color ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-search-wrapper="true"]:focus-within &': {
      color: vars.surface.fg,
    },
  },
});

const searchInputStyle = style({
  selectors: {
    '&&': {
      paddingLeft: vars.size.sm,
      paddingRight: vars.size.sm,
      fontSize: vars.font.size.xs,
    },
  },
});

const searchTrailingStyle = style({
  position: 'absolute',
  insetInlineEnd: vars.spacing.xs,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const searchKbdStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: vars.spacing['2xs'],
  paddingBlock: vars.spacing['3xs'],
  fontFamily: vars.font.mono,
  fontSize: vars.font.size['2xs'],
  fontWeight: vars.font.weight.medium,
  lineHeight: vars.line.height.none,
  color: vars.surface.subtle,
  backgroundColor: vars.surface.bg.next,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
  borderRadius: vars.radius.md,
  userSelect: 'none',
  pointerEvents: 'none',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-search-wrapper="true"]:focus-within &': {
      opacity: 0,
    },
  },
});

const clearButtonStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: vars.size['2xs'],
  height: vars.size['2xs'],
  padding: 0,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: vars.radius.md,
  backgroundColor: 'transparent',
  color: vars.surface.subtle,
  cursor: 'pointer',
  transition: `color ${vars.duration.fast} ${vars.ease.default}, background-color ${vars.duration.fast} ${vars.ease.default}, border-color ${vars.duration.fast} ${vars.ease.default}`,
  ':hover': {
    color: vars.surface.fg,
    backgroundColor: vars.surface.secondary.hover,
  },
  ':focus-visible': {
    outline: 'none',
    color: vars.surface.fg,
    borderColor: vars.primary.focus,
  },
});

const emptyStateStyle = style({
  paddingBlock: vars.spacing.lg,
  paddingInline: vars.spacing.xs,
  textAlign: 'center',
});

const closeIconStyle = style({
  width: vars.size['2xs'],
  height: vars.size['2xs'],
});

const searchIconStyle = style({
  width: vars.size['3xs'],
  height: vars.size['3xs'],
});

const clearIconStyle = style({
  width: vars.size['4xs'],
  height: vars.size['4xs'],
});

function CloseIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={closeIconStyle.className}
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function SearchIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={searchIconStyle.className}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={clearIconStyle.className}
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

export const DOC_SECTIONS: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        label: 'Overview',
        path: '/',
        htmlPath: '/index.html',
        keywords: ['introduction', 'install', 'getting started', 'home'],
      },
      {
        label: 'Tokens & Theming',
        path: '/tokens',
        htmlPath: '/tokens.html',
        keywords: ['colors', 'palette', 'oklch', 'spacing', 'radius', 'shadows', 'vars', 'theme'],
      },
      {
        label: 'Styling (@cumulo/css)',
        path: '/css',
        htmlPath: '/css.html',
        keywords: ['style', 'recipe', 'cx', 'keyframes', 'createTheme', 'css'],
      },
      {
        label: 'Working with AI',
        path: '/ai',
        htmlPath: '/ai.html',
        keywords: ['llm', 'agents', 'cursor', 'claude', 'copilot', 'prompts', 'rules'],
      },
      {
        label: 'Theme Builder',
        path: '/theme-builder',
        htmlPath: '/theme-builder.html',
        badge: 'Playground',
        keywords: ['generator', 'custom theme', 'color picker', 'interactive', 'playground'],
      },
    ],
  },
];

export const COMPONENT_SECTIONS: NavSection[] = [
  {
    title: 'Layout',
    items: [
      {
        label: 'AppFrame',
        path: '/components/app-frame',
        htmlPath: '/components/app-frame.html',
        keywords: ['shell', 'application', 'layout', 'main', 'header'],
      },
      {
        label: 'Container',
        path: '/components/container',
        htmlPath: '/components/container.html',
        keywords: ['wrapper', 'max-width', 'responsive', 'center'],
      },
      {
        label: 'Divider',
        path: '/components/divider',
        htmlPath: '/components/divider.html',
        keywords: ['separator', 'hr', 'line', 'border'],
      },
      {
        label: 'Flow',
        path: '/components/flow',
        htmlPath: '/components/flow.html',
        keywords: ['prose', 'article', 'vertical rhythm', 'spacing'],
      },
      {
        label: 'Panel',
        path: '/components/panel',
        htmlPath: '/components/panel.html',
        keywords: ['scroll', 'pane', 'section', 'divider'],
      },
      {
        label: 'Stack',
        path: '/components/stack',
        htmlPath: '/components/stack.html',
        keywords: ['hstack', 'vstack', 'flex', 'row', 'column', 'gap'],
      },
      {
        label: 'Surface',
        path: '/components/surface',
        htmlPath: '/components/surface.html',
        keywords: ['background', 'elevation', 'level', 'box', 'layer'],
      },
    ],
  },
  {
    title: 'Navigation',
    items: [
      {
        label: 'Collapsible',
        path: '/components/collapsible',
        htmlPath: '/components/collapsible.html',
        keywords: ['accordion', 'disclosure', 'expand', 'collapse', 'details'],
      },
      {
        label: 'Sidebar',
        path: '/components/sidebar',
        htmlPath: '/components/sidebar.html',
        keywords: ['drawer', 'rail', 'navigation', 'aside', 'docked', 'floating'],
      },
      {
        label: 'SideNav',
        path: '/components/side-nav',
        htmlPath: '/components/side-nav.html',
        keywords: ['menu', 'navigation', 'links', 'sidebar', 'group'],
      },
      {
        label: 'Tabs',
        path: '/components/tabs',
        htmlPath: '/components/tabs.html',
        keywords: ['tablist', 'tabpanel', 'switch', 'navigation'],
      },
    ],
  },
  {
    title: 'Forms & Inputs',
    items: [
      {
        label: 'Button',
        path: '/components/button',
        htmlPath: '/components/button.html',
        keywords: ['action', 'click', 'submit', 'cta', 'icon button'],
      },
      {
        label: 'ButtonGroup',
        path: '/components/button-group',
        htmlPath: '/components/button-group.html',
        keywords: ['toolbar', 'segmented', 'buttons', 'split'],
      },
      {
        label: 'Checkbox',
        path: '/components/checkbox',
        htmlPath: '/components/checkbox.html',
        keywords: ['check', 'tick', 'boolean', 'multi-select', 'form'],
      },
      {
        label: 'Field',
        path: '/components/field',
        htmlPath: '/components/field.html',
        keywords: ['form', 'label', 'error', 'description', 'validation', 'control'],
      },
      {
        label: 'Input',
        path: '/components/input',
        htmlPath: '/components/input.html',
        keywords: ['text', 'textfield', 'search', 'email', 'password', 'form'],
      },
      {
        label: 'Radio',
        path: '/components/radio',
        htmlPath: '/components/radio.html',
        keywords: ['radiolist', 'option', 'single-select', 'choice', 'form'],
      },
      {
        label: 'Switch',
        path: '/components/switch',
        htmlPath: '/components/switch.html',
        keywords: ['toggle', 'boolean', 'on off', 'settings', 'form'],
      },
      {
        label: 'Textarea',
        path: '/components/textarea',
        htmlPath: '/components/textarea.html',
        keywords: ['multiline', 'text', 'comment', 'form'],
      },
    ],
  },
  {
    title: 'Data Display',
    items: [
      {
        label: 'Badge',
        path: '/components/badge',
        htmlPath: '/components/badge.html',
        keywords: ['tag', 'pill', 'status', 'chip', 'label', 'count'],
      },
      {
        label: 'Card',
        path: '/components/card',
        htmlPath: '/components/card.html',
        keywords: ['box', 'panel', 'tile', 'container', 'surface'],
      },
      {
        label: 'Table',
        path: '/components/table',
        htmlPath: '/components/table.html',
        keywords: ['grid', 'data', 'rows', 'columns', 'thead', 'tbody'],
      },
      {
        label: 'ThemeToggle',
        path: '/components/theme-toggle',
        htmlPath: '/components/theme-toggle.html',
        keywords: ['dark mode', 'light mode', 'color scheme', 'appearance', 'sun', 'moon'],
      },
    ],
  },
  {
    title: 'Typography',
    items: [
      {
        label: 'Code',
        path: '/components/code',
        htmlPath: '/components/code.html',
        keywords: ['inline code', 'monospace', 'snippet', 'kbd', 'pre'],
      },
      {
        label: 'Heading',
        path: '/components/heading',
        htmlPath: '/components/heading.html',
        keywords: ['h1', 'h2', 'h3', 'h4', 'title', 'header', 'typography'],
      },
      {
        label: 'Text',
        path: '/components/text',
        htmlPath: '/components/text.html',
        keywords: ['paragraph', 'span', 'body', 'copy', 'label', 'typography'],
      },
    ],
  },
  {
    title: 'Overlays',
    items: [
      {
        label: 'Dialog',
        path: '/components/dialog',
        htmlPath: '/components/dialog.html',
        keywords: ['modal', 'popup', 'alert', 'confirm', 'overlay'],
      },
      {
        label: 'Popover',
        path: '/components/popover',
        htmlPath: '/components/popover.html',
        keywords: ['dropdown', 'menu', 'floating', 'anchor', 'overlay'],
      },
      {
        label: 'Tooltip',
        path: '/components/tooltip',
        htmlPath: '/components/tooltip.html',
        keywords: ['hint', 'hover', 'floating', 'info', 'overlay'],
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
  query?: string;
  onQueryChange?: (query: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SidebarNavToggle(): React.JSX.Element {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger as={'span'}>
        <Sidebar.Toggle />
      </Tooltip.Trigger>
      <Tooltip.Content placement="right">Toggle navigation</Tooltip.Content>
    </Tooltip.Root>
  );
}

function matchesItem(item: NavItem, sectionTitle: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  if (item.label.toLowerCase().includes(normalizedQuery)) return true;
  if (sectionTitle.toLowerCase().includes(normalizedQuery)) return true;
  if (item.path.toLowerCase().includes(normalizedQuery)) return true;
  if (item.keywords?.some((kw) => kw.toLowerCase().includes(normalizedQuery))) return true;
  return false;
}

export function NavContent({
  currentPage,
  onNavigate,
  showBrand = true,
  query: controlledQuery,
  onQueryChange,
  searchInputRef: externalInputRef,
}: NavContentProps): React.JSX.Element {
  const sidebar = useSidebar();
  const [uncontrolledQuery, setUncontrolledQuery] = useState('');
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const inputRef = externalInputRef ?? internalInputRef;

  const query = controlledQuery !== undefined ? controlledQuery : uncontrolledQuery;
  const setQuery = useCallback(
    (next: string) => {
      if (controlledQuery === undefined) {
        setUncontrolledQuery(next);
      }
      onQueryChange?.(next);
    },
    [controlledQuery, onQueryChange],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0;

  const currentUrl = currentPage?.url || '';
  const currentPath = currentPage?.url ? routesByPage[currentPage.url]?.path : undefined;

  const isItemActive = (item: NavItem): boolean =>
    currentPath === item.path || currentUrl === item.htmlPath;

  const filteredComponentSections = useMemo((): NavSection[] => {
    if (!isFiltering) return COMPONENT_SECTIONS;
    return COMPONENT_SECTIONS.map((section): NavSection => ({
      ...section,
      items: section.items.filter((item) => matchesItem(item, section.title, normalizedQuery)),
    })).filter((section) => section.items.length > 0);
  }, [isFiltering, normalizedQuery]);

  const filteredDocSections = useMemo((): NavSection[] => {
    if (!isFiltering) return DOC_SECTIONS;
    return DOC_SECTIONS.map((section): NavSection => ({
      ...section,
      items: section.items.filter((item) => item.label.toLowerCase().includes(normalizedQuery)),
    })).filter((section) => section.items.length > 0);
  }, [isFiltering, normalizedQuery]);

  const totalMatches = useMemo((): number => {
    const componentCount = filteredComponentSections.reduce((acc, s) => acc + s.items.length, 0);
    const docCount = filteredDocSections.reduce((acc, s) => acc + s.items.length, 0);
    return componentCount + docCount;
  }, [filteredComponentSections, filteredDocSections]);

  const getNavLinks = (): HTMLAnchorElement[] => {
    if (!navRef.current) return [];
    return Array.from(navRef.current.querySelectorAll<HTMLAnchorElement>('a[href]'));
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleItemNavigate = useCallback(() => {
    setQuery('');
    onNavigate?.();
  }, [setQuery, onNavigate]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (query.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        setQuery('');
      } else {
        e.currentTarget.blur();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      const links = getNavLinks();
      if (links.length > 0) {
        e.preventDefault();
        links[0]?.focus();
      }
      return;
    }

    if (e.key === 'Enter' && isFiltering) {
      const links = getNavLinks();
      if (links.length > 0) {
        e.preventDefault();
        links[0]?.click();
      }
    }
  };

  const handleNavKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && isFiltering) {
      e.preventDefault();
      e.stopPropagation();
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }

    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    const links = getNavLinks();
    if (links.length === 0) return;

    const activeEl = document.activeElement;
    const currentIndex = links.findIndex((link) => link === activeEl);
    if (currentIndex === -1) return;

    e.preventDefault();
    if (e.key === 'ArrowDown') {
      const nextIndex = (currentIndex + 1) % links.length;
      links[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      if (currentIndex === 0) {
        inputRef.current?.focus();
        inputRef.current?.select();
      } else {
        links[currentIndex - 1]?.focus();
      }
    }
  };

  const renderSection = (section: NavSection) => (
    <SideNav.Group key={section.title} title={section.title}>
      {section.items.map((item) => (
        <SideNav.Item
          key={item.path}
          as={Link}
          to={item.path}
          onClick={handleItemNavigate}
          active={isItemActive(item)}
          label={item.label}
          badge={item.badge ? <Badge variant="outline">{item.badge}</Badge> : undefined}
        />
      ))}
    </SideNav.Group>
  );

  return (
    <>
      {showBrand && (
        <Link to="/" onClick={handleItemNavigate} className={brandLinkStyle.className}>
          <Logo size="md" />
        </Link>
      )}

      {/* Pinned Search Filter */}
      <div className={searchStickyWrapperStyle.className}>
        <Field.Root gap="none">
          <div data-search-wrapper="true" className={searchInputWrapperStyle.className}>
            <span className={searchIconContainerStyle.className}>
              <SearchIcon />
            </span>
            <Field.Input
              ref={inputRef}
              aria-label="Filter components"
              size="sm"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (sidebar.collapsed) {
                  sidebar.setCollapsed(false);
                }
              }}
              placeholder="Filter components..."
              autoComplete="off"
              className={searchInputStyle.className}
            />
            <span className={searchTrailingStyle.className}>
              {query.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear filter"
                  className={clearButtonStyle.className}
                >
                  <ClearIcon />
                </button>
              ) : (
                <kbd className={searchKbdStyle.className} aria-hidden="true">
                  /
                </kbd>
              )}
            </span>
          </div>
        </Field.Root>
      </div>

      {/* Navigation Sections */}
      {isFiltering && totalMatches === 0 ? (
        <VStack gap="xs" align="center" className={emptyStateStyle.className}>
          <Text size="xs" color="subtle">
            No components matching &ldquo;{query.trim()}&rdquo;
          </Text>
          <Button size="xs" variant="secondary" onClick={handleClear}>
            Clear filter
          </Button>
        </VStack>
      ) : (
        <SideNav.Root
          ref={navRef}
          aria-label="Documentation navigation"
          onKeyDown={handleNavKeyDown}
        >
          {isFiltering ? (
            <>
              {filteredComponentSections.map(renderSection)}
              {filteredDocSections.map(renderSection)}
            </>
          ) : (
            <>
              {DOC_SECTIONS.map(renderSection)}
              {COMPONENT_SECTIONS.map(renderSection)}
            </>
          )}
        </SideNav.Root>
      )}
    </>
  );
}

export interface NavProps {
  currentPage?: PageProps['currentPage'];
  pages?: PageProps['pages'];
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
}

export function SidebarNav({ currentPage, pages }: NavProps): React.JSX.Element {
  const sidebar = useSidebar();
  const [query, setQuery] = useState('');
  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const prevUrlRef = useRef(currentPage?.url);

  const collapseMobileSidebar = useCallback(() => {
    sidebar.setCollapsed(true);
    sidebar.setFocused(false);
    sidebar.setHovered(false);
    sidebar.setHoverSuppressed(true);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [sidebar]);

  // Navigating clears the search filter and collapses the mobile sidebar on small screens
  const handleNavigate = useCallback(() => {
    setQuery('');
    if (typeof window !== 'undefined' && window.innerWidth < 960) {
      collapseMobileSidebar();
    }
  }, [collapseMobileSidebar]);

  // Also reset filter and close mobile drawer when route changes via page links or history
  useEffect(() => {
    if (prevUrlRef.current !== currentPage?.url) {
      prevUrlRef.current = currentPage?.url;
      setQuery('');
      if (typeof window !== 'undefined' && window.innerWidth < 960) {
        collapseMobileSidebar();
      }
    }
  }, [currentPage?.url, collapseMobileSidebar]);

  // Global '/' shortcut to focus the component filter (and open sidebar if closed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== '/') return;
      if (isEditableElement(e.target) || isEditableElement(document.activeElement)) return;

      e.preventDefault();

      const isMobile = window.innerWidth < 960;
      const targetInput = isMobile ? mobileInputRef.current : desktopInputRef.current;
      const wasCollapsed = sidebar.collapsed || sidebar.visuallyCollapsed;

      if (sidebar.collapsed) {
        sidebar.setCollapsed(false);
      }
      sidebar.setHoverSuppressed(false);
      sidebar.setFocused(true);

      targetInput?.focus();
      targetInput?.select();

      if (wasCollapsed) {
        requestAnimationFrame(() => {
          targetInput?.focus();
          targetInput?.select();
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebar]);

  const brandTitle = (onBrandClick?: () => void) => (
    <HStack gap="xs" align="center">
      <Link to="/" onClick={onBrandClick} className={brandLinkStyle.className}>
        <Logo />
      </Link>
      <Badge variant="secondary" size="2xs">
        <Version />
      </Badge>
    </HStack>
  );

  return (
    <>
      {/* Desktop Sidebar (docked push) */}
      <Sidebar.Root
        collapsedWidth={'0px'}
        variant="docked"
        className={desktopNavContainerStyle.className}
      >
        <Panel padding="sm" divider="bottom">
          <Sidebar.Header title={brandTitle(handleNavigate)}>
            {!sidebar.visuallyCollapsed ? <SidebarNavToggle /> : null}
          </Sidebar.Header>
        </Panel>
        <Panel scrollbar="thin" padding="sm" flex={1}>
          <NavContent
            currentPage={currentPage}
            pages={pages}
            showBrand={false}
            onNavigate={handleNavigate}
            query={query}
            onQueryChange={setQuery}
            searchInputRef={desktopInputRef}
          />
        </Panel>
      </Sidebar.Root>

      {/* Mobile Backdrop Overlay */}
      {!sidebar.visuallyCollapsed && (
        <div
          className={mobileBackdropStyle.className}
          onClick={collapseMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar (overlay) */}
      <Sidebar.Root
        type="overlay"
        collapsedWidth={'0px'}
        variant="docked"
        className={mobileNavContainerStyle.className}
      >
        <Panel padding="sm" divider="bottom">
          <Sidebar.Header title={brandTitle(handleNavigate)}>
            <Button
              size="sm"
              variant="ghost"
              shape="round"
              onClick={collapseMobileSidebar}
              aria-label="Close navigation menu"
            >
              <CloseIcon />
            </Button>
          </Sidebar.Header>
        </Panel>
        <Panel scrollbar="thin" padding="sm" flex={1}>
          <NavContent
            currentPage={currentPage}
            pages={pages}
            showBrand={false}
            onNavigate={handleNavigate}
            query={query}
            onQueryChange={setQuery}
            searchInputRef={mobileInputRef}
          />
        </Panel>
      </Sidebar.Root>
    </>
  );
}
