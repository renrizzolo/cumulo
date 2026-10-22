'use client';

import React from 'react';
import { HStack, ThemeToggle, setDefaultTheme } from '@cumulo/core';

setDefaultTheme('docs');

export function ThemeSwitcher(): React.JSX.Element {
  return (
    <HStack gap="xs" align="center">
      <ThemeToggle />
    </HStack>
  );
}
