'use client';

import React, { useState, useCallback } from 'react';
import { style, recipe } from '@cumulo/css';
import { Surface, HStack, VStack, Button, Heading, Text, vars } from '@cumulo/core';

export interface ComponentPreviewProps {
  title?: string;
  description?: string;
  code?: string;
  defaultLevel?: 0 | 1 | 2;
  children: React.ReactNode;
}

const previewWrapperStyle = style({
  margin: `${vars.spacing.lg} 0 ${vars.spacing['2xl']}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
});

const previewCanvasStyle = style({
  minHeight: '160px',
  justifyContent: 'center',
  alignItems: 'center',
  padding: `${vars.spacing['2xl']} ${vars.spacing.xl}`,
});

const toolbarFooterStyle = style({
  paddingTop: vars.spacing.md,
  gap: vars.spacing.sm,
});

const codeCollapseRecipe = recipe(
  {
    base: {
      display: 'grid',
      gridTemplateRows: '0fr',
      transition: `grid-template-rows ${vars.duration.normal} ${vars.ease.default}, opacity ${vars.duration.fast} ${vars.ease.default}`,
      opacity: 0,
    },
    variants: {
      open: {
        true: {
          gridTemplateRows: '1fr',
          opacity: 1,
        },
        false: {
          gridTemplateRows: '0fr',
          opacity: 0,
        },
      },
    },
    defaultVariants: {
      open: false,
    },
  },
  'preview-code-collapse',
);

const codeInnerStyle = style({
  minHeight: 0,
  overflow: 'hidden',
});

const codeInnerStyleOffset = style({ marginTop: vars.spacing.md });

export function ComponentPreview({
  title,
  description,
  code,
  defaultLevel = 0,
  children,
}: ComponentPreviewProps): React.JSX.Element {
  const [level, setLevel] = useState<0 | 1 | 2>(defaultLevel);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [code]);

  return (
    <div className={previewWrapperStyle.className}>
      {(title || description) && (
        <VStack gap="3xs">
          {title && (
            <Heading as="h3" size="sm" weight="semibold" color="muted">
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
        <Surface level={level} flex={1} radius="lg" className={previewCanvasStyle.className}>
          {children}
        </Surface>

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
          {code && (
            <HStack gap="2xs" align="center">
              {showCode && (
                <Button size="xSmall" variant="ghost" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
              <Button
                size="xSmall"
                variant={showCode ? 'secondary' : 'ghost'}
                onClick={() => setShowCode(!showCode)}
              >
                {showCode ? 'Hide Code' : 'View Code'}
              </Button>
            </HStack>
          )}
        </HStack>

        {/* Animated Code Panel */}
        {code && (
          <div className={codeCollapseRecipe({ open: showCode })}>
            <div className={codeInnerStyle.className}>
              <div className={codeInnerStyleOffset.className}>{code}</div>
            </div>
          </div>
        )}
      </Surface>
    </div>
  );
}
