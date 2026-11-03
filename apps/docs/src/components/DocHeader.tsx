'use client';

import React, { useEffect } from 'react';
import { Link } from '@renr/parcel-rsc-router';
import { keyframes, style } from '@cumulo/css';
import { Button, vars, useDismissible, Sidebar, Tooltip, useSidebar } from '@cumulo/core';
import { useMobileNav } from './MobileNavContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Logo } from './Logo';

const topHeaderStyle = style({
  position: 'sticky',
  top: 0,
  zIndex: 20,
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
  const { isOpen: isMobileOpen, toggle: toggleMobileNav, close: closeMobileNav } = useMobileNav();

  // Close mobile drawer when resizing across desktop breakpoint
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 960px)');
    const handleViewportChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        closeMobileNav();
      }
    };

    mql.addEventListener('change', handleViewportChange);
    return () => mql.removeEventListener('change', handleViewportChange);
  }, [closeMobileNav]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobileOpen]);

  useDismissible({
    onDismiss: () => {
      if (isMobileOpen) {
        closeMobileNav();
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
          onClick={toggleMobileNav}
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileOpen}
        >
          <MenuIcon />
        </Button>

        <Link to="/" className={mobileBrandLinkStyle.className}>
          <Logo size="lg" />
        </Link>
      </div>

      {/* Desktop Sidebar Toggle & Brand (when collapsed) */}
      <div className={desktopToggleStyle.className}>
        {sidebar.visuallyCollapsed ? (
          <>
            <Tooltip.Root>
              <Tooltip.Trigger as={'span'}>
                <Sidebar.Toggle />
              </Tooltip.Trigger>
              <Tooltip.Content placement="right">Toggle navigation</Tooltip.Content>
            </Tooltip.Root>
            <Link to="/" className={headerBrandLinkStyle.className}>
              <Logo />
            </Link>
          </>
        ) : null}
      </div>

      {/* Header Right Controls */}
      <ThemeSwitcher />
    </div>
  );
}
