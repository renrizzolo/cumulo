'use client';

import React, { useEffect } from 'react';
import { Link } from '@renr/parcel-rsc-router';
import { keyframes, style } from '@cumulo/css';
import { Button, vars, useDismissible, SidebarToggle, Tooltip, useSidebar } from '@cumulo/core';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Logo } from './Logo';

const topHeaderStyle = style({
  padding: vars.spacing.sm,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: vars.surface.bg.DEFAULT,
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: vars.surface.border,
  borderRadius: 0,
  zIndex: 10,
  '@media': {
    '(max-width: 768px)': {
      padding: `${vars.spacing.sm} ${vars.spacing.md}`,
    },
  },
});

const mobileBrandGroupStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  '@media': {
    '(min-width: 960px)': {
      display: 'none',
    },
  },
});

const desktopToggleStyle = style({
  display: 'none',
  alignItems: 'center',
  gap: vars.spacing.sm,
  '@media': {
    '(min-width: 960px)': {
      display: 'flex',
    },
  },
});

const mobileBrandLinkStyle = style({
  textDecoration: 'none',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
});

function MenuIcon(): React.JSX.Element {
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
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

const headerAnimation = keyframes({
  from: {
    opacity: 0,
    transform: `translateX(-${vars.spacing.md})`,
  },
  to: {
    opacity: 1,
    transform: 'translateX(0)',
  },
});

const headerBrandLinkStyle = style({
  textDecoration: 'none',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  animation: `${headerAnimation} ${vars.duration.slow} ${vars.ease.default}`,
});

export function DocHeader(): React.JSX.Element {
  const sidebar = useSidebar();
  const { setCollapsed } = sidebar;
  // Sync mobile responsive collapse state & viewport transitions
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 960px)');
    // If opening on mobile, initialize collapsed
    if (!mql.matches) {
      setCollapsed(true);
    }

    const handleViewportChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    };

    mql.addEventListener('change', handleViewportChange);
    return () => mql.removeEventListener('change', handleViewportChange);
  }, [setCollapsed]); // Run on mount and media query events only

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (window.innerWidth < 960 && !sidebar.collapsed) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [sidebar.collapsed]);

  useDismissible({
    onDismiss: () => {
      if (window.innerWidth < 960 && !sidebar.collapsed) {
        sidebar.setCollapsed(true);
      }
    },
    dismissOnClickOutside: false,
  });

  return (
    <div className={topHeaderStyle.className}>
      {/* Mobile Header Left: Hamburger & Brand */}
      <div className={mobileBrandGroupStyle.className}>
        <Button
          size="sm"
          variant="ghost"
          shape="round"
          data-sidebar-toggle="true"
          onClick={() => sidebar.toggleCollapsed()}
          aria-label={sidebar.collapsed ? 'Open navigation menu' : 'Close navigation menu'}
          aria-expanded={!sidebar.collapsed}
        >
          <MenuIcon />
        </Button>

        <Link to="/" className={mobileBrandLinkStyle.className}>
          <Logo size="lg" />
        </Link>
      </div>

      {/* Desktop Sidebar Toggle & Brand (when collapsed) */}
      <div className={desktopToggleStyle.className}>
        <Tooltip.Root>
          <Tooltip.Trigger as={'span'}>
            <SidebarToggle />
          </Tooltip.Trigger>
          <Tooltip.Content placement="right">Toggle navigation</Tooltip.Content>
        </Tooltip.Root>
        {sidebar.visuallyCollapsed ? (
          <Link to="/" className={headerBrandLinkStyle.className}>
            <Logo />
          </Link>
        ) : null}
      </div>

      {/* Header Right Controls */}
      <ThemeSwitcher />
    </div>
  );
}
