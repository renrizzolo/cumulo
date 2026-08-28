'use client';

import React, { useState } from 'react';
import {
  Surface,
  Button,
  Input,
  Badge,
  Card,
  VStack,
  HStack,
  Heading,
  Text,
  Code,
} from '@cumulo/core';

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
    <VStack gap="lg" style={{ margin: '20px 0' }}>
      {/* Dynamic Surface Nesting Showcase */}
      <Surface level={0} style={{ padding: '24px' }}>
        <VStack gap="md">
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
            <div style={{ width: '220px' }}>
              <Input
                placeholder="Input on Surface 0..."
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              />
            </div>
          </HStack>

          {/* Nested Surface Level 1 */}
          <Surface level={1} style={{ padding: '20px' }}>
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
                <div style={{ width: '220px' }}>
                  <Input placeholder="Input on Surface 1..." />
                </div>
              </HStack>

              {/* Nested Surface Level 2 */}
              <Surface level={2} style={{ padding: '16px' }}>
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
                    <div style={{ width: '180px' }}>
                      <Input size="small" placeholder="Input on Surface 2..." />
                    </div>
                  </HStack>
                </VStack>
              </Surface>
            </VStack>
          </Surface>
        </VStack>
      </Surface>

      {/* Live OKLCH Color Seeding Controls */}
      <Card level={1} padding="md">
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
            {[
              { label: 'Amber (Hoard)', hex: '#d97706' },
              { label: 'Blue', hex: '#2563eb' },
              { label: 'Purple', hex: '#7c3aed' },
              { label: 'Emerald', hex: '#059669' },
              { label: 'Rose', hex: '#e11d48' },
            ].map((preset) => (
              <Button
                key={preset.hex}
                size="small"
                variant={seedColor === preset.hex ? 'primary' : 'outline'}
                onClick={() => handleSeedChange(preset.hex)}
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: preset.hex,
                    display: 'inline-block',
                    marginRight: '6px',
                  }}
                />
                {preset.label}
              </Button>
            ))}
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
}

export default InteractivePlayground;
