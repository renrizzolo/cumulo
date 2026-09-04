import React from 'react';
import { Surface, Card, VStack, HStack, Heading, Text } from '@cumulo/core';

export function NestedRadiusFixture() {
  return (
    <Surface data-testid="nested-radius-fixture" level={0} padding="xl" radius="none">
      <VStack gap="xl">
        <VStack gap="xs">
          <Heading as="h1" size="2xl">
            Concentric Radius & Parent Padding Matrix
          </Heading>
          <Text type="lead">
            Visual test for nested border-radius with R_child = max(0, R_parent - P_parent).
          </Text>
        </VStack>

        {/* 1. Radius 2xl combinations */}
        <Surface data-testid="section-radius-2xl" level={1} padding="lg" radius="2xl">
          <VStack gap="md">
            <Heading as="h2" size="md">
              Parent Radius: 2xl (1rem / 16px)
            </Heading>
            <HStack gap="md" wrap="wrap">
              {/* 2xl + xs padding (16px - 8px = 8px child radius) */}
              <VStack data-testid="case-2xl-xs" gap="xs" flex={1}>
                <Text type="label">Padding: xs</Text>
                <Surface data-testid="parent-2xl-xs" level={2} radius="2xl" padding="xs">
                  <Surface data-testid="child-2xl-xs" variant="primary" radius="auto" padding="sm">
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>

              {/* 2xl + sm padding (16px - 12px = 4px child radius) */}
              <VStack data-testid="case-2xl-sm" gap="xs" flex={1}>
                <Text type="label">Padding: sm</Text>
                <Surface data-testid="parent-2xl-sm" level={2} radius="2xl" padding="sm">
                  <Surface data-testid="child-2xl-sm" variant="primary" radius="auto" padding="sm">
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>

              {/* 2xl + md padding (16px - 16px = 0px child radius) */}
              <VStack data-testid="case-2xl-md" gap="xs" flex={1}>
                <Text type="label">Padding: md</Text>
                <Surface data-testid="parent-2xl-md" level={2} radius="2xl" padding="md">
                  <Surface data-testid="child-2xl-md" variant="primary" radius="auto" padding="sm">
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>

              {/* 2xl + none padding (16px - 0px = 16px child radius) */}
              <VStack data-testid="case-2xl-none" gap="xs" flex={1}>
                <Text type="label">Padding: none</Text>
                <Surface data-testid="parent-2xl-none" level={2} radius="2xl" padding="none">
                  <Surface
                    data-testid="child-2xl-none"
                    variant="primary"
                    radius="auto"
                    padding="sm"
                  >
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>
            </HStack>
          </VStack>
        </Surface>

        {/* 2. Radius xl combinations */}
        <Surface data-testid="section-radius-xl" level={1} padding="lg" radius="xl">
          <VStack gap="md">
            <Heading as="h2" size="md">
              Parent Radius: xl (0.75rem / 12px)
            </Heading>
            <HStack gap="md" wrap="wrap">
              {/* xl + xs padding (12px - 8px = 4px child radius) */}
              <VStack data-testid="case-xl-xs" gap="xs" flex={1}>
                <Text type="label">Padding: xs</Text>
                <Surface data-testid="parent-xl-xs" level={2} radius="xl" padding="xs">
                  <Surface data-testid="child-xl-xs" variant="primary" radius="auto" padding="sm">
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>

              {/* xl + sm padding (12px - 12px = 0px child radius) */}
              <VStack data-testid="case-xl-sm" gap="xs" flex={1}>
                <Text type="label">Padding: sm</Text>
                <Surface data-testid="parent-xl-sm" level={2} radius="xl" padding="sm">
                  <Surface data-testid="child-xl-sm" variant="primary" radius="auto" padding="sm">
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>

              {/* xl + none padding (12px - 0px = 12px child radius) */}
              <VStack data-testid="case-xl-none" gap="xs" flex={1}>
                <Text type="label">Padding: none</Text>
                <Surface data-testid="parent-xl-none" level={2} radius="xl" padding="none">
                  <Surface data-testid="child-xl-none" variant="primary" radius="auto" padding="sm">
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>
            </HStack>
          </VStack>
        </Surface>

        {/* 3. Radius lg combinations */}
        <Surface data-testid="section-radius-lg" level={1} padding="lg" radius="lg">
          <VStack gap="md">
            <Heading as="h2" size="md">
              Parent Radius: lg (0.5rem / 8px)
            </Heading>
            <HStack gap="md" wrap="wrap">
              {/* lg + xs padding (8px - 8px = 0px child radius) */}
              <VStack data-testid="case-lg-xs" gap="xs" flex={1}>
                <Text type="label">Padding: xs</Text>
                <Surface data-testid="parent-lg-xs" level={2} radius="lg" padding="xs">
                  <Surface data-testid="child-lg-xs" variant="primary" radius="auto" padding="sm">
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>

              {/* lg + none padding (8px - 0px = 8px child radius) */}
              <VStack data-testid="case-lg-none" gap="xs" flex={1}>
                <Text type="label">Padding: none</Text>
                <Surface data-testid="parent-lg-none" level={2} radius="lg" padding="none">
                  <Surface data-testid="child-lg-none" variant="primary" radius="auto" padding="sm">
                    <Text type="label">Auto Radius</Text>
                  </Surface>
                </Surface>
              </VStack>
            </HStack>
          </VStack>
        </Surface>

        {/* 4. Multi-level Concentric Nesting (Level 0 -> Level 1 -> Level 2) */}
        <Surface data-testid="section-multilevel" level={1} padding="lg" radius="2xl">
          <VStack gap="md">
            <Heading as="h2" size="md">
              Multi-Level Concentric Nesting
            </Heading>
            <Surface data-testid="multilevel-l0" level={0} radius="2xl" padding="xs">
              <VStack gap="xs">
                <Text type="label">Level 0: radius="2xl" (16px), padding="xs" (8px)</Text>
                <Surface data-testid="multilevel-l1" level={1} radius="2xl" padding="xs">
                  <VStack gap="xs">
                    <Text type="label">Level 1: radius="2xl" (16px), padding="xs" (8px)</Text>
                    <Surface
                      data-testid="multilevel-l2"
                      level={2}
                      variant="primary"
                      radius="auto"
                      padding="sm"
                    >
                      <Text type="label">Level 2: radius="auto" (8px)</Text>
                    </Surface>
                  </VStack>
                </Surface>
              </VStack>
            </Surface>
          </VStack>
        </Surface>

        {/* 5. Padded Child with Auto Radius (Regression Prevention) */}
        <Surface data-testid="section-padded-child" level={1} padding="lg" radius="2xl">
          <VStack gap="md">
            <Heading as="h2" size="md">
              Padded Child with Auto Radius (Self-Overwrite Regression Test)
            </Heading>
            <Card data-testid="padded-child-parent" radius="2xl" padding="xs">
              <VStack gap="xs">
                <Text type="label">Parent Card: radius="2xl" (16px), padding="xs" (8px)</Text>
                <Card data-testid="padded-child-child" variant="primary" radius="auto" padding="lg">
                  <VStack gap="xs">
                    <Text type="label">
                      Child Card: radius="auto" (16px - 8px = 8px) with own padding="lg"
                    </Text>
                    <Surface data-testid="padded-child-inner" level={2} radius="auto" padding="sm">
                      <Text type="label">Inner Element inheriting from child</Text>
                    </Surface>
                  </VStack>
                </Card>
              </VStack>
            </Card>
          </VStack>
        </Surface>
      </VStack>
    </Surface>
  );
}
