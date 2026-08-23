'use client';

import React from 'react';
import { ThemeToggle } from '@cumulo/core';

export function ThemeSwitcher() {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <ThemeToggle size="small" variant="outline" mode="toggle" />
    </div>
  );
}
