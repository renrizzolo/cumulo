'use client';

import React, { useState } from 'react';
import { Card, Surface, HStack, VStack, Button, Heading, Text } from '@cumulo/core';
import { CodeBlock } from './CodeBlock.js';

export interface ComponentPreviewProps {
  title?: string;
  description?: string;
  code?: string;
  defaultLevel?: 0 | 1 | 2;
  children: React.ReactNode;
}

export function ComponentPreview({
  title,
  description,
  code,
  defaultLevel = 1,
  children,
}: ComponentPreviewProps): React.JSX.Element {
  const [level, setLevel] = useState<0 | 1 | 2>(defaultLevel);
  const [showCode, setShowCode] = useState(false);

  return (
    <Card level={1} padding="md">
      <VStack gap="md">
        {(title || description) && (
          <VStack gap="xs">
            {title && (
              <HStack justify="between" align="center">
                <Heading as="h4" size="md">
                  {title}
                </Heading>
              </HStack>
            )}
            {description && (
              <Text type="body" size="sm" color="muted">
                {description}
              </Text>
            )}
          </VStack>
        )}

        {/* Surface Preview Canvas */}
        <Surface
          level={level}
          style={{
            padding: '32px 24px',
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div style={{ width: '100%' }}>{children}</div>
        </Surface>

        {/* Toolbar Controls */}
        <HStack justify="between" align="center">
          <HStack gap="xs" align="center">
            <Text type="label" size="xs" color="muted">
              Surface Level:
            </Text>
            {([0, 1, 2] as const).map((lvl) => (
              <Button
                key={lvl}
                size="small"
                variant={level === lvl ? 'primary' : 'ghost'}
                onClick={() => setLevel(lvl)}
              >
                Level {lvl}
              </Button>
            ))}
          </HStack>

          {code && (
            <Button
              size="small"
              variant={showCode ? 'secondary' : 'ghost'}
              onClick={() => setShowCode(!showCode)}
            >
              {showCode ? 'Hide Code' : 'View Code'}
            </Button>
          )}
        </HStack>

        {/* Code Viewer */}
        {showCode && code && <CodeBlock code={code} language="tsx" />}
      </VStack>
    </Card>
  );
}

export default ComponentPreview;
