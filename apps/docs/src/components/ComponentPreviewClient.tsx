'use client';

import React, { useState, useCallback } from 'react';
import { style } from '@cumulo/css';
import { Surface, HStack, VStack, Button, Heading, Text, Collapsible, vars } from '@cumulo/core';

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
  description,
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
      {(title || description) && (
        <VStack gap="3xs">
          {title && (
            <Heading as="h3" size="md" weight="semibold" color="muted">
              {title}
            </Heading>
          )}
          {description && (
            <Text type="body" color="muted">
              {description}
            </Text>
          )}
        </VStack>
      )}

      <Surface level={0} overflow="hidden" padding="md" radius="2xl">
        {/* Preview Canvas Area */}
        <Surface
          level={level}
          flex={1}
          radius="lg"
          padding="lg"
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
              <HStack gap="3xs" align="center">
                {([0, 1, 2] as const).map((lvl) => (
                  <Button
                    key={lvl}
                    size="xSmall"
                    variant={level === lvl ? 'primary' : 'ghost'}
                    onClick={() => setLevel(lvl)}
                  >
                    {lvl === 0 ? 'Canvas' : lvl === 1 ? 'Surface' : 'Elevated'}
                  </Button>
                ))}
              </HStack>
            </HStack>

            {/* Code Actions */}
            <HStack gap="2xs" align="center">
              {showCode && (
                <Button size="xSmall" variant="ghost" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
              <Collapsible.Trigger size="xSmall" variant={showCode ? 'secondary' : 'ghost'}>
                {showCode ? 'Hide Code' : 'View Code'}
              </Collapsible.Trigger>
            </HStack>
          </HStack>

          {/* Animated Code Panel */}
          <Collapsible.Content>
            <div className={codeInnerStyleOffset.className}>{code}</div>
          </Collapsible.Content>
        </Collapsible.Root>
      </Surface>
    </>
  );
}
