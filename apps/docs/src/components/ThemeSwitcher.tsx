'use client';

import React from 'react';
import { HStack, ThemeToggle, Button, useTheme } from '@cumulo/core';

const THEMES = [
  { id: 'docs', label: 'Docs' },
  { id: 'default', label: 'Default' },
  { id: 'cloud', label: 'Cloud' },
] as const;

export function ThemeSwitcher(): React.JSX.Element {
  const { theme, setTheme } = useTheme();

  return (
    <HStack gap="xs" align="center">
      <HStack gap="3xs" align="center">
        {THEMES.map((item) => {
          const isActive = theme === item.id;
          return (
            <Button
              key={item.id}
              size="small"
              variant={isActive ? 'secondary' : 'ghost'}
              shape="round"
              onClick={() => setTheme(item.id)}
            >
              {item.label}
            </Button>
          );
        })}
      </HStack>
      <ThemeToggle />
    </HStack>
  );
}
