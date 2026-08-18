import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { Link } from '@renr/parcel-rsc-router';
import { flatRoutes } from '../../routes.js';

export function Nav({ currentPage }: { currentPage?: PageProps['currentPage'] }) {
  return (
    <aside className="docs-sidebar">
      <Link to="/" className="docs-brand">
        <span style={{ fontSize: '24px' }}>☁️</span>
        <span>Cumulo UI</span>
      </Link>

      <nav className="docs-nav">
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--docs-muted)',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}
        >
          Documentation
        </div>
        {flatRoutes.map((route) => {
          const isActive = currentPage?.url === route.html;
          const label =
            route.slug === 'index'
              ? 'Overview'
              : route.slug === 'css'
                ? '@cumulo/css Engine'
                : '@cumulo/core Tokens';
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`docs-nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--docs-muted)' }}>
        <div>Cumulo Monorepo</div>
        <div>v0.1.0 • Zero Deps</div>
      </div>
    </aside>
  );
}
