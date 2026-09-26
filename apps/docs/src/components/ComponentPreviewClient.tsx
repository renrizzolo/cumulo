'use client';

import {
  Button,
  ButtonGroup,
  Collapsible,
  HStack,
  Surface,
  Text,
  vars,
  VStack,
} from '@cumulo/core';
import { style } from '@cumulo/css';
import React, { useCallback, useState } from 'react';

export interface ComponentPreviewClientProps {
  title?: string;
  description?: string;
  code: React.ReactNode;
  codeString: string;
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

const codeInnerStyleOffset = style({ marginTop: vars.spacing.md });

export function ComponentPreviewClient({
  title,
  code,
  codeString,
  defaultLevel = 0,
  children,
}: ComponentPreviewClientProps): React.JSX.Element {
  const [level, setLevel] = useState<0 | 1 | 2>(defaultLevel);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!codeString) return;
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [codeString]);

  return (
    <>
      <Surface level={0} overflow="hidden" padding="md" radius="2xl">
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
            {children}
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
                <ButtonGroup.Root
                  value={String(level)}
                  onValueChange={(val) => setLevel(Number(val) as 0 | 1 | 2)}
                  size="xs"
                >
                  <ButtonGroup.Item value="0">Canvas</ButtonGroup.Item>
                  <ButtonGroup.Item value="1">Surface</ButtonGroup.Item>
                  <ButtonGroup.Item value="2">Elevated</ButtonGroup.Item>
                </ButtonGroup.Root>
              </HStack>

              {/* Code Actions */}
              <HStack gap="2xs" align="center">
                {showCode && (
                  <Button size="xs" variant="ghost" onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
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
