import React from 'react';
import type { PageProps } from '@renr/parcel-rsc-router';
import {
  AppFrame,
  AppFrameMain,
  Panel,
  ThemeScript,
  vars,
  Container,
  SidebarProvider,
} from '@cumulo/core';
import { style } from '@cumulo/css';
import { SidebarNav } from './components/Nav';
import { AppProvider } from './appProvider';
import { DocHeader } from './components/DocHeader';
import './styles.css';

const bodyStyle = style(
  {
    margin: 0,
    minHeight: '100vh',
    backgroundColor: vars.surface.bg.DEFAULT,
    color: vars.surface.fg,
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

const builderWrapperStyle = style(
  {
    flex: 1,
    padding: vars.spacing.lg,
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    '@media': {
      '(max-width: 959px)': {
        padding: `${vars.spacing.md} ${vars.spacing.sm} 60px`,
      },
    },
  },
  'layout-builder-wrapper',
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
          <SidebarProvider hoverBehaviour="expand">
            <AppFrame>
              <SidebarNav currentPage={currentPage} />
              <AppFrameMain as="div">
                {/* Top Responsive Navigation Bar */}
                <DocHeader currentPage={currentPage} />

                {/* Main Content Area */}
                <Panel scrollbar="default" as="main">
                  {currentPage?.url === '/theme-builder.html' ? (
                    <div className={builderWrapperStyle.className}>{children}</div>
                  ) : (
                    <div className={contentWrapperStyle.className}>
                      <Container size="lg">{children}</Container>
                    </div>
                  )}
                </Panel>
              </AppFrameMain>
            </AppFrame>
          </SidebarProvider>
        </body>
      </AppProvider>
    </html>
  );
}
