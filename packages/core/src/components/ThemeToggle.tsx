'use client';

import { cx, style } from '@cumulo/css';
import React, { useCallback } from 'react';
import type { ColorMode } from '../theme/theme.js';
import { useTheme } from '../theme/useTheme.js';
import { Button, type ButtonProps } from './Button.js';

const iconSvgStyle = style({
  width: '1em',
  height: '1em',
  display: 'inline-block',
  flexShrink: 0,
});

export function SunIcon({ className }: { className?: string } = {}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx(iconSvgStyle, className)}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon({ className }: { className?: string } = {}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx(iconSvgStyle, className)}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function SystemIcon({ className }: { className?: string } = {}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx(iconSvgStyle, className)}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

const DEFAULT_CYCLE_ALL: readonly ColorMode[] = ['light', 'dark', 'system'] as const;

export interface ThemeToggleProps extends ButtonProps {
  /**
   * Toggle mode:
   * - `toggle`: 2-state smart toggle. Toggles between light/dark, automatically managing system default vs stored override.
   * - `cycle`: 3-state cycling between light, dark, and system.
   */
  mode?: 'toggle' | 'cycle';
  /** Custom sequence of color modes to cycle through when clicked. */
  cycle?: readonly ColorMode[];
  showLabel?: boolean;
  labelMap?: Partial<Record<ColorMode, React.ReactNode>>;
  iconMap?: Partial<Record<ColorMode, React.ReactNode>>;
}

export function ThemeToggle({
  variant = 'ghost',
  shape = 'round',
  mode = 'toggle',
  size = 'small',
  width,
  cycle,
  showLabel = false,
  labelMap,
  iconMap,
  className,
  children,
  onClick,
  ref,
  ...props
}: ThemeToggleProps): React.JSX.Element {
  const { mode: currentMode, resolvedMode, toggleMode } = useTheme();

  const cycleSequence = cycle ?? (mode === 'cycle' ? DEFAULT_CYCLE_ALL : undefined);

  const renderIcon = useCallback((): React.ReactNode => {
    if (iconMap && iconMap[currentMode]) {
      return iconMap[currentMode];
    }
    if (mode === 'cycle' && currentMode === 'system') {
      return <SystemIcon />;
    }
    if (resolvedMode === 'dark') {
      return <MoonIcon />;
    }
    return <SunIcon />;
  }, [currentMode, iconMap, mode, resolvedMode]);

  const renderLabel = useCallback((): React.ReactNode => {
    if (!showLabel) return null;
    if (labelMap && labelMap[currentMode]) {
      return labelMap[currentMode];
    }
    if (mode === 'cycle' && currentMode === 'system') {
      return 'System';
    }
    return resolvedMode === 'dark' ? 'Dark' : 'Light';
  }, [currentMode, showLabel, mode, labelMap, resolvedMode]);

  const defaultAriaLabel = resolvedMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Button
      ref={ref}
      variant={variant}
      shape={shape}
      width={!showLabel && !children ? 'square' : width}
      size={size}
      className={cx(className)}
      aria-label={props['aria-label'] || defaultAriaLabel}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          toggleMode(cycleSequence);
        }
      }}
      {...props}
    >
      {renderIcon()}
      {renderLabel()}
      {children}
    </Button>
  );
}
