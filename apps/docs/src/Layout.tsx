import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { HStack, VStack, ThemeScript, vars, Container } from '@cumulo/core';
import { style } from '@cumulo/css';
import { Nav } from './components/Nav';
import { AppProvider } from './appProvider';
import { DocHeader } from './components/DocHeader';
import './styles.css';

const bodyStyle = style(
  {
    margin: 0,
    padding: vars.spacing.md,
    minHeight: '100vh',
    backgroundColor: vars.surface.bg.DEFAULT,
    color: vars.surface.fg,
    '@media': {
      '(max-width: 768px)': {
        padding: 0,
      },
    },
  },
  'layout-body',
);

const contentWrapperStyle = style(
  {
    flex: 1,
    padding: `${vars.spacing['2xl']} ${vars.spacing['2xl']} 120px`,
    boxSizing: 'border-box',
    '@media': {
      '(max-width: 1200px)': {
        padding: `${vars.spacing.lg} ${vars.spacing.md} 80px`,
      },
      '(max-width: 768px)': {
        padding: `${vars.spacing.lg} ${vars.spacing.md} 80px`,
      },
    },
  },
  'layout-content-wrapper',
);

const navAsideStyle = style(
  {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    '@media': {
      '(max-width: 959px)': {
        display: 'none !important',
      },
    },
  },
  'layout-nav-aside',
);

export default function Layout({
  children,
  title,
  currentPage,
}: {
  children: React.ReactNode;
  title?: string;
  currentPage?: PageProps['currentPage'];
}): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>
          {title ? `${title} • Cumulo UI` : 'Cumulo UI — Dependency Free Design System'}
        </title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta
          name="description"
          content="Cumulo UI — Dependency Free React 19 Component Library & CSS Engine"
        />
        <ThemeScript defaultTheme="docs" />
      </head>

      <AppProvider>
        <body className={bodyStyle.className}>
          <HStack align="stretch" flex="auto" gap="lg">
            <aside className={navAsideStyle.className}>
              <Nav currentPage={currentPage} />
            </aside>
            <VStack flex="auto">
              {/* Top Responsive Navigation Bar */}
              <DocHeader currentPage={currentPage} />

              {/* Main Content Area */}
              <main className={contentWrapperStyle.className}>
                <Container size="xl">{children}</Container>
              </main>
            </VStack>
          </HStack>
        </body>
      </AppProvider>
    </html>
  );
}
