import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { HStack, VStack, ThemeScript, vars, Container } from '@cumulo/core';
import { style } from '@cumulo/css';
import { Nav } from './components/Nav';
import { AppProvider } from './appProvider';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import './styles.css';

const bodyStyle = style(
  {
    margin: 0,
    padding: vars.spacing.md,
    minHeight: '100vh',
    backgroundColor: vars.surface.bg.DEFAULT,
    color: vars.surface.fg,
  },
  'layout-body',
);

const topHeaderStyle = style(
  {
    padding: `${vars.spacing.md} ${vars.spacing['2xl']}`,
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: vars.surface.border,
    borderRadius: 0,
  },
  'layout-top-header',
);

const contentWrapperStyle = style(
  {
    flex: 1,
    padding: `${vars.spacing['2xl']} ${vars.spacing['2xl']} 120px`,
    boxSizing: 'border-box',
  },
  'layout-content-wrapper',
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ThemeScript defaultTheme="docs" />
      </head>

      <AppProvider>
        <body className={bodyStyle.className}>
          <HStack align="stretch" flex="auto" gap="lg">
            <Nav currentPage={currentPage} />
            <VStack flex="auto">
              {/* Top Navigation Bar */}
              <div className={topHeaderStyle.className}>
                <ThemeSwitcher />
              </div>

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
