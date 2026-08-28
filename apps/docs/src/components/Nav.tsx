import React from 'react';
import type { PageProps } from '@parcel/rsc';
import { Link } from '@renr/parcel-rsc-router';
import { Surface, VStack, HStack, Heading, Text, Badge, Divider } from '@cumulo/core';
import { flatRoutes } from '../../routes.js';

export function Nav({
  currentPage,
}: {
  currentPage?: PageProps['currentPage'];
}): React.JSX.Element {
  return (
    <Surface
      level={1}
      style={{
        width: '260px',
        minWidth: '260px',
        minHeight: '100vh',
        borderRadius: 0,
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Header */}
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <HStack gap="sm" align="center">
          <span style={{ fontSize: '24px' }}>📦</span>
          <VStack gap="3xs">
            <Heading as="h3" size="lg">
              Cumulo UI
            </Heading>
            <Text type="caption" color="muted">
              Design System & Engine
            </Text>
          </VStack>
        </HStack>
      </Link>

      <Divider orientation="horizontal" />

      {/* Navigation Sections */}
      <VStack gap="sm">
        <Text
          type="label"
          size="xs"
          color="muted"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingLeft: '8px',
          }}
        >
          Documentation
        </Text>

        <VStack gap="2xs">
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--theme-radius-md, 6px)',
                  color: isActive ? 'var(--theme-primary, #6366f1)' : 'var(--surface-fg)',
                  backgroundColor: isActive ? 'var(--surface-bg-next)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
              >
                <span>{label}</span>
                {isActive && (
                  <Badge variant="primary" intent="primary" size="small">
                    Active
                  </Badge>
                )}
              </Link>
            );
          })}
        </VStack>
      </VStack>

      {/* Footer Info */}
      <VStack gap="3xs" style={{ marginTop: 'auto', paddingLeft: '8px' }}>
        <Text type="caption" color="muted">
          Cumulo Monorepo
        </Text>
        <Text type="caption" color="muted">
          v0.1.0 • Pure React 19
        </Text>
      </VStack>
    </Surface>
  );
}

export default Nav;
