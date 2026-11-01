'use client';

import { ButtonGroup, Collapsible, HStack, Panel, Surface, Text, vars, VStack } from '@cumulo/core';
import { style } from '@cumulo/css';
import React, { useState } from 'react';

export interface ComponentPreviewClientProps {
  title?: string;
  description?: string;
  frame?: boolean;
  code: React.ReactNode;
  defaultLevel?: 0 | 1 | 2;
  children: React.ReactNode;
}

const previewCanvasStyle = style(
  {
    minHeight: '160px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: `${vars.spacing['2xl']} ${vars.spacing.xl}`,
    resize: 'horizontal',
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
    overflow: 'auto',
    position: 'relative',
    '::before': {
      content: "''",
      position: 'absolute',
      bottom: vars.spacing['2xs'],
      right: vars.spacing['2xs'],
      width: vars.size['4xs'],
      height: vars.size['4xs'],
      backgroundColor: vars.surface.secondary.border,
      borderColor: vars.surface.border,
      borderWidth: 1,
      borderTopLeftRadius: vars.size.xs,
      borderBottomRightRadius: vars.spacing.xs,
      cornerShape: 'round',
      opacity: 0,
      pointerEvents: 'none',
      transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
    },
    selectors: {
      '&::-webkit-resizer': {
        appearance: 'none',
        backgroundColor: 'transparent',
      },
      '&:hover::before': {
        opacity: 1,
      },
      '&:active::before': {
        opacity: 1,
      },
    },
  },
  'canvas',
);

const toolbarFooterStyle = style({
  paddingTop: vars.spacing.md,
  gap: vars.spacing.sm,
});

const codeInnerStyleOffset = style({
  marginTop: vars.spacing.md,
  display: 'block',
  width: '100%',
  minWidth: 0,
});

const SurfaceLevelGroup = ButtonGroup.create<'0' | '1' | '2'>();
const LEVEL_TO_VALUE: Record<0 | 1 | 2, '0' | '1' | '2'> = { 0: '0', 1: '1', 2: '2' };
const VALUE_TO_LEVEL: Record<'0' | '1' | '2', 0 | 1 | 2> = { '0': 0, '1': 1, '2': 2 };

export function ComponentPreviewClient({
  title,
  code,
  defaultLevel = 0,
  frame,
  children,
}: ComponentPreviewClientProps): React.JSX.Element {
  const [level, setLevel] = useState<0 | 1 | 2>(defaultLevel);
  const [showCode, setShowCode] = useState(false);

  return (
    <>
      <Surface level={0} overflow="hidden" padding="lg" radius="2xl">
        {/* Preview Canvas Area */}
        <VStack gap="md">
          {title ? <Text type="body">{title}</Text> : null}

          <Surface
            level={level}
            flex={1}
            bordered={false}
            radius="lg"
            padding="md"
            className={previewCanvasStyle.className}
          >
            {frame ? (
              <Panel flex={1} width="full" divider>
                {children}
              </Panel>
            ) : (
              children
            )}
          </Surface>

          <Collapsible.Root open={showCode} onOpenChange={setShowCode}>
            {/* Toolbar Controls */}
            <HStack
              wrap="wrap"
              justify="between"
              align="center"
              className={toolbarFooterStyle.className}
            >
              {/* Surface Level Switcher */}
              <HStack gap="xs" align="center">
                <Text type="label" size="xs" color="muted">
                  Surface:
                </Text>
                <SurfaceLevelGroup.Root
                  value={LEVEL_TO_VALUE[level]}
                  onValueChange={(val) => setLevel(VALUE_TO_LEVEL[val])}
                  size="xs"
                >
                  <SurfaceLevelGroup.Item value="0">Canvas</SurfaceLevelGroup.Item>
                  <SurfaceLevelGroup.Item value="1">Surface</SurfaceLevelGroup.Item>
                  <SurfaceLevelGroup.Item value="2">Elevated</SurfaceLevelGroup.Item>
                </SurfaceLevelGroup.Root>
              </HStack>

              {/* Code Actions */}
              <HStack gap="2xs" align="center">
                <Collapsible.Trigger size="xs" variant={showCode ? 'secondary' : 'ghost'}>
                  {showCode ? 'Hide Code' : 'View Code'}
                </Collapsible.Trigger>
              </HStack>
            </HStack>

            {/* Animated Code Panel */}
            <Collapsible.Content>
              <div className={codeInnerStyleOffset.className}>{code}</div>
            </Collapsible.Content>
          </Collapsible.Root>
        </VStack>
      </Surface>
    </>
  );
}
