'use client';

import React from 'react';
import { useTheme, type Theme } from '../appProvider.js';

function isTheme(val: string): val is Theme {
  return val === 'light' || val === 'dark' || val === 'cloud';
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: 'var(--docs-muted)' }}>Theme:</span>
      <select
        value={theme}
        onChange={(e) => {
          if (isTheme(e.target.value)) {
            setTheme(e.target.value);
          }
        }}
        style={{
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid var(--docs-border)',
          background: 'var(--docs-bg)',
          color: 'var(--docs-fg)',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="cloud">Cloud Mist</option>
      </select>
    </div>
  );
}
