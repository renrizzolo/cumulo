'use client';

import React, { useState, useCallback } from 'react';
import { style } from '@cumulo/css';
import { Surface, HStack, VStack, Button, Heading, Text, vars, Card } from '@cumulo/core';

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
  padding: `${vars.spacing['2xl']} ${vars.spacing.xl}`,
  minHeight: '140px',
});

const toolbarFooterStyle = style({
  marginTop: 'auto',
  gap: vars.spacing.sm,
});

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

      <Surface padding="md" level={0} className={previewCanvasStyle.className}>
        <VStack justify="between" gap="md">
          <Surface level={level} padding="md">
            {children}
          </Surface>
          {/* Toolbar Footer */}
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
          {showCode && code && code}
        </VStack>
      </Surface>
    </div>
  );
}
