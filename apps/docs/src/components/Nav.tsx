'use client';

import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  Divider,
  Kbd,
} from '@cumulo/core';
import { Version } from './Version';
import { Logo } from './Logo';
import { useMobileNav } from './MobileNavContext';

interface NavItem {
  label: string;
  path: RoutePath;
  htmlPath: RouteHtml;
  badge?: string;
  keywords?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const desktopNavContainerStyle = style(
  {
    selectors: {
      '&&': {
        position: 'sticky',
        top: 0,
        height: '100dvh',
        alignSelf: 'flex-start',
      },
    },
    '@media': {
      '(max-width: 959px)': {
        display: 'none !important',
      },
    },
  },
  'desktop-nav',
);

const mobileNavContainerStyle = style({
  selectors: {
    '&[data-visually-collapsed="true"]': {
      visibility: 'hidden',
      pointerEvents: 'none',
    },
  },
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
  flexShrink: 0,
  whiteSpace: 'nowrap',
  minWidth: 0,
});

const searchStickyWrapperStyle = style({
  position: 'sticky',
  top: `calc(-1 * ${vars.spacing.sm})`,
  zIndex: 2,
  backgroundColor: vars.surface.bg.DEFAULT,
  marginTop: `calc(-1 * ${vars.spacing.sm})`,
  paddingTop: vars.spacing.sm,
  paddingBottom: vars.spacing.md,
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

const searchKbdStyle = style({
  pointerEvents: 'none',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-input-wrapper="true"]:focus-within &': {
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

const DOC_SECTIONS: NavSection[] = [
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
        label: 'Bundler Setup',
        path: '/bundlers',
        htmlPath: '/bundlers.html',
        badge: 'Required',
        keywords: [
          'bundler',
          'vite',
          'webpack',
          'nextjs',
          'next',
          'rollup',
          'esbuild',
          'parcel',
          'unplugin',
          'plugin',
          'css extraction',
        ],
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

const COMPONENT_SECTIONS: NavSection[] = [
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
        label: 'DescriptionList',
        path: '/components/description-list',
        htmlPath: '/components/description-list.html',
        keywords: ['dl', 'dt', 'dd', 'description list', 'definition list', 'term', 'layout'],
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
        label: 'Grid',
        path: '/components/grid',
        htmlPath: '/components/grid.html',
        keywords: ['css grid', 'columns', 'rows', 'colspan', 'auto-fit', 'layout'],
      },
      {
        label: 'List',
        path: '/components/list',
        htmlPath: '/components/list.html',
        keywords: ['bullet', 'ordered', 'unordered', 'icon list', 'item', 'marker', 'layout'],
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
        label: 'Link',
        path: '/components/link',
        htmlPath: '/components/link.html',
        keywords: ['anchor', 'href', 'url', 'external', 'navigation'],
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
        keywords: ['radiogroup', 'option', 'single-select', 'choice', 'form'],
      },
      {
        label: 'Select',
        path: '/components/select',
        htmlPath: '/components/select.html',
        keywords: ['dropdown', 'option', 'picker', 'choice', 'form'],
      },
      {
        label: 'Slider',
        path: '/components/slider',
        htmlPath: '/components/slider.html',
        keywords: ['range', 'volume', 'scrubber', 'track', 'thumb', 'form'],
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
        label: 'Alert',
        path: '/components/alert',
        htmlPath: '/components/alert.html',
        keywords: ['banner', 'callout', 'notice', 'warning', 'error', 'status', 'feedback'],
      },
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
        label: 'Spinner',
        path: '/components/spinner',
        htmlPath: '/components/spinner.html',
        keywords: ['loading', 'progress', 'indicator', 'busy', 'wait'],
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
        label: 'Kbd',
        path: '/components/kbd',
        htmlPath: '/components/kbd.html',
        keywords: ['keyboard', 'shortcut', 'hotkey', 'keycap', 'command'],
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
        label: 'Menu',
        path: '/components/menu',
        htmlPath: '/components/menu.html',
        keywords: ['dropdown', 'actions', 'context', 'menuitem', 'popover', 'overlay'],
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

interface DocNavState {
  query: string;
  isFiltering: boolean;
  filteredDocSections: NavSection[];
  filteredComponentSections: NavSection[];
  totalMatches: number;
}

interface DocNavActions {
  setQuery: (query: string) => void;
  onNavigate: () => void;
  isItemActive: (item: NavItem) => boolean;
}

interface DocNavMeta {
  desktopInputRef: React.RefObject<HTMLInputElement | null>;
  mobileInputRef: React.RefObject<HTMLInputElement | null>;
}

interface DocNavContextValue {
  state: DocNavState;
  actions: DocNavActions;
  meta: DocNavMeta;
}

const DocNavContext = createContext<DocNavContextValue | null>(null);

function useDocNav(): DocNavContextValue {
  const context = use(DocNavContext);
  if (!context) {
    throw new Error('useDocNav must be used within a DocNavProvider');
  }
  return context;
}

interface DocNavProviderProps {
  currentPage?: PageProps['currentPage'];
  children: React.ReactNode;
}

function DocNavProvider({ currentPage, children }: DocNavProviderProps): React.JSX.Element {
  const sidebar = useSidebar();
  const { close: closeMobileNav, open: openMobileNav } = useMobileNav();
  const [query, setQuery] = useState('');
  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const prevUrlRef = useRef(currentPage?.url);

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0;

  const currentUrl = currentPage?.url || '';
  const currentPath = currentPage?.url ? routesByPage[currentPage.url]?.path : undefined;

  const isItemActive = useCallback(
    (item: NavItem): boolean => currentPath === item.path || currentUrl === item.htmlPath,
    [currentPath, currentUrl],
  );

  const onNavigate = useCallback((): void => {
    setQuery('');
    closeMobileNav();
  }, [closeMobileNav]);

  // Reset filter and close mobile drawer when route changes via page links or history
  useEffect(() => {
    if (prevUrlRef.current !== currentPage?.url) {
      prevUrlRef.current = currentPage?.url;
      setQuery('');
      closeMobileNav();
    }
  }, [currentPage?.url, closeMobileNav]);

  // Global '/' or 'Ctrl+K' shortcut to focus the component filter (and open sidebar if closed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.defaultPrevented || e.metaKey || e.altKey) return;
      if ((e.key === '/' && !e.ctrlKey) || (e.key === 'k' && e.ctrlKey)) {
        if (e.key === '/') {
          if (isEditableElement(e.target) || isEditableElement(document.activeElement)) return;
        }

        e.preventDefault();

        const isMobile = window.innerWidth < 960;
        if (isMobile) {
          openMobileNav();
          requestAnimationFrame(() => {
            mobileInputRef.current?.focus();
            mobileInputRef.current?.select();
          });
        } else {
          const wasCollapsed = sidebar.collapsed || sidebar.visuallyCollapsed;

          if (sidebar.collapsed) {
            sidebar.setCollapsed(false);
          }

          desktopInputRef.current?.focus();
          desktopInputRef.current?.select();

          if (wasCollapsed) {
            requestAnimationFrame(() => {
              desktopInputRef.current?.focus();
              desktopInputRef.current?.select();
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebar, openMobileNav]);

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
      items: section.items.filter((item) => matchesItem(item, section.title, normalizedQuery)),
    })).filter((section) => section.items.length > 0);
  }, [isFiltering, normalizedQuery]);

  const totalMatches = useMemo((): number => {
    const componentCount = filteredComponentSections.reduce((acc, s) => acc + s.items.length, 0);
    const docCount = filteredDocSections.reduce((acc, s) => acc + s.items.length, 0);
    return componentCount + docCount;
  }, [filteredComponentSections, filteredDocSections]);

  const contextValue = useMemo(
    (): DocNavContextValue => ({
      state: {
        query,
        isFiltering,
        filteredDocSections,
        filteredComponentSections,
        totalMatches,
      },
      actions: {
        setQuery,
        onNavigate,
        isItemActive,
      },
      meta: {
        desktopInputRef,
        mobileInputRef,
      },
    }),
    [
      query,
      isFiltering,
      filteredDocSections,
      filteredComponentSections,
      totalMatches,
      onNavigate,
      isItemActive,
    ],
  );

  return <DocNavContext value={contextValue}>{children}</DocNavContext>;
}

function NavBrand(): React.JSX.Element {
  const { actions } = useDocNav();
  return (
    <HStack gap="xs" align="center">
      <Link to="/" onClick={actions.onNavigate} className={brandLinkStyle.className}>
        <Logo />
      </Link>
      <Badge variant="secondary" size="2xs">
        <Version />
      </Badge>
    </HStack>
  );
}

interface NavPaneContentProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function NavPaneContent({ inputRef }: NavPaneContentProps): React.JSX.Element {
  const sidebar = useSidebar();
  const { state, actions } = useDocNav();
  const { query, isFiltering, filteredComponentSections, filteredDocSections, totalMatches } =
    state;
  const { setQuery, onNavigate, isItemActive } = actions;
  const navRef = useRef<HTMLElement | null>(null);

  const getNavLinks = (): HTMLAnchorElement[] => {
    if (!navRef.current) return [];
    return Array.from(navRef.current.querySelectorAll<HTMLAnchorElement>('a[href]'));
  };

  const handleClear = (): void => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
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

  const handleNavKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
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

  const renderSection = (section: NavSection): React.JSX.Element => (
    <SideNav.Group key={section.title} title={section.title}>
      {section.items.map((item) => (
        <SideNav.Item
          key={item.path}
          as={Link}
          to={item.path}
          onClick={onNavigate}
          active={isItemActive(item)}
          label={item.label}
          badge={item.badge ? <Badge variant="outline">{item.badge}</Badge> : undefined}
        />
      ))}
    </SideNav.Group>
  );

  return (
    <>
      {/* Pinned Search Filter */}
      <div className={searchStickyWrapperStyle.className}>
        <Field.Root gap="none">
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
            leading={<SearchIcon />}
            trailing={
              query.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear filter"
                  className={clearButtonStyle.className}
                >
                  <ClearIcon />
                </button>
              ) : (
                <Kbd size="xs" className={searchKbdStyle.className} aria-hidden="true">
                  /
                </Kbd>
              )
            }
          />
        </Field.Root>
      </div>

      {/* Navigation Sections */}
      {isFiltering && totalMatches === 0 ? (
        <VStack gap="sm" align="center" className={emptyStateStyle.className}>
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
              <Divider />
              {COMPONENT_SECTIONS.map(renderSection)}
            </>
          )}
        </SideNav.Root>
      )}
    </>
  );
}

