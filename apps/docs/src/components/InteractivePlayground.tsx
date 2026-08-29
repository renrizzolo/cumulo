'use client';

import React, { useState } from 'react';
import { style } from '@cumulo/css';
import {
  Surface,
  Button,
  Input,
  Badge,
  VStack,
  HStack,
  Heading,
  Text,
  Code,
  vars,
} from '@cumulo/core';

const playgroundWrapperStyle = style({
  margin: `${vars.spacing.xl} 0 ${vars.spacing['2xl']}`,
});

const surfaceLevel0Style = style({
  padding: vars.spacing.lg,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
  borderRadius: vars.radius.lg,
});

const surfaceLevel1Style = style({
  padding: vars.spacing.md,
  borderRadius: vars.radius.md,
});

const surfaceLevel2Style = style({
  padding: vars.spacing.sm,
  borderRadius: vars.radius.sm,
});

const inputMediumWrapperStyle = style({
  width: '220px',
});

const inputSmallWrapperStyle = style({
  width: '180px',
});

const colorCardStyle = style({
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  borderRadius: vars.radius.lg,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
  backgroundColor: vars.surface.bg.DEFAULT,
});

const colorDotBaseStyle = style({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  display: 'inline-block',
  marginRight: vars.spacing['3xs'],
});

export function InteractivePlayground(): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [seedColor, setSeedColor] = useState('#2563eb');
  const [inputValue, setInputValue] = useState('');

  const handleSeedChange = (color: string) => {
    setSeedColor(color);
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-primary-base', color);
    }
  };

  return (
    <VStack gap="xl" className={playgroundWrapperStyle.className}>
      {/* Dynamic Surface Nesting Showcase */}
      <Surface level={0} className={surfaceLevel0Style.className}>
        <VStack gap="lg">
          <HStack justify="between" align="center">
            <VStack gap="3xs">
              <Heading as="h4" size="md">
                Surface Level 0 (Canvas)
              </Heading>
              <Text type="caption" color="muted">
                Interactive elements automatically adapt via <Code>--surface-bg-next</Code>.
              </Text>
            </VStack>
            <Badge variant="primary" intent="primary">
              Surface 0
            </Badge>
          </HStack>

          <HStack gap="sm" align="center" wrap="wrap">
            <Button variant="primary" onClick={() => setCount((c) => c + 1)}>
              Primary Action ({count})
            </Button>
            <Button variant="secondary" onClick={() => setCount(0)}>
              Secondary Reset
            </Button>
            <Button variant="outline" intent="success">
              Outline Success
            </Button>
            <div className={inputMediumWrapperStyle.className}>
              <Input
                placeholder="Input on Surface 0…"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              />
            </div>
          </HStack>

          {/* Nested Surface Level 1 */}
          <Surface level={1} className={surfaceLevel1Style.className}>
            <VStack gap="md">
              <HStack justify="between" align="center">
                <VStack gap="3xs">
                  <Heading as="h5" size="sm">
                    Surface Level 1 (Card / Container)
                  </Heading>
                  <Text type="caption" color="muted">
                    Hovering inputs/buttons shifts into Surface Level 2 background.
                  </Text>
                </VStack>
                <Badge variant="secondary" intent="success">
                  Surface 1
                </Badge>
              </HStack>

              <HStack gap="sm" align="center" wrap="wrap">
                <Button variant="secondary" intent="warning">
                  Warning Secondary
                </Button>
                <Button variant="outline" intent="error">
                  Error Outline
                </Button>
                <div className={inputMediumWrapperStyle.className}>
                  <Input placeholder="Input on Surface 1…" />
                </div>
              </HStack>

              {/* Nested Surface Level 2 */}
              <Surface level={2} className={surfaceLevel2Style.className}>
                <VStack gap="sm">
                  <HStack justify="between" align="center">
                    <Text type="label" size="sm" weight="semibold">
                      Surface Level 2 (Elevated Popover / Modal)
                    </Text>
                    <Badge variant="outline" intent="info">
                      Surface 2
                    </Badge>
                  </HStack>
                  <HStack gap="sm" align="center" wrap="wrap">
                    <Button size="small" variant="primary">
                      Small Primary
                    </Button>
                    <Button size="small" variant="secondary">
                      Small Secondary
                    </Button>
                    <div className={inputSmallWrapperStyle.className}>
                      <Input size="small" placeholder="Input on Surface 2…" />
                    </div>
                  </HStack>
                </VStack>
              </Surface>
            </VStack>
          </Surface>
        </VStack>
      </Surface>

      {/* Live OKLCH Color Seeding Controls */}
      <div className={colorCardStyle.className}>
        <VStack gap="md">
          <VStack gap="3xs">
            <Heading as="h4" size="md">
              Live Mathematical OKLCH Color Seeding
            </Heading>
            <Text type="caption" color="muted">
              Change the seed color below to see the entire 50-900 palette recompute live in pure
              CSS!
            </Text>
          </VStack>

          <HStack gap="sm" align="center" wrap="wrap">
            <Button
              size="small"
              variant={seedColor === '#f59e0b' ? 'primary' : 'outline'}
              onClick={() => handleSeedChange('#f59e0b')}
            >
              <span
                className={colorDotBaseStyle.className}
                style={{ backgroundColor: '#f59e0b' }}
              />
              Amber (Hoard)
            </Button>
            <Button
              size="small"
              variant={seedColor === '#2563eb' ? 'primary' : 'outline'}
              onClick={() => handleSeedChange('#2563eb')}
            >
              <span
                className={colorDotBaseStyle.className}
                style={{ backgroundColor: '#2563eb' }}
              />
              Blue
            </Button>
            <Button
              size="small"
              variant={seedColor === '#8b5cf6' ? 'primary' : 'outline'}
              onClick={() => handleSeedChange('#8b5cf6')}
            >
              <span
                className={colorDotBaseStyle.className}
                style={{ backgroundColor: '#8b5cf6' }}
              />
              Purple
            </Button>
            <Button
              size="small"
              variant={seedColor === '#10b981' ? 'primary' : 'outline'}
              onClick={() => handleSeedChange('#10b981')}
            >
              <span
                className={colorDotBaseStyle.className}
                style={{ backgroundColor: '#10b981' }}
              />
              Emerald
            </Button>
            <Button
              size="small"
              variant={seedColor === '#f43f5e' ? 'primary' : 'outline'}
              onClick={() => handleSeedChange('#f43f5e')}
            >
              <span
                className={colorDotBaseStyle.className}
                style={{ backgroundColor: '#f43f5e' }}
              />
              Rose
            </Button>
          </HStack>
        </VStack>
      </div>
    </VStack>
  );
}
