'use client';

import { HStack } from '@cumulo/core/components/Stack';
import { ThemeToggle } from '@cumulo/core/components/ThemeToggle';
import { setDefaultTheme } from '@cumulo/core/theme/theme';
import React from 'react';

setDefaultTheme('docs');

export function ThemeSwitcher(): React.JSX.Element {
  return (
    <HStack gap="xs" align="center">
      <ThemeToggle />
    </HStack>
  );
}
