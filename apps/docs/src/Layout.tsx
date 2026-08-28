import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { ThemeScript, Surface, Container } from '@cumulo/core';
import { Nav } from './components/Nav.js';
import { AppProvider } from './appProvider.js';
import { ThemeSwitcher } from './components/ThemeSwitcher.js';
import './client.js';
import './styles.css';

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
        <ThemeScript />
      </head>

      <AppProvider>
        <body style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
          <Surface
            level={0}
            style={{
              display: 'flex',
              minHeight: '100vh',
              width: '100%',
              borderRadius: 0,
              borderWidth: 0,
            }}
          >
            <Nav currentPage={currentPage} />
            <main
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <Surface
                level={0}
                style={{
                  padding: '16px 32px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: 0,
                }}
              >
                <ThemeSwitcher />
              </Surface>
              <Container size="xl" padding="lg" style={{ paddingBottom: '80px' }}>
                {children}
              </Container>
            </main>
          </Surface>
        </body>
      </AppProvider>
    </html>
  );
}
