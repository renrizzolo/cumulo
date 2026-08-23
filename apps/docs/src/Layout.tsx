import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { ThemeScript } from '@cumulo/core';
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
}) {
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
        <body>
          <div className="docs-shell">
            <Nav currentPage={currentPage} />
            <main className="docs-main">
              <div className="docs-header">
                <ThemeSwitcher />
              </div>
              {children}
            </main>
          </div>
        </body>
      </AppProvider>
    </html>
  );
}
