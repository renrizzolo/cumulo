import React from 'react';
import type { PageProps } from '@renr/parcel-rsc-router';
import { Panel, ThemeScript, vars, Container } from '@cumulo/core';
import * as AppFrame from '@cumulo/core/components/AppFrame';
import * as Sidebar from '@cumulo/core/components/Sidebar';
import { style } from '@cumulo/css';
import { SidebarNav } from './components/Nav';
import { AppProvider } from './appProvider';
import { DocHeader } from './components/DocHeader';
import { MobileNavProvider } from './components/MobileNavContext';
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

const mainStyle = style(
  {
    background: 'linear-gradient(20deg, #fff56e19, transparent 140px)',
  },
  'layout-main',
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
        padding: `${vars.spacing.lg} 0 80px`,
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

const frameRestrictedStyle = style(
  {
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%',
    minHeight: '100dvh',
    borderInline: `1px solid ${vars.border}`,
  },
  'layout-frame-restricted',
);

const frameFullStyle = style(
  {
    width: '100%',
    minHeight: '100dvh',
  },
  'layout-frame-full',
);

const docsHoverZoneRestrictedStyle = style(
  {
    width: `calc(max(0px, (100vw - 1440px) / 2) + ${vars.spacing.md})`,
    zIndex: 0,
    '@media': {
      '(max-width: 959px)': {
        display: 'none !important',
      },
    },
  },
  'docs-hover-zone-restricted',
);

const docsHoverZoneFullStyle = style(
  {
    width: vars.spacing.md,
    zIndex: 0,
    '@media': {
      '(max-width: 959px)': {
        display: 'none !important',
      },
    },
  },
  'docs-hover-zone-full',
);

export type DocsLayoutMode = 'restricted' | 'full';

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  currentPage?: PageProps['currentPage'];
  layout?: DocsLayoutMode;
}

export default function Layout({
  children,
  title,
  currentPage,
  layout,
}: LayoutProps): React.JSX.Element {
  const isFullWidth = layout === 'full' || currentPage?.url === '/theme-builder.html';

  return (
    <html lang="en" data-theme="docs" suppressHydrationWarning>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&family=Inter:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        />
        <ThemeScript defaultTheme="docs" />
      </head>

      <body className={bodyStyle.className}>
        <AppProvider>
          <MobileNavProvider>
            <Sidebar.Provider hoverBehaviour="expand" hoverLeaveDelay={150}>
              <Sidebar.HoverZone
                className={
                  isFullWidth
                    ? docsHoverZoneFullStyle.className
                    : docsHoverZoneRestrictedStyle.className
                }
              />
              <AppFrame.Root
                height="auto"
                className={isFullWidth ? frameFullStyle.className : frameRestrictedStyle.className}
              >
                <SidebarNav currentPage={currentPage} />
                <AppFrame.Main as="div">
                  {/* Top Responsive Navigation Bar */}
                  <DocHeader />

                  {/* Main Content Area */}
                  <Panel as="main" flex="auto" className={mainStyle.className}>
                    {isFullWidth ? (
                      <div className={builderWrapperStyle.className}>{children}</div>
                    ) : (
                      <div className={contentWrapperStyle.className}>
                        <Container
                          // prose pages (overview etc.) have a smaller width than component docs
                          size={currentPage?.url.startsWith('/components/') ? 'lg' : 'md'}
                        >
                          {children}
                        </Container>
                      </div>
                    )}
                  </Panel>
                </AppFrame.Main>
              </AppFrame.Root>
            </Sidebar.Provider>
          </MobileNavProvider>
        </AppProvider>
      </body>
    </html>
  );
}
