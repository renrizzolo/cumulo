'use client';

import React, { useState, useEffect } from 'react';
import type { PageProps } from '@parcel/rsc';
import { style } from '@cumulo/css';
import { Link } from '@renr/parcel-rsc-router';
import { Surface, HStack, VStack, Button, Heading, Text, vars, useDismissible } from '@cumulo/core';
import { ThemeSwitcher } from './ThemeSwitcher';
import { NavContent } from './Nav';

const topHeaderStyle = style({
  padding: `${vars.spacing.sm} ${vars.spacing.xl}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: vars.surface.border,
  borderRadius: 0,
  minHeight: '3.5rem',
  boxSizing: 'border-box',
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

const desktopSpacerStyle = style({
  display: 'none',
  '@media': {
    '(min-width: 960px)': {
      display: 'block',
    },
  },
});

const mobileBrandLinkStyle = style({
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing['2xs'],
});

const backdropStyle = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(4px)',
  zIndex: 998,
  '@media': {
    '(min-width: 960px)': {
      display: 'none !important',
    },
  },
});

const drawerStyle = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  maxWidth: '100%',
  height: '100vh',
  zIndex: 999,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
  overflowY: 'auto',
  boxSizing: 'border-box',
  border: 'none',
  borderRadius: 0,
  boxShadow: 'none',
  '@media': {
    '(min-width: 960px)': {
      display: 'none !important',
    },
  },
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

export function DocHeader({
  currentPage,
}: {
  currentPage?: PageProps['currentPage'];
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  // Automatically close mobile menu when viewport expands to desktop
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 960px)');
    const handleViewportChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsOpen(false);
      }
    };
    mql.addEventListener('change', handleViewportChange);
    return () => mql.removeEventListener('change', handleViewportChange);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const dismissRef = useDismissible({
    onDismiss: () => setIsOpen(false),
    dismissOnClickOutside: true,
  });

  return (
    <>
      <div className={topHeaderStyle.className}>
        {/* Mobile Header Left: Hamburger & Brand */}
        <div className={mobileBrandGroupStyle.className}>
          <Button
            size="small"
            variant="ghost"
            shape="round"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
          >
            <MenuIcon />
          </Button>

          <Link to="/" className={mobileBrandLinkStyle.className}>
            <span>📦</span>
            <Heading as="h4" size="sm">
              Cumulo UI
            </Heading>
          </Link>
        </div>

        {/* Desktop Spacer */}
        <div className={desktopSpacerStyle.className} />

        {/* Header Right Controls */}
        <ThemeSwitcher />
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <>
          <div
            className={backdropStyle.className}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div ref={dismissRef}>
            <Surface level={2} padding="md" radius="none" className={drawerStyle.className}>
              {/* Drawer Header with Close Button */}
              <HStack justify="between" align="center">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className={mobileBrandLinkStyle.className}
                >
                  <HStack gap="xs" align="center">
                    <span style={{ fontSize: '20px' }}>📦</span>
                    <VStack gap="3xs">
                      <Heading as="h4" size="sm">
                        Cumulo UI
                      </Heading>
                      <Text type="caption" color="muted">
                        Design System
                      </Text>
                    </VStack>
                  </HStack>
                </Link>
                <Button
                  size="small"
                  variant="ghost"
                  shape="round"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <CloseIcon />
                </Button>
              </HStack>

              {/* Navigation Links */}
              <NavContent
                currentPage={currentPage}
                onNavigate={() => setIsOpen(false)}
                showBrand={false}
              />
            </Surface>
          </div>
        </>
      )}
    </>
  );
}