function DesktopSidebarNav(): React.JSX.Element {
  const sidebar = useSidebar();
  const { meta } = useDocNav();

  return (
    <Sidebar.Root
      collapsedWidth={'0px'}
      variant="docked"
      level={1}
      className={desktopNavContainerStyle.className}
    >
      <Panel padding="sm" divider="bottom">
        <Sidebar.Header title={<NavBrand />}>
          {!sidebar.visuallyCollapsed ? <SidebarNavToggle /> : null}
        </Sidebar.Header>
      </Panel>
      <Panel scrollbar="thin" padding="sm" flex={1}>
        <NavPaneContent inputRef={meta.desktopInputRef} />
      </Panel>
    </Sidebar.Root>
  );
}

function MobileSidebarNav(): React.JSX.Element {
  const { isOpen: isMobileOpen, close: closeMobileNav, open: openMobileNav } = useMobileNav();
  const { meta } = useDocNav();

  return (
    <>
      {isMobileOpen && (
        <div
          className={mobileBackdropStyle.className}
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}
      <Sidebar.Provider
        type="overlay"
        variant="docked"
        collapsed={!isMobileOpen}
        onCollapsedChange={(collapsed) => {
          if (collapsed) {
            closeMobileNav();
          } else {
            openMobileNav();
          }
        }}
      >
        <Sidebar.Root
          type="overlay"
          collapsedWidth={'0px'}
          variant="docked"
          className={mobileNavContainerStyle.className}
        >
          <Panel padding="sm" divider="bottom">
            <Sidebar.Header title={<NavBrand />}>
              <Button
                size="sm"
                variant="ghost"
                shape="round"
                onClick={closeMobileNav}
                aria-label="Close navigation menu"
              >
                <CloseIcon />
              </Button>
            </Sidebar.Header>
          </Panel>
          <Panel scrollbar="thin" padding="sm" flex={1}>
            <NavPaneContent inputRef={meta.mobileInputRef} />
          </Panel>
        </Sidebar.Root>
      </Sidebar.Provider>
    </>
  );
}

interface NavProps {
  currentPage?: PageProps['currentPage'];
}

export function SidebarNav({ currentPage }: NavProps): React.JSX.Element {
  return (
    <DocNavProvider currentPage={currentPage}>
      <DesktopSidebarNav />
      <MobileSidebarNav />
    </DocNavProvider>
  );
}
