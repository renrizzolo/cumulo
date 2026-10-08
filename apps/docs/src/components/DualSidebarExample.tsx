'use client';

import React, { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  Panel,
  SideNav,
  SideNavItem,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
} from '@cumulo/core';

export function DualSidebarExample(): React.JSX.Element {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <HStack align="stretch" width="full" style={{ position: 'relative', minHeight: 250 }}>
      {/* Container coordinating hover and focus across both tiers */}

      {/* Tier 1: Permanent Slim Primary Rail */}
      <Sidebar
        variant="docked"
        defaultCollapsed
        hoverBehaviour="tooltip"
        width="var(--theme-size-lg)"
        collapsedWidth="var(--theme-size-lg)"
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsHovered(false);
          }
        }}
        style={{ height: 'auto' }}
      >
        <Panel padding="xs" style={{ alignItems: 'center' }}>
          <SideNav aria-label="Primary rail">
            <SideNavItem
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
              }
              label="Dashboard"
              active
            />
            <SideNavItem
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
              label="Issues"
            />
            <SideNavItem
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              }
              label="Settings"
            />
          </SideNav>
        </Panel>
      </Sidebar>

      {/* Tier 2: Secondary Contextual Sidebar (Overlay or Push depending on Pin state) */}
      <Sidebar
        hoverBehaviour="expand"
        type={isPinned ? 'push' : 'overlay'}
        variant="docked"
        collapsed={isPinned ? false : !isHovered}
        width="200px"
        collapsedWidth="0px"
        style={isPinned ? undefined : { left: '48px' }}
      >
        <Panel padding="sm" divider="bottom">
          <SidebarHeader
            title={
              <Heading as="h4" size="sm">
                Issues
              </Heading>
            }
          >
            <Button
              size="xs"
              variant={isPinned ? 'primary' : 'ghost'}
              onClick={() => setIsPinned((prev) => !prev)}
              aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={isPinned ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="17" x2="12" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.76V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.76a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24Z" />
              </svg>
            </Button>
          </SidebarHeader>
        </Panel>
        <Panel scrollbar="thin" padding="sm">
          <SideNav aria-label="Secondary navigation">
            <SideNavItem label="All Issues" active />
            <SideNavItem label="Assigned to Me" />
            <SideNavItem label="Bookmarked" />
            <SideNavItem label="History" />
          </SideNav>
        </Panel>
      </Sidebar>

      {/* Main Content Area */}
      <Panel flex={1} padding="md" scrollbar="thin">
        <VStack gap="sm">
          <Heading as="h4" size="md">
            Dashboard Content
          </Heading>
          <Text size="sm">
            Mode: <strong>{isPinned ? 'Pinned (Push)' : 'Unpinned (Overlay)'}</strong>
          </Text>
          <Text size="sm" color="subtle">
            {isPinned
              ? 'The secondary sidebar is pinned in layout flow, pushing page content.'
              : 'Hover or focus rail items to expand the secondary overlay sidebar without shifting layout.'}
          </Text>
        </VStack>
      </Panel>
    </HStack>
  );
}
