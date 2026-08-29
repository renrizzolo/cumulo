'use client';

import React, { useState, useCallback } from 'react';
import { style } from '@cumulo/css';
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

const previewContainerStyle = style({
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
  backgroundColor: vars.surface.bg.DEFAULT,
  boxShadow: vars.shadow['1'],
});

const previewCanvasStyle = style({
  padding: `${vars.spacing['2xl']} ${vars.spacing.xl}`,
  minHeight: '140px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 0,
  border: 'none',
  transition: `background-color ${vars.duration.normal} ${vars.ease.default}`,
});

const canvasContentStyle = style({
  width: '100%',
});

const toolbarFooterStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: vars.surface.border,
  backgroundColor: vars.surface.bg.next,
  gap: vars.spacing.sm,
  flexWrap: 'wrap',
});

const surfaceLabelStyle = style({
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

const codeViewerStyle = style({
  margin: 0,
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: vars.surface.border,
  backgroundColor: vars.surface.bg.DEFAULT,
  overflowX: 'auto',
  fontSize: vars.font.size.sm,
  lineHeight: vars.line.height.relaxed,
  fontFamily: vars.font.mono,
  color: vars.surface.fg,
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
    } catch {
      // Clipboard fallback
    }
  }, [code]);

  return (
    <div className={previewWrapperStyle.className}>
      {(title || description) && (
        <VStack gap="3xs">
          {title && (
            <Heading as="h3" size="sm" color="muted">
              {title}
            </Heading>
          )}
          {description && (
            <Text type="body" size="sm" color="muted">
              {description}
            </Text>
          )}
        </VStack>
      )}

      {/* Unified Preview Container */}
      <div className={previewContainerStyle.className}>
        {/* Stage Canvas */}
        <Surface level={level} className={previewCanvasStyle.className}>
          <div className={canvasContentStyle.className}>{children}</div>
        </Surface>

        {/* Toolbar Footer */}
        <div className={toolbarFooterStyle.className}>
          {/* Surface Level Switcher */}
          <HStack gap="xs" align="center">
            <Text type="label" size="xs" color="muted" className={surfaceLabelStyle.className}>
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
        </div>

        {/* Seamless Code Expansion */}
        {showCode && code && (
          <pre className={codeViewerStyle.className}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
