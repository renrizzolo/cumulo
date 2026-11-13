'use client';

import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Code,
  Collapsible,
  Dialog,
  Divider,
  Field,
  Grid,
  Header,
  Heading,
  HStack,
  Input,
  Kbd,
  Link,
  Menu,
  Popover,
  Select,
  Spinner,
  Surface,
  Table,
  Tabs,
  Text,
  ThemeToggle,
  Tooltip,
  vars,
  VStack,
  type AlertVariant,
} from '@cumulo/core';
import { createTheme, createThemeContract, cx, style } from '@cumulo/css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColorTokens } from './ColorTokens';
import { CopyButton } from './CopyButton';

const sidebarContract = createThemeContract({
  width: null,
});

const sidebarTheme = createTheme(sidebarContract, {
  width: '450px',
});

const rootStyle = style(
  {
    width: '100%',
  },
  'theme-builder-root',
);

const rootGridStyle = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: vars.spacing.lg,
  '@media': {
    '(min-width: 1280px)': {
      gridTemplateColumns: `${sidebarContract.width} 1fr`,
    },
  },
});

const sidebarStyle = style(
  {
    display: 'flex',
    flexDirection: 'column',
    flex: `0 0 ${sidebarContract.width}`,
    width: `${sidebarContract.width}`,
    maxWidth: '100%',
    position: 'sticky',
    top: `calc(53px + ${vars.spacing.md})`,
    maxHeight: `calc(100vh - 53px - (${vars.spacing.md} * 2))`,
    overflowY: 'auto',
    '@media': {
      '(max-width: 1280px)': {
        flex: '1 1 100%',
        width: '100%',
        position: 'static',
        top: 'auto',
        maxHeight: 'none',
      },
    },
  },
  'theme-builder-sidebar',
);

const showcaseAreaStyle = style(
  {
    flex: '1 1 580px',
    minWidth: 0,
    maxWidth: '100%',
  },
  'theme-builder-showcase',
);

const tabContentStyle = style(
  {
    paddingTop: vars.spacing.xs,
  },
  'theme-tab-content',
);

const fullWidthStyle = style(
  {
    width: '100%',
  },
  'theme-full-width',
);

const colorInputStyle = style(
  {
    width: '32px',
    height: '32px',
    padding: 0,
    border: 'none',
    borderRadius: vars.radius.md,
    cursor: 'pointer',
    background: 'transparent',
  },
  'theme-color-input',
);

const codeCopyButtonStyle = style(
  {
    position: 'absolute',
    top: vars.spacing.sm,
    right: vars.spacing.sm,
  },
  'theme-code-copy',
);

const codeSurfaceStyle = style(
  {
    position: 'relative',
    overflow: 'auto',
    minWidth: 0,
    maxWidth: '100%',
  },
  'theme-code-surface',
);

const preStyle = style(
  {
    margin: 0,
    fontFamily: vars.font.mono,
    fontSize: '13px',
    lineHeight: vars.line.height.relaxed,
    overflowX: 'auto',
    maxWidth: '100%',
  },
  'theme-pre',
);

interface ThemeConfig {
  name: string;
  intentStyle: 'solid' | 'pastel' | 'pastel-dark';
  colors: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    grey: string;
  };
  scales: {
    chroma: number;
    contrast: number;
    lightness: number;
    sameAsLight: boolean;
    chromaDark: number;
    contrastDark: number;
    lightnessDark: number;
  };
  radii: {
    control: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
}

const DEFAULT_THEME: ThemeConfig = {
  name: 'my-theme',
  intentStyle: 'solid',
  colors: {
    primary: '#2563eb',
    success: '#009b50',
    warning: '#e79212',
    error: '#d10d27',
    info: '#0284c7',
    grey: '#96938e',
  },
  scales: {
    chroma: 1,
    contrast: 1,
    lightness: 0,
    sameAsLight: true,
    chromaDark: 1,
    contrastDark: 1,
    lightnessDark: 0,
  },
  radii: {
    control: '0.375rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  fonts: {
    sans: "'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};

interface PresetThemeShape {
  id: string;
  name: string;
  badge: string;
  config: Partial<Omit<ThemeConfig, 'scales' | 'fonts'>> & {
    scales?: Partial<ThemeConfig['scales']>;
    fonts?: Partial<ThemeConfig['fonts']>;
    intentStyle?: ThemeConfig['intentStyle'];
  };
}

const PRESET_THEMES = [
  {
    id: 'default',
    name: 'Default Blue',
    badge: 'Standard',
    config: {
      ...DEFAULT_THEME,
      name: 'cumulo-blue',
    },
  },
  {
    id: 'pastel-bloom',
    name: 'Pastel Bloom',
    badge: 'Soft Pastel',
    config: {
      name: 'cumulo-pastel-bloom',
      intentStyle: 'pastel',
      colors: {
        primary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#f43f5e',
        info: '#06b6d4',
        grey: '#64748b',
      },
      scales: { chroma: 1.05, contrast: 0.95, lightness: 0.04 },
      radii: {
        control: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      fonts: {
        sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    badge: 'Organic',
    config: {
      name: 'cumulo-emerald',
      colors: {
        primary: '#059669',
        success: '#16a34a',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0284c7',
        grey: '#71717a',
      },
      scales: { chroma: 1, contrast: 1 },
      radii: {
        control: '0.5rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      fonts: {
        sans: "'Newsreader', Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif",
        mono: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, monospace",
      },
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    badge: 'Warm',
    config: {
      name: 'cumulo-sunset',
      colors: {
        primary: '#fdb51c',
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#b91c1c',
        info: '#0284c7',
        grey: '#78716c',
      },
      scales: { chroma: 1.05, contrast: 1 },
      radii: {
        control: '0.375rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      fonts: {
        sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        mono: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      },
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    badge: 'Vivid',
    config: {
      name: 'cumulo-cyberpunk',
      colors: {
        primary: '#d946ef',
        success: '#10b981',
        warning: '#facc15',
        error: '#ff0055',
        info: '#00f0ff',
        grey: '#64748b',
      },
      scales: { chroma: 1.25, contrast: 1.05 },
      radii: {
        control: '0.125rem',
        md: '0.125rem',
        lg: '0.25rem',
        xl: '0.375rem',
        '2xl': '0.5rem',
      },
      fonts: {
        sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        mono: "'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace",
      },
    },
  },
  {
    id: 'monotech',
    name: 'Monotech Sharp',
    badge: 'Brutalist',
    config: {
      name: 'cumulo-monotech',
      colors: {
        primary: '#18181b',
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        info: '#3b82f6',
        grey: '#52525b',
      },
      scales: { chroma: 0.8, contrast: 1.1 },
      radii: {
        control: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
      },
      fonts: {
        sans: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        mono: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      },
    },
  },
  {
    id: 'crimson',
    name: 'Crimson Ruby',
    badge: 'Bold',
    config: {
      name: 'cumulo-crimson',
      colors: {
        primary: '#e11d48',
        success: '#059669',
        warning: '#d97706',
        error: '#9f1239',
        info: '#0284c7',
        grey: '#71717a',
      },
      scales: { chroma: 1.15, contrast: 0.85 },
      radii: {
        control: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      fonts: {
        sans: "'Newsreader', Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif",
        mono: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, monospace",
      },
    },
  },
] satisfies PresetThemeShape[];

const RADIUS_PRESETS = [
  {
    label: 'Sharp (0px)',
    values: { control: '0px', md: '0px', lg: '0px', xl: '0px', '2xl': '0px' },
  },
  {
    label: 'Subtle',
    values: { control: '0.25rem', md: '0.25rem', lg: '0.375rem', xl: '0.5rem', '2xl': '0.75rem' },
  },
  {
    label: 'Balanced (Default)',
    values: { control: '0.375rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem' },
  },
  {
    label: 'Rounded',
    values: { control: '0.625rem', md: '0.625rem', lg: '0.875rem', xl: '1.25rem', '2xl': '1.5rem' },
  },
  {
    label: 'Pill',
    values: { control: '9999px', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem' },
  },
];

const SPACING_PRESETS = [
  {
    label: 'Compact',
    values: {
      xs: '0.375rem',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
  },
  {
    label: 'Standard',
    values: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  },
  {
    label: 'Spacious',
    values: {
      xs: '0.75rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
  },
];

const FONT_PRESETS = [
  {
    label: 'System UI',
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  {
    label: 'DM Sans + Cascadia',
    sans: "'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  {
    label: 'Inter (sans)',
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
  {
    label: 'Newsreader (serif)',
    sans: "'Newsreader', Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif",
    mono: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, monospace",
  },
];

const CUSTOM_FONT_VALUE = 'custom';

const SYSTEM_FONT_NAMES = new Set([
  'system-ui',
  '-apple-system',
  'blinkmacsystemfont',
  'segoe ui',
  'roboto',
  'sans-serif',
  'serif',
  'monospace',
  'ui-monospace',
  'sfmono-regular',
  'menlo',
  'monaco',
  'consolas',
  'charter',
  'bitstream charter',
  'sitka text',
  'cambria',
]);

const GOOGLE_FONT_SPECS: Record<string, string> = {
  'dm sans': 'family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000',
  'cascadia code': 'family=Cascadia+Code:ital,wght@0,200..700;1,200..700',
  inter: 'family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900',
  'fira code': 'family=Fira+Code:wght@300..700',
  newsreader: 'family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800',
};

function getGoogleFontQuery(family: string): string {
  const normalized = family.toLowerCase().trim();
  if (GOOGLE_FONT_SPECS[normalized]) {
    return GOOGLE_FONT_SPECS[normalized];
  }
  const formatted = family.trim().replace(/\s+/g, '+');
  return `family=${formatted}:wght@400;500;600;700`;
}

function extractFontFamilies(fontStack: string): string[] {
  return fontStack
    .split(',')
    .map((item) =>
      item
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .trim(),
    )
    .filter((name) => name.length > 0 && !SYSTEM_FONT_NAMES.has(name.toLowerCase()));
}

const loadedGoogleFonts = new Set<string>();

function loadGoogleFont(family: string): void {
  if (typeof document === 'undefined') return;
  const normalized = family.toLowerCase().trim();
  if (loadedGoogleFonts.has(normalized)) return;

  const id = `google-font-${normalized.replace(/[^a-z0-9]/g, '-')}`;
  if (document.getElementById(id)) {
    loadedGoogleFonts.add(normalized);
    return;
  }

  if (!document.querySelector('link[data-cumulo-font-preconnect]')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    preconnect1.setAttribute('data-cumulo-font-preconnect', 'true');
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    preconnect2.setAttribute('data-cumulo-font-preconnect', 'true');
    document.head.appendChild(preconnect2);
  }

  const query = getGoogleFontQuery(family);
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
  document.head.appendChild(link);
  loadedGoogleFonts.add(normalized);
}

function loadGoogleFontsForStacks(stacks: string[]): void {
  for (const stack of stacks) {
    if (!stack) continue;
    const families = extractFontFamilies(stack);
    for (const family of families) {
      loadGoogleFont(family);
    }
  }
}

function getGoogleFontsImportUrl(stacks: string[]): string | null {
  const families: string[] = [];
  for (const stack of stacks) {
    if (!stack) continue;
    for (const fam of extractFontFamilies(stack)) {
      if (!families.some((f) => f.toLowerCase() === fam.toLowerCase())) {
        families.push(fam);
      }
    }
  }
  if (families.length === 0) return null;
  const queries = families.map((fam) => getGoogleFontQuery(fam)).join('&');
  return `https://fonts.googleapis.com/css2?${queries}&display=swap`;
}

function hslToHex(h: number, s: number, l: number): string {
  const normH = ((h % 360) + 360) % 360;
  const normS = Math.max(0, Math.min(100, s)) / 100;
  const normL = Math.max(0, Math.min(100, l)) / 100;
  const a = normS * Math.min(normL, 1 - normL);
  const channel = (n: number): string => {
    const k = (n + normH / 30) % 12;
    const color = normL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

function downloadTextFile(filename: string, content: string, mimeType: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function ColorPickerField({
  label,
  colorKey,
  value,
  defaultHex,
  onChange,
}: {
  label: string;
  colorKey: keyof ThemeConfig['colors'];
  value: string;
  defaultHex: string;
  onChange: (key: keyof ThemeConfig['colors'], value: string) => void;
}): React.JSX.Element {
  return (
    <Field.Root>
      <Field.Group gap="xs">
        <Field.Label>{label}</Field.Label>
        <HStack gap="xs" align="center" className={fullWidthStyle.className}>
          <input
            type="color"
            value={value.startsWith('#') ? value : defaultHex}
            onChange={(e) => onChange(colorKey, e.target.value)}
            className={colorInputStyle.className}
            aria-label={`${label} color picker`}
          />
          <Field.Input
            size="sm"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(colorKey, e.target.value)
            }
          />
        </HStack>
      </Field.Group>
    </Field.Root>
  );
}

interface ScaleSliderFieldProps {
  label: string;
  code: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}

function ScaleSliderField({
  label,
  code,
  value,
  min,
  max,
  step,
  onChange,
}: ScaleSliderFieldProps): React.JSX.Element {
  return (
    <Field.Root>
      <HStack justify="between" align="center" className={fullWidthStyle.className}>
        <Field.Label>
          {label}: {value}x
        </Field.Label>
        <Code>{code}</Code>
      </HStack>
      <Field.Slider min={min} max={max} step={step} value={value} onValueChange={onChange} />
    </Field.Root>
  );
}

function parseRem(value: string): number {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 0;
  if (value.trim().endsWith('px')) return num / 16;
  return num;
}

function formatRem(rem: number): string {
  return `${Math.round(rem * 10000) / 10000}rem`;
}

interface LengthSliderFieldProps {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  onChange: (val: string) => void;
}

function LengthSliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: LengthSliderFieldProps): React.JSX.Element {
  const rem = parseRem(value);
  const isPill = rem > max * 4;
  const display = isPill ? 'Pill' : `${Math.round(rem * 16 * 10) / 10}px`;
  return (
    <Field.Root>
      <HStack justify="between" align="center" className={fullWidthStyle.className}>
        <Field.Label>{label}</Field.Label>
        <Code>{display}</Code>
      </HStack>
      <Field.Slider
        min={min}
        max={max}
        step={step}
        value={Math.min(rem, max)}
        onValueChange={(val: number) => onChange(formatRem(val))}
      />
    </Field.Root>
  );
}

function themeKey(config: ThemeConfig): string {
  return JSON.stringify({ ...config, name: '' });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(source: unknown, key: string, fallback: string): string {
  if (!isRecord(source)) return fallback;
  const value = source[key];
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function readNumber(source: unknown, key: string, fallback: number): number {
  if (!isRecord(source)) return fallback;
  const value = source[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readBoolean(source: unknown, key: string, fallback: boolean): boolean {
  if (!isRecord(source)) return fallback;
  const value = source[key];
  return typeof value === 'boolean' ? value : fallback;
}

function isIntentStyle(value: unknown): value is ThemeConfig['intentStyle'] {
  return value === 'solid' || value === 'pastel' || value === 'pastel-dark';
}

type ParseThemeResult = { ok: true; theme: ThemeConfig } | { ok: false; error: string };

function parseThemeJson(text: string): ParseThemeResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Invalid JSON. Check for missing quotes or trailing commas.' };
  }
  if (!isRecord(data)) {
    return { ok: false, error: 'Expected a JSON object exported from the theme builder.' };
  }
  const d = DEFAULT_THEME;
  const { colors, scales, radii, spacing, fonts } = data;
  if (![colors, scales, radii, spacing, fonts, data.intentStyle, data.name].some(Boolean)) {
    return { ok: false, error: 'No theme fields found (name, colors, radii, spacing, fonts…).' };
  }
  const chroma = readNumber(scales, 'chroma', d.scales.chroma);
  const contrast = readNumber(scales, 'contrast', d.scales.contrast);
  const lightness = readNumber(scales, 'lightness', d.scales.lightness);
  const hasDarkOverrides =
    isRecord(scales) &&
    ('chromaDark' in scales || 'contrastDark' in scales || 'lightnessDark' in scales);
  const sameAsLight = readBoolean(
    scales,
    'sameAsLight',
    hasDarkOverrides ? false : d.scales.sameAsLight,
  );
  const chromaDark = sameAsLight ? chroma : readNumber(scales, 'chromaDark', chroma);
  const contrastDark = sameAsLight ? contrast : readNumber(scales, 'contrastDark', contrast);
  const lightnessDark = sameAsLight ? lightness : readNumber(scales, 'lightnessDark', lightness);

  return {
    ok: true,
    theme: {
      name: readString(data, 'name', d.name),
      intentStyle: isIntentStyle(data.intentStyle) ? data.intentStyle : d.intentStyle,
      colors: {
        primary: readString(colors, 'primary', d.colors.primary),
        success: readString(colors, 'success', d.colors.success),
        warning: readString(colors, 'warning', d.colors.warning),
        error: readString(colors, 'error', d.colors.error),
        info: readString(colors, 'info', d.colors.info),
        grey: readString(colors, 'grey', d.colors.grey),
      },
      scales: {
        chroma,
        contrast,
        lightness,
        sameAsLight,
        chromaDark,
        contrastDark,
        lightnessDark,
      },
      radii: {
        control: readString(radii, 'control', d.radii.control),
        md: readString(radii, 'md', d.radii.md),
        lg: readString(radii, 'lg', d.radii.lg),
        xl: readString(radii, 'xl', d.radii.xl),
        '2xl': readString(radii, '2xl', d.radii['2xl']),
      },
      spacing: {
        xs: readString(spacing, 'xs', d.spacing.xs),
        sm: readString(spacing, 'sm', d.spacing.sm),
        md: readString(spacing, 'md', d.spacing.md),
        lg: readString(spacing, 'lg', d.spacing.lg),
        xl: readString(spacing, 'xl', d.spacing.xl),
      },
      fonts: {
        sans: readString(fonts, 'sans', d.fonts.sans),
        mono: readString(fonts, 'mono', d.fonts.mono),
      },
    },
  };
}

const COLOR_CONFIGS: Array<{
  label: string;
  key: keyof ThemeConfig['colors'];
  defaultHex: string;
}> = [
  { label: 'Primary', key: 'primary', defaultHex: '#2563eb' },
  { label: 'Success', key: 'success', defaultHex: '#009b50' },
  { label: 'Warning', key: 'warning', defaultHex: '#e79212' },
  { label: 'Error', key: 'error', defaultHex: '#d10d27' },
  { label: 'Info', key: 'info', defaultHex: '#0284c7' },
  { label: 'Grey', key: 'grey', defaultHex: '#96938e' },
];

const RADII_CONFIGS: Array<{ key: keyof ThemeConfig['radii']; label: string }> = [
  { key: 'control', label: 'Control (Buttons, Inputs)' },
  { key: 'md', label: 'MD (Inner)' },
  { key: 'lg', label: 'LG (Cards)' },
  { key: 'xl', label: 'XL (Modals)' },
  { key: '2xl', label: '2XL (Overlays)' },
];

const SPACING_CONFIGS: Array<{ key: keyof ThemeConfig['spacing']; label: string }> = [
  { key: 'xs', label: 'XS' },
  { key: 'sm', label: 'SM' },
  { key: 'md', label: 'MD' },
  { key: 'lg', label: 'LG' },
  { key: 'xl', label: 'XL' },
];

export function ThemeBuilder(): React.JSX.Element {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [appliedPreset, setAppliedPreset] = useState({
    id: 'default',
    key: themeKey(DEFAULT_THEME),
  });
  // Any edit after applying a preset makes the theme diverge, which reads as 'Custom' (empty id).
  const activePresetId = themeKey(theme) === appliedPreset.key ? appliedPreset.id : '';
  const activeRadiusPreset = RADIUS_PRESETS.find(
    (p) =>
      p.values.control === theme.radii.control &&
      p.values.md === theme.radii.md &&
      p.values.lg === theme.radii.lg,
  );
  const activeSpacingPreset = SPACING_PRESETS.find(
    (p) =>
      p.values.xs === theme.spacing.xs &&
      p.values.md === theme.spacing.md &&
      p.values.lg === theme.spacing.lg,
  );
  const [localColors, setLocalColors] = useState<ThemeConfig['colors']>(DEFAULT_THEME.colors);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('colors');
  const [previewTab, setPreviewTab] = useState<string>('components');
  const [customFontsOpen, setCustomFontsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<AlertVariant>('secondary');
  const [previewCardMinWidth, setPreviewCardMinWidth] = useState<'300px' | '380px' | '480px'>(
    '380px',
  );
  const [previewSurfaceLevel, setPreviewSurfaceLevel] = useState<0 | 1 | 2>(1);
  const [previewCardLevel, setPreviewCardLevel] = useState<0 | 1 | 2>(0);
  const debounceTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updateColor = useCallback((key: keyof ThemeConfig['colors'], value: string): void => {
    setTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  }, []);

  // Debounced color update for smooth dragging in native color picker
  const handleColorChange = useCallback(
    (key: keyof ThemeConfig['colors'], value: string): void => {
      setLocalColors((prev) => ({ ...prev, [key]: value }));

      if (debounceTimerRef.current[key]) {
        clearTimeout(debounceTimerRef.current[key]);
      }

      debounceTimerRef.current[key] = setTimeout(() => {
        updateColor(key, value);
      }, 50);
    },
    [updateColor],
  );

  const updateScale = (key: 'chroma' | 'contrast' | 'lightness', value: number): void => {
    const darkKeyMap = {
      chroma: 'chromaDark',
      contrast: 'contrastDark',
      lightness: 'lightnessDark',
    } as const;
    setTheme((prev) => ({
      ...prev,
      scales: {
        ...prev.scales,
        [key]: value,
        ...(prev.scales.sameAsLight ? { [darkKeyMap[key]]: value } : {}),
      },
    }));
  };

  const updateDarkScale = (
    key: 'chromaDark' | 'contrastDark' | 'lightnessDark',
    value: number,
  ): void => {
    setTheme((prev) => ({
      ...prev,
      scales: {
        ...prev.scales,
        [key]: value,
      },
    }));
  };

  const toggleSameAsLight = (sameAsLight: boolean): void => {
    setTheme((prev) => ({
      ...prev,
      scales: {
        ...prev.scales,
        sameAsLight,
        ...(sameAsLight
          ? {
              chromaDark: prev.scales.chroma,
              contrastDark: prev.scales.contrast,
              lightnessDark: prev.scales.lightness,
            }
          : {}),
      },
    }));
  };

  const updateRadius = (key: keyof ThemeConfig['radii'], value: string): void => {
    setTheme((prev) => ({
      ...prev,
      radii: {
        ...prev.radii,
        [key]: value,
      },
    }));
  };

  const updateSpacing = (key: keyof ThemeConfig['spacing'], value: string): void => {
    setTheme((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
  };

  const applyPreset = (preset: PresetThemeShape): void => {
    const nextColors = {
      ...theme.colors,
      ...preset.config.colors,
    };
    const nextFonts = {
      sans: preset.config.fonts?.sans ?? DEFAULT_THEME.fonts.sans,
      mono: preset.config.fonts?.mono ?? DEFAULT_THEME.fonts.mono,
    };
    const nextChroma = preset.config.scales?.chroma ?? DEFAULT_THEME.scales.chroma;
    const nextContrast = preset.config.scales?.contrast ?? DEFAULT_THEME.scales.contrast;
    const nextLightness = preset.config.scales?.lightness ?? 0;
    const nextSameAsLight = preset.config.scales?.sameAsLight ?? true;
    const nextTheme: ThemeConfig = {
      ...theme,
      ...preset.config,
      intentStyle: preset.config.intentStyle ?? 'solid',
      colors: nextColors,
      scales: {
        chroma: nextChroma,
        contrast: nextContrast,
        lightness: nextLightness,
        sameAsLight: nextSameAsLight,
        chromaDark: nextSameAsLight ? nextChroma : (preset.config.scales?.chromaDark ?? nextChroma),
        contrastDark: nextSameAsLight
          ? nextContrast
          : (preset.config.scales?.contrastDark ?? nextContrast),
        lightnessDark: nextSameAsLight
          ? nextLightness
          : (preset.config.scales?.lightnessDark ?? nextLightness),
      },
      radii: {
        ...theme.radii,
        ...preset.config.radii,
      },
      fonts: nextFonts,
    };
    loadGoogleFontsForStacks([nextFonts.sans, nextFonts.mono]);
    setLocalColors(nextColors);
    setAppliedPreset({ id: preset.id, key: themeKey(nextTheme) });
    setTheme(nextTheme);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGoogleFontsForStacks([theme.fonts.sans, theme.fonts.mono]);
    }, 250);
    return () => clearTimeout(timer);
  }, [theme.fonts.sans, theme.fonts.mono]);

  const generatedCss = useMemo((): { exportCss: string; previewCss: string } => {
    const selector = `[data-theme='${theme.name || 'my-theme'}']`;
    const fontImportUrl = getGoogleFontsImportUrl([theme.fonts.sans, theme.fonts.mono]);
    const fontImport = fontImportUrl
      ? `/* Google Fonts */\n@import url('${fontImportUrl}');\n\n`
      : '';
    const pastelOverrides =
      theme.intentStyle === 'pastel'
        ? `

  /* Intent Style: Pastel (Inverted Soft Intents) */
  --theme-primary: light-dark(var(--theme-primary-100), var(--theme-primary-900));
  --theme-primary-hover: light-dark(var(--theme-primary-200), var(--theme-primary-800));
  --theme-primary-fg: light-dark(var(--theme-primary-800), var(--theme-primary-100));
  --theme-primary-border: light-dark(var(--theme-primary-200), var(--theme-primary-700));

  --theme-success-bg: light-dark(var(--theme-success-100), var(--theme-success-900));
  --theme-success-hover: light-dark(var(--theme-success-200), var(--theme-success-800));
  --theme-success-fg: light-dark(var(--theme-success-800), var(--theme-success-100));

  --theme-warning-bg: light-dark(var(--theme-warning-100), var(--theme-warning-900));
  --theme-warning-hover: light-dark(var(--theme-warning-200), var(--theme-warning-800));
  --theme-warning-fg: light-dark(var(--theme-warning-800), var(--theme-warning-100));

  --theme-error-bg: light-dark(var(--theme-error-100), var(--theme-error-900));
  --theme-error-hover: light-dark(var(--theme-error-200), var(--theme-error-800));
  --theme-error-fg: light-dark(var(--theme-error-800), var(--theme-error-100));

  --theme-info-bg: light-dark(var(--theme-info-100), var(--theme-info-900));
  --theme-info-hover: light-dark(var(--theme-info-200), var(--theme-info-800));
  --theme-info-fg: light-dark(var(--theme-info-800), var(--theme-info-100));`
        : theme.intentStyle === 'pastel-dark'
          ? `

  /* Intent Style: Pastel (Dark Mode Only) */
  --theme-primary: light-dark(var(--theme-primary-600), var(--theme-primary-900));
  --theme-primary-hover: light-dark(var(--theme-primary-700), var(--theme-primary-800));
  --theme-primary-fg: light-dark(var(--color-white), var(--theme-primary-100));
  --theme-primary-border: light-dark(var(--theme-primary-200), var(--theme-primary-700));

  --theme-success-bg: light-dark(var(--theme-success-600), var(--theme-success-900));
  --theme-success-hover: light-dark(var(--theme-success-700), var(--theme-success-800));
  --theme-success-fg: light-dark(#ffffff, var(--theme-success-100));

  --theme-warning-bg: light-dark(var(--theme-warning-600), var(--theme-warning-900));
  --theme-warning-hover: light-dark(var(--theme-warning-700), var(--theme-warning-800));
  --theme-warning-fg: light-dark(#ffffff, var(--theme-warning-100));

  --theme-error-bg: light-dark(var(--theme-error-600), var(--theme-error-900));
  --theme-error-hover: light-dark(var(--theme-error-700), var(--theme-error-800));
  --theme-error-fg: light-dark(#ffffff, var(--theme-error-100));

  --theme-info-bg: light-dark(var(--theme-info-600), var(--theme-info-900));
  --theme-info-hover: light-dark(var(--theme-info-700), var(--theme-info-800));
  --theme-info-fg: light-dark(#ffffff, var(--theme-info-100));`
          : '';

    const darkScaleOverrides = !theme.scales.sameAsLight
      ? `\n  --theme-chroma-scale-dark: ${theme.scales.chromaDark};\n  --theme-contrast-scale-dark: ${theme.scales.contrastDark};\n  --theme-lightness-offset-dark: ${theme.scales.lightnessDark};`
      : '';

    const cssBody = `  /* Seed Colors */
  --color-primary-base: ${theme.colors.primary};
  --color-success-base: ${theme.colors.success};
  --color-warning-base: ${theme.colors.warning};
  --color-error-base: ${theme.colors.error};
  --color-info-base: ${theme.colors.info};
  --color-grey-base: ${theme.colors.grey};

  /* Palette Tuning */
  --theme-chroma-scale: ${theme.scales.chroma};
  --theme-contrast-scale: ${theme.scales.contrast};
  --theme-lightness-offset: ${theme.scales.lightness};${darkScaleOverrides}${pastelOverrides}

  /* Border Radii */
  --theme-radius-control: ${theme.radii.control};
  --theme-radius-md: ${theme.radii.md};
  --theme-radius-lg: ${theme.radii.lg};
  --theme-radius-xl: ${theme.radii.xl};
  --theme-radius-2xl: ${theme.radii['2xl']};

  /* Spacing Scale */
  --theme-spacing-xs: ${theme.spacing.xs};
  --theme-spacing-sm: ${theme.spacing.sm};
  --theme-spacing-md: ${theme.spacing.md};
  --theme-spacing-lg: ${theme.spacing.lg};
  --theme-spacing-xl: ${theme.spacing.xl};

  /* Typography */
  --theme-font-sans: ${theme.fonts.sans};
  --theme-font-mono: ${theme.fonts.mono};`;

    return {
      exportCss: `${fontImport}${selector} {\n${cssBody}\n}`,
      previewCss: `[data-theme='theme-builder-preview'] {\n${cssBody}\n}`,
    };
  }, [theme]);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(generatedCss.exportCss);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [generatedCss.exportCss]);

  const handleCopyJson = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [theme]);

  const handleDownloadCss = useCallback((): void => {
    const safeName = (theme.name || 'my-theme').replace(/[^a-z0-9-_]/gi, '-');
    downloadTextFile(`${safeName}.css`, generatedCss.exportCss, 'text/css;charset=utf-8');
  }, [theme.name, generatedCss.exportCss]);

  const handleDownloadJson = useCallback((): void => {
    const safeName = (theme.name || 'my-theme').replace(/[^a-z0-9-_]/gi, '-');
    downloadTextFile(
      `${safeName}.theme.json`,
      JSON.stringify(theme, null, 2),
      'application/json;charset=utf-8',
    );
  }, [theme]);

  const handleRandomize = useCallback((): void => {
    const baseHue = Math.floor(Math.random() * 360);
    const sat = 68 + Math.floor(Math.random() * 20);
    const light = 44 + Math.floor(Math.random() * 12);
    const nextColors: ThemeConfig['colors'] = {
      primary: hslToHex(baseHue, sat, light),
      success: hslToHex(142 + Math.floor(Math.random() * 24), 72, 38),
      warning: hslToHex(32 + Math.floor(Math.random() * 14), 88, 48),
      error: hslToHex(348 + Math.floor(Math.random() * 18), 82, 46),
      info: hslToHex(192 + Math.floor(Math.random() * 20), 84, 44),
      grey: hslToHex(baseHue, 8, 52),
    };
    const randomRadius =
      RADIUS_PRESETS[Math.floor(Math.random() * RADIUS_PRESETS.length)] ?? RADIUS_PRESETS[2];
    const intentChoices: Array<ThemeConfig['intentStyle']> = ['solid', 'pastel', 'pastel-dark'];
    const randomIntent = intentChoices[Math.floor(Math.random() * intentChoices.length)] ?? 'solid';
    setLocalColors(nextColors);
    setTheme((prev) => ({
      ...prev,
      intentStyle: randomIntent,
      colors: nextColors,
      radii: { ...randomRadius.values },
    }));
  }, []);

  const scaleRadii = (controlRem: number): void => {
    setTheme((prev) => ({
      ...prev,
      radii: {
        control: formatRem(controlRem),
        md: formatRem(controlRem),
        lg: formatRem(controlRem * 1.333),
        xl: formatRem(controlRem * 2),
        '2xl': formatRem(controlRem * 2.667),
      },
    }));
  };

  const scaleSpacing = (mdRem: number): void => {
    setTheme((prev) => ({
      ...prev,
      spacing: {
        xs: formatRem(mdRem * 0.5),
        sm: formatRem(mdRem * 0.75),
        md: formatRem(mdRem),
        lg: formatRem(mdRem * 1.5),
        xl: formatRem(mdRem * 2),
      },
    }));
  };

  const handleReset = (): void => {
    setAppliedPreset({ id: 'default', key: themeKey(DEFAULT_THEME) });
    setLocalColors(DEFAULT_THEME.colors);
    setTheme(DEFAULT_THEME);
  };

  const handleImportApply = (): void => {
    const result = parseThemeJson(importText);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    loadGoogleFontsForStacks([result.theme.fonts.sans, result.theme.fonts.mono]);
    setLocalColors(result.theme.colors);
    setTheme(result.theme);
    setImportText('');
    setImportError(null);
    setImportOpen(false);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportText(await file.text());
    setImportError(null);
  };

  return (
    <div className={cx(rootStyle.className, sidebarTheme.className)}>
      {/* Dynamic Scoped Styles for the preview container */}
      <style
        dangerouslySetInnerHTML={{
          __html: generatedCss.previewCss,
        }}
      />

      {/* Main Two-Column Layout: Left Sticky Sidebar & Right Preview Showcase */}
      <div className={rootGridStyle.className}>
        {/* Controls Sidebar: Sticky on large viewports, full-width at top on small viewports */}
        <aside className={sidebarStyle.className}>
          <Card.Root level={0} padding="md">
            <VStack gap="md">
              <HStack justify="between" align="center" gap="sm">
                <Heading as="h2" size="xs">
                  Customize
                </Heading>
                <HStack gap="xs" align="center">
                  <ThemeToggle />
                  <Tooltip.Root>
                    <Tooltip.Trigger variant="secondary" size="sm" onClick={handleRandomize}>
                      Shuffle
                    </Tooltip.Trigger>
                    <Tooltip.Content>Generate a random palette and radius</Tooltip.Content>
                  </Tooltip.Root>
                  <Button size="sm" variant="ghost" onClick={handleReset}>
                    Reset
                  </Button>
                </HStack>
              </HStack>

              <Grid.Root columns="auto-fit" minColumnWidth="160px" gap="sm">
                <Field.Root>
                  <Field.Label>Preset</Field.Label>
                  <Field.Select
                    size="sm"
                    value={activePresetId}
                    onValueChange={(id) => {
                      const p = PRESET_THEMES.find((preset) => preset.id === id);
                      if (p) applyPreset(p);
                    }}
                  >
                    {/* Only shown as a state label after shuffle/import; not a selectable choice */}
                    {activePresetId === '' ? (
                      <Select.Option value="" disabled>
                        Custom
                      </Select.Option>
                    ) : null}
                    {PRESET_THEMES.map((preset) => (
                      <Select.Option key={preset.id} value={preset.id}>
                        {preset.name}
                      </Select.Option>
                    ))}
                  </Field.Select>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Theme ID</Field.Label>
                  <Field.Input
                    size="sm"
                    value={theme.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTheme((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. brand-theme"
                  />
                </Field.Root>
              </Grid.Root>

              <Tabs.Root
                defaultValue={activeTab}
                onValueChange={(val: string) => setActiveTab(val)}
                variant="line"
              >
                <Tabs.List>
                  <Tabs.Trigger value="colors">Colors</Tabs.Trigger>
                  <Tabs.Trigger value="radii">Radius</Tabs.Trigger>
                  <Tabs.Trigger value="spacing">Spacing</Tabs.Trigger>
                  <Tabs.Trigger value="typography">Type</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="colors">
                  <VStack gap="lg" className={tabContentStyle.className}>
                    <Grid.Root columns="auto-fit" minColumnWidth="120px" gap="md">
                      {COLOR_CONFIGS.map((cfg) => (
                        <ColorPickerField
                          key={cfg.key}
                          label={cfg.label}
                          colorKey={cfg.key}
                          value={localColors[cfg.key]}
                          defaultHex={cfg.defaultHex}
                          onChange={handleColorChange}
                        />
                      ))}
                    </Grid.Root>

                    <Text size="xs" color="muted">
                      Each color generates a 50–900 shade scale. See the generated shades in the{' '}
                      <Link
                        href="#theme-preview"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          setPreviewTab('palette');
                        }}
                      >
                        Palette tab
                      </Link>
                      .
                    </Text>

                    <Field.Root>
                      <Field.Label>Intent style</Field.Label>
                      <Field.Select
                        size="sm"
                        value={theme.intentStyle}
                        onValueChange={(val) => {
                          if (val === 'solid' || val === 'pastel' || val === 'pastel-dark') {
                            setTheme((prev) => ({ ...prev, intentStyle: val }));
                          }
                        }}
                      >
                        <Select.Option value="solid">Solid</Select.Option>
                        <Select.Option value="pastel">Pastel</Select.Option>
                        <Select.Option value="pastel-dark">Pastel (dark)</Select.Option>
                      </Field.Select>
                    </Field.Root>

                    <Divider />

                    <VStack gap="md">
                      <HStack justify="between" align="center" wrap="wrap" gap="xs">
                        <Text type="label">
                          {theme.scales.sameAsLight ? 'Palette tuning' : 'Palette tuning (light)'}
                        </Text>
                      </HStack>
                      <ScaleSliderField
                        label="Chroma"
                        code="--theme-chroma-scale"
                        value={theme.scales.chroma}
                        min={0.4}
                        max={1.5}
                        step={0.05}
                        onChange={(val) => updateScale('chroma', val)}
                      />
                      <ScaleSliderField
                        label="Contrast"
                        code="--theme-contrast-scale"
                        value={theme.scales.contrast}
                        min={0.75}
                        max={1.25}
                        step={0.05}
                        onChange={(val) => updateScale('contrast', val)}
                      />
                      <ScaleSliderField
                        label="Lightness shift"
                        code="--theme-lightness-offset"
                        value={theme.scales.lightness}
                        min={-0.15}
                        max={0.15}
                        step={0.01}
                        onChange={(val) => updateScale('lightness', Math.round(val * 100) / 100)}
                      />
                    </VStack>

                    <VStack gap="md">
                      <Text type="label">Palette tuning (dark)</Text>
                      <Field.Root direction="row" gap="xs" align="center">
                        <Field.Checkbox
                          size="sm"
                          checked={theme.scales.sameAsLight}
                          onCheckedChange={toggleSameAsLight}
                        />
                        <Field.Label>Same as light mode</Field.Label>
                      </Field.Root>
                      {!theme.scales.sameAsLight ? (
                        <>
                          <ScaleSliderField
                            label="Chroma (dark)"
                            code="--theme-chroma-scale-dark"
                            value={theme.scales.chromaDark}
                            min={0.4}
                            max={1.5}
                            step={0.05}
                            onChange={(val) => updateDarkScale('chromaDark', val)}
                          />
                          <ScaleSliderField
                            label="Contrast (dark)"
                            code="--theme-contrast-scale-dark"
                            value={theme.scales.contrastDark}
                            min={0.75}
                            max={1.25}
                            step={0.05}
                            onChange={(val) => updateDarkScale('contrastDark', val)}
                          />
                          <ScaleSliderField
                            label="Lightness shift (dark)"
                            code="--theme-lightness-offset-dark"
                            value={theme.scales.lightnessDark}
                            min={-0.15}
                            max={0.15}
                            step={0.01}
                            onChange={(val) =>
                              updateDarkScale('lightnessDark', Math.round(val * 100) / 100)
                            }
                          />
                        </>
                      ) : null}
                    </VStack>
                  </VStack>
                </Tabs.Content>

                <Tabs.Content value="radii">
                  <VStack gap="lg" className={tabContentStyle.className}>
                    <Field.Root>
                      <Field.Label>Radius preset</Field.Label>
                      <Field.Select
                        size="sm"
                        value={activeRadiusPreset?.label ?? ''}
                        onValueChange={(label) => {
                          const preset = RADIUS_PRESETS.find((p) => p.label === label);
                          if (preset) {
                            setTheme((prev) => ({ ...prev, radii: { ...preset.values } }));
                          }
                        }}
                      >
                        {!activeRadiusPreset ? (
                          <Select.Option value="" disabled>
                            Custom
                          </Select.Option>
                        ) : null}
                        {RADIUS_PRESETS.map((preset) => (
                          <Select.Option key={preset.label} value={preset.label}>
                            {preset.label}
                          </Select.Option>
                        ))}
                      </Field.Select>
                    </Field.Root>

                    <LengthSliderField
                      label="Overall roundness"
                      value={theme.radii.control}
                      min={0}
                      max={1.5}
                      step={0.125}
                      onChange={(val) => scaleRadii(parseRem(val))}
                    />

                    <Collapsible.Root>
                      <Collapsible.Trigger variant="ghost" size="xs" width="full">
                        Fine-tune each radius ▾
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <VStack gap="md" className={tabContentStyle.className}>
                          {RADII_CONFIGS.map((item) => (
                            <LengthSliderField
                              key={item.key}
                              label={item.label}
                              value={theme.radii[item.key]}
                              min={0}
                              max={2}
                              step={0.0625}
                              onChange={(val) => updateRadius(item.key, val)}
                            />
                          ))}
                        </VStack>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </VStack>
                </Tabs.Content>

                <Tabs.Content value="spacing">
                  <VStack gap="lg" className={tabContentStyle.className}>
                    <Field.Root>
                      <Field.Label>Spacing preset</Field.Label>
                      <Field.Select
                        size="sm"
                        value={activeSpacingPreset?.label ?? ''}
                        onValueChange={(label) => {
                          const preset = SPACING_PRESETS.find((p) => p.label === label);
                          if (preset) {
                            setTheme((prev) => ({ ...prev, spacing: { ...preset.values } }));
                          }
                        }}
                      >
                        {!activeSpacingPreset ? (
                          <Select.Option value="" disabled>
                            Custom
                          </Select.Option>
                        ) : null}
                        {SPACING_PRESETS.map((preset) => (
                          <Select.Option key={preset.label} value={preset.label}>
                            {preset.label}
                          </Select.Option>
                        ))}
                      </Field.Select>
                    </Field.Root>

                    <LengthSliderField
                      label="Overall density"
                      value={theme.spacing.md}
                      min={0.5}
                      max={2}
                      step={0.125}
                      onChange={(val) => scaleSpacing(parseRem(val))}
                    />

                    <Collapsible.Root>
                      <Collapsible.Trigger variant="ghost" size="xs" width="full">
                        Fine-tune each step ▾
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <VStack gap="md" className={tabContentStyle.className}>
                          {SPACING_CONFIGS.map((item) => (
                            <LengthSliderField
                              key={item.key}
                              label={item.label}
                              value={theme.spacing[item.key]}
                              min={0.125}
                              max={4}
                              step={0.125}
                              onChange={(val) => updateSpacing(item.key, val)}
                            />
                          ))}
                        </VStack>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </VStack>
                </Tabs.Content>

                <Tabs.Content value="typography">
                  <VStack gap="lg" className={tabContentStyle.className}>
                    <Field.Root>
                      <Field.Label>Font pairing</Field.Label>
                      <Field.Select
                        size="sm"
                        value={
                          customFontsOpen
                            ? CUSTOM_FONT_VALUE
                            : (FONT_PRESETS.find((p) => p.sans === theme.fonts.sans)?.label ??
                              CUSTOM_FONT_VALUE)
                        }
                        onValueChange={(label) => {
                          if (label === CUSTOM_FONT_VALUE) {
                            setCustomFontsOpen(true);
                            return;
                          }
                          setCustomFontsOpen(false);
                          const preset = FONT_PRESETS.find((p) => p.label === label);
                          if (preset) {
                            loadGoogleFontsForStacks([preset.sans, preset.mono]);
                            setTheme((prev) => ({
                              ...prev,
                              fonts: { sans: preset.sans, mono: preset.mono },
                            }));
                          }
                        }}
                      >
                        {FONT_PRESETS.map((preset) => (
                          <Select.Option key={preset.label} value={preset.label}>
                            {preset.label}
                          </Select.Option>
                        ))}
                        <Select.Option value={CUSTOM_FONT_VALUE}>Custom</Select.Option>
                      </Field.Select>
                    </Field.Root>

                    <Collapsible.Root open={customFontsOpen} onOpenChange={setCustomFontsOpen}>
                      <Collapsible.Trigger variant="ghost" size="xs" width="full">
                        Custom font stacks ▾
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <VStack gap="md" className={tabContentStyle.className}>
                          <Field.Root>
                            <Field.Label>Sans-serif</Field.Label>
                            <Field.Input
                              size="sm"
                              value={theme.fonts.sans}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setTheme((prev) => ({
                                  ...prev,
                                  fonts: { ...prev.fonts, sans: e.target.value },
                                }))
                              }
                            />
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Monospace</Field.Label>
                            <Field.Input
                              size="sm"
                              value={theme.fonts.mono}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setTheme((prev) => ({
                                  ...prev,
                                  fonts: { ...prev.fonts, mono: e.target.value },
                                }))
                              }
                            />
                          </Field.Root>
                        </VStack>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </VStack>
                </Tabs.Content>
              </Tabs.Root>
            </VStack>
          </Card.Root>
        </aside>

        {/* Preview Showcase Area */}
        <div
          id="theme-preview"
          className={showcaseAreaStyle.className}
          data-theme="theme-builder-preview"
        >
          <Tabs.Root value={previewTab} onValueChange={setPreviewTab} variant="line">
            <Tabs.List>
              <Tabs.Trigger value="components">Components</Tabs.Trigger>
              <Tabs.Trigger value="palette">Palette</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="components">
              <VStack gap="xl">
                {/* Live Theme Scoped Preview Container */}
                <Surface bordered={false} level={previewSurfaceLevel} padding="lg">
                  <div data-intent-style={theme.intentStyle} className={fullWidthStyle.className}>
                    <VStack gap="xl">
                      <Header
                        size="md"
                        title="Theme preview"
                        description="Interactive showcase of forms, overlays, feedback alerts, data tables, and typography tokens."
                        actions={
                          <HStack gap="xs" wrap="wrap" align="center">
                            <Popover.Root>
                              <Popover.Trigger variant="secondary" size="sm">
                                Layout
                              </Popover.Trigger>
                              <Popover.Content size="md" placement="bottom-end">
                                <VStack gap="md">
                                  <VStack gap="sm">
                                    <Heading as="h4" size="xs">
                                      Canvas & Layout Options
                                    </Heading>
                                    <Text size="xs" color="muted">
                                      Test how components and surfaces adapt across card widths and
                                      elevation levels.
                                    </Text>
                                  </VStack>

                                  <Divider />

                                  <VStack gap="sm" align="start">
                                    <Text type="label">Card min width</Text>
                                    <ButtonGroup.Root
                                      size="xs"
                                      value={previewCardMinWidth}
                                      onValueChange={(val) => {
                                        if (val === '300px' || val === '380px' || val === '480px') {
                                          setPreviewCardMinWidth(val);
                                        }
                                      }}
                                    >
                                      <ButtonGroup.Item value="300px">Compact</ButtonGroup.Item>
                                      <ButtonGroup.Item value="380px">Standard</ButtonGroup.Item>
                                      <ButtonGroup.Item value="480px">Wide</ButtonGroup.Item>
                                    </ButtonGroup.Root>
                                  </VStack>

                                  <VStack gap="sm" align="start">
                                    <Text type="label">Canvas surface level</Text>
                                    <ButtonGroup.Root
                                      size="xs"
                                      value={String(previewSurfaceLevel)}
                                      onValueChange={(val) => {
                                        if (val === '0') setPreviewSurfaceLevel(0);
                                        if (val === '1') setPreviewSurfaceLevel(1);
                                        if (val === '2') setPreviewSurfaceLevel(2);
                                      }}
                                    >
                                      <ButtonGroup.Item value="0">Level 0</ButtonGroup.Item>
                                      <ButtonGroup.Item value="1">Level 1</ButtonGroup.Item>
                                      <ButtonGroup.Item value="2">Level 2</ButtonGroup.Item>
                                    </ButtonGroup.Root>
                                  </VStack>

                                  <VStack gap="sm" align="start">
                                    <Text type="label">Card surface level</Text>
                                    <ButtonGroup.Root
                                      size="xs"
                                      value={String(previewCardLevel)}
                                      onValueChange={(val) => {
                                        if (val === '0') setPreviewCardLevel(0);
                                        if (val === '1') setPreviewCardLevel(1);
                                        if (val === '2') setPreviewCardLevel(2);
                                      }}
                                    >
                                      <ButtonGroup.Item value="0">Level 0</ButtonGroup.Item>
                                      <ButtonGroup.Item value="1">Level 1</ButtonGroup.Item>
                                      <ButtonGroup.Item value="2">Level 2</ButtonGroup.Item>
                                    </ButtonGroup.Root>
                                  </VStack>
                                </VStack>
                              </Popover.Content>
                            </Popover.Root>

                            <Dialog.Root>
                              <Dialog.Trigger variant="secondary" size="sm">
                                View CSS
                              </Dialog.Trigger>
                              <Dialog.Content size="xl">
                                <VStack gap="lg">
                                  <Dialog.Header>
                                    <Dialog.Title>Generated Theme CSS</Dialog.Title>
                                    <Dialog.Description>
                                      Drop this CSS block into your global stylesheet or apply{' '}
                                      <Code>{`data-theme="${theme.name || 'my-theme'}"`}</Code> to
                                      any container.
                                    </Dialog.Description>
                                  </Dialog.Header>

                                  <Surface
                                    level={1}
                                    padding="md"
                                    radius="md"
                                    className={codeSurfaceStyle.className}
                                  >
                                    <pre className={preStyle.className}>
                                      <code>{generatedCss.exportCss}</code>
                                    </pre>
                                    <CopyButton
                                      text={generatedCss.exportCss}
                                      className={codeCopyButtonStyle.className}
                                    />
                                  </Surface>

                                  <HStack justify="between" gap="sm" wrap="wrap">
                                    <Button variant="outline" size="sm" onClick={handleDownloadCss}>
                                      Download .css
                                    </Button>
                                    <Dialog.Close variant="ghost" size="sm">
                                      Close
                                    </Dialog.Close>
                                  </HStack>
                                </VStack>
                              </Dialog.Content>
                            </Dialog.Root>

                            <Menu.Root>
                              <Menu.Trigger variant="primary" size="sm">
                                {copied ? '✓ Copied!' : 'Export ▾'}
                              </Menu.Trigger>
                              <Menu.Content placement="bottom-end">
                                <Menu.Group>
                                  <Menu.Label>CSS</Menu.Label>
                                  <Menu.Item onSelect={handleCopy}>Copy CSS</Menu.Item>
                                  <Menu.Item onSelect={handleDownloadCss}>Download .css</Menu.Item>
                                </Menu.Group>
                                <Menu.Separator />
                                <Menu.Group>
                                  <Menu.Label>JSON</Menu.Label>
                                  <Menu.Item onSelect={handleCopyJson}>Copy JSON</Menu.Item>
                                  <Menu.Item onSelect={handleDownloadJson}>
                                    Download .json
                                  </Menu.Item>
                                  <Menu.Item onSelect={() => setImportOpen(true)}>
                                    Import .json…
                                  </Menu.Item>
                                </Menu.Group>
                              </Menu.Content>
                            </Menu.Root>

                            <Dialog.Root open={importOpen} onOpenChange={setImportOpen}>
                              <Dialog.Content size="lg">
                                <VStack gap="lg">
                                  <Dialog.Header>
                                    <Dialog.Title>Import theme JSON</Dialog.Title>
                                    <Dialog.Description>
                                      Paste a theme exported from this builder, or load a{' '}
                                      <Code>.theme.json</Code> file. Missing values fall back to the
                                      defaults.
                                    </Dialog.Description>
                                  </Dialog.Header>

                                  <Field.Root isInvalid={importError !== null}>
                                    <Field.Label>Theme JSON</Field.Label>
                                    <Field.Textarea
                                      rows={12}
                                      value={importText}
                                      placeholder='{ "name": "my-theme", "colors": { "primary": "#2563eb" } }'
                                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                        setImportText(e.target.value);
                                        setImportError(null);
                                      }}
                                    />
                                    <Field.Error>{importError}</Field.Error>
                                  </Field.Root>

                                  <HStack justify="between" align="center" gap="sm" wrap="wrap">
                                    <input
                                      type="file"
                                      accept=".json,application/json"
                                      aria-label="Load theme JSON file"
                                      onChange={handleImportFile}
                                    />
                                    <HStack gap="xs" wrap="wrap">
                                      <Dialog.Close variant="ghost" size="sm">
                                        Cancel
                                      </Dialog.Close>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        disabled={importText.trim() === ''}
                                        onClick={handleImportApply}
                                      >
                                        Apply theme
                                      </Button>
                                    </HStack>
                                  </HStack>
                                </VStack>
                              </Dialog.Content>
                            </Dialog.Root>
                          </HStack>
                        }
                      />

                      {/* UI Component Showcase Section: 6 Balanced Representative Cards */}
                      <Grid.Root
                        columns="auto-fit"
                        minColumnWidth={previewCardMinWidth}
                        gap="lg"
                        align="stretch"
                      >
                        {/* Card 1: Registration, Select & Field Validation */}
                        <Card.Root level={previewCardLevel} padding="lg">
                          <VStack gap="lg" flex={1}>
                            <Card.Header
                              size="md"
                              title="Create Workspace"
                              description="Inputs, customizable select, links, and error validation."
                              actions={
                                <Badge variant="secondary" intent="primary">
                                  Forms
                                </Badge>
                              }
                            />

                            <Divider />

                            <Card.Body gap="md">
                              <form>
                                <Field.Group>
                                  <Field.Root>
                                    <Field.Label>Work Email</Field.Label>
                                    <Field.Input
                                      type="email"
                                      placeholder="alex@company.com"
                                      defaultValue="alex@company.com"
                                    />
                                    <Field.Description>
                                      Used for workspace invitations and security notices.
                                    </Field.Description>
                                  </Field.Root>

                                  <Field.Root id="power-level">
                                    <Field.Label>Power Level</Field.Label>
                                    <Field.Slider
                                      min={0}
                                      max={100}
                                      step={1}
                                      defaultValue={50}
                                      onChange={(e) => {
                                        if (!e.currentTarget.form) {
                                          return;
                                        }
                                        const output =
                                          e.currentTarget.form.elements.namedItem('valueDisplay');

                                        if (!output) {
                                          return;
                                        }

                                        (output as HTMLOutputElement).value = e.currentTarget.value;
                                      }}
                                    />
                                    <Field.Description>
                                      Level{' '}
                                      <output name="valueDisplay" htmlFor="power-level">
                                        50
                                      </output>
                                    </Field.Description>
                                  </Field.Root>

                                  <Field.Root isInvalid>
                                    <Field.Label>Threshold (Error State)</Field.Label>
                                    <Field.Slider defaultValue={20} />
                                    <Field.Error>Value is below minimum requirement.</Field.Error>
                                  </Field.Root>

                                  <Field.Root>
                                    <Field.Label>Deployment Region</Field.Label>
                                    <Field.Select defaultValue="ap-southeast-2">
                                      <Select.OptGroup label="Asia Pacific">
                                        <Select.Option value="ap-southeast-2">
                                          Sydney (ap-southeast-2)
                                        </Select.Option>
                                        <Select.Option value="ap-northeast-1">
                                          Tokyo (ap-northeast-1)
                                        </Select.Option>
                                      </Select.OptGroup>
                                      <Select.OptGroup label="North America & Europe">
                                        <Select.Option value="us-east-1">
                                          Virginia (us-east-1)
                                        </Select.Option>
                                        <Select.Option value="eu-central-1">
                                          Frankfurt (eu-central-1)
                                        </Select.Option>
                                      </Select.OptGroup>
                                    </Field.Select>
                                  </Field.Root>

                                  <Field.Root isInvalid>
                                    <Field.Label>Workspace Handle</Field.Label>
                                    <Field.Input defaultValue="cumulo design" />
                                    <Field.Error>
                                      Handles may only contain lowercase letters, numbers, and
                                      hyphens.
                                    </Field.Error>
                                  </Field.Root>

                                  <Field.Root direction="row" gap="xs" align="center">
                                    <Field.Checkbox defaultChecked />
                                    <Field.Label>
                                      I accept the <Link href="#theme-preview">Terms</Link> and{' '}
                                      <Link href="#theme-preview" variant="subtle">
                                        Privacy Policy
                                      </Link>
                                    </Field.Label>
                                  </Field.Root>
                                </Field.Group>
                              </form>
                            </Card.Body>

                            <Card.Footer justify="between" gap="sm" wrap="wrap">
                              <Button variant="ghost" size="sm">
                                Sign In Instead
                              </Button>
                              <Button variant="primary" size="sm">
                                Create Workspace
                              </Button>
                            </Card.Footer>
                          </VStack>
                        </Card.Root>

                        {/* Card 2: Preferences, RadioGroup & Collapsible */}
                        <Card.Root level={previewCardLevel} padding="lg">
                          <VStack gap="lg" flex={1}>
                            <Card.Header
                              size="md"
                              title="Account Preferences"
                              description="Radio groups, switches, textarea, and collapsible disclosure."
                              actions={
                                <Badge variant="secondary" intent="success">
                                  Settings
                                </Badge>
                              }
                            />

                            <Divider />

                            <Card.Body gap="md">
                              <Field.Group>
                                <Field.Root>
                                  <Field.Label>Notification Routing</Field.Label>
                                  <Field.RadioGroup
                                    size="sm"
                                    defaultValue="mentions"
                                    orientation="vertical"
                                    wrap="wrap"
                                  >
                                    <Field.Root direction="row" gap="xs" align="center">
                                      <Field.Radio value="all" />
                                      <Field.Label>All activity</Field.Label>
                                    </Field.Root>
                                    <Field.Root direction="row" gap="xs" align="center">
                                      <Field.Radio value="mentions" />
                                      <Field.Label>Mentions</Field.Label>
                                    </Field.Root>
                                    <Field.Root direction="row" gap="xs" align="center">
                                      <Field.Radio value="urgent" />
                                      <Field.Label>Urgent</Field.Label>
                                    </Field.Root>
                                  </Field.RadioGroup>
                                </Field.Root>

                                <Field.Root>
                                  <Field.Label>Public Bio</Field.Label>
                                  <Field.Textarea
                                    rows={2}
                                    defaultValue="Frontend design system engineer passionate about accessible interfaces and mathematical CSS color spaces."
                                  />
                                </Field.Root>

                                <Field.Root>
                                  <HStack justify="between">
                                    <VStack gap="sm" align="start">
                                      <Field.Label>Two-Factor Authentication</Field.Label>
                                      <Field.Description>
                                        Require hardware passkey on new devices
                                      </Field.Description>
                                    </VStack>
                                    <Field.Switch defaultChecked />
                                  </HStack>
                                </Field.Root>

                                <Collapsible.Root align="start" gap="sm">
                                  <Collapsible.Trigger variant="secondary" size="xs">
                                    Developer Webhook Secret ▾
                                  </Collapsible.Trigger>
                                  <Collapsible.Content width="full">
                                    <Input
                                      leading="Signing key"
                                      value="whsec_9f8a7b6c5d4e"
                                      readOnly
                                    />
                                  </Collapsible.Content>
                                </Collapsible.Root>
                              </Field.Group>
                            </Card.Body>

                            <Card.Footer justify="end" gap="sm" wrap="wrap">
                              <Button variant="outline" intent="error" size="sm">
                                Discard
                              </Button>
                              <Button variant="primary" size="sm">
                                Save Changes
                              </Button>
                            </Card.Footer>
                          </VStack>
                        </Card.Root>

                        {/* Card 3: Alerts & Status Feedback */}
                        <Card.Root level={previewCardLevel} padding="lg">
                          <VStack gap="lg" flex={1}>
                            <Card.Header
                              size="md"
                              title="Alerts & Status"
                              description="Semantic live-region alerts and busy indicators."
                              actions={
                                <ButtonGroup.Root
                                  size="xs"
                                  value={alertVariant}
                                  onValueChange={(val) => {
                                    if (
                                      val === 'secondary' ||
                                      val === 'primary' ||
                                      val === 'outline'
                                    ) {
                                      setAlertVariant(val);
                                    }
                                  }}
                                >
                                  <ButtonGroup.Item value="secondary">Soft</ButtonGroup.Item>
                                  <ButtonGroup.Item value="primary">Solid</ButtonGroup.Item>
                                  <ButtonGroup.Item value="outline">Outline</ButtonGroup.Item>
                                </ButtonGroup.Root>
                              }
                            />

                            <Divider />

                            <Card.Body gap="sm">
                              <Alert.Root intent="info" variant={alertVariant}>
                                <Alert.Icon />
                                <Alert.Content>
                                  <Alert.Title>Design tokens synchronized</Alert.Title>
                                  <Alert.Description>
                                    OKLCH relative color palettes generated across 10 steps.
                                  </Alert.Description>
                                </Alert.Content>
                              </Alert.Root>

                              <Alert.Root intent="success" variant={alertVariant}>
                                <Alert.Icon />
                                <Alert.Content>
                                  <Alert.Title>Static CSS extracted</Alert.Title>
                                  <Alert.Description>
                                    Zero-runtime bundle compiled in 38ms with zero side effects.
                                  </Alert.Description>
                                </Alert.Content>
                              </Alert.Root>

                              <Alert.Root intent="warning" variant={alertVariant}>
                                <Alert.Icon />
                                <Alert.Content>
                                  <Alert.Title>Contrast threshold notice</Alert.Title>
                                  <Alert.Description>
                                    Verify legibility when contrast scale is below 0.85x.
                                  </Alert.Description>
                                </Alert.Content>
                              </Alert.Root>

                              <Alert.Root intent="error" variant={alertVariant}>
                                <Alert.Icon />
                                <Alert.Content>
                                  <Alert.Title>Webhook delivery failed</Alert.Title>
                                  <Alert.Description>
                                    Endpoint timed out after 3 automatic retry attempts.
                                  </Alert.Description>
                                </Alert.Content>
                              </Alert.Root>
                            </Card.Body>

                            <Card.Footer justify="between" gap="sm" wrap="wrap">
                              <HStack gap="xs" align="center">
                                <Spinner size="xs" intent="primary" />
                                <Spinner size="xs" intent="success" />
                                <Spinner size="xs" intent="warning" />
                                <Spinner size="xs" intent="error" />
                                <Text type="caption" color="muted">
                                  Intent spinners
                                </Text>
                              </HStack>
                              <Button variant="secondary" size="xs" loading>
                                Syncing
                              </Button>
                            </Card.Footer>
                          </VStack>
                        </Card.Root>

                        {/* Card 4: Metrics, Primary Surface & Data Table */}
                        <Card.Root level={previewCardLevel} padding="lg">
                          <VStack gap="lg" flex={1}>
                            <Card.Header
                              size="md"
                              title="Team & Subscriptions"
                              description="Interactive data table, badges, and accented surface."
                              actions={
                                <Badge variant="primary" intent="success">
                                  +18.4% MRR
                                </Badge>
                              }
                            />

                            <Card.Body gap="md">
                              <HStack justify="between" align="baseline" wrap="wrap" gap="sm">
                                <VStack gap="sm" align="baseline">
                                  <Heading as="h3" size="2xl">
                                    $38,450
                                  </Heading>
                                  <Text type="caption" color="muted">
                                    Total active recurring billing
                                  </Text>
                                </VStack>
                                <Surface variant="primary" padding="xs" radius="md">
                                  <Text size="xs" weight="medium">
                                    18 / 25 Enterprise seats active
                                  </Text>
                                </Surface>
                              </HStack>

                              <Table.Root variant="default" interactive>
                                <Table.Header>
                                  <Table.Row>
                                    <Table.Head>Member</Table.Head>
                                    <Table.Head>Role</Table.Head>
                                    <Table.Head>Status</Table.Head>
                                  </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                  <Table.Row>
                                    <Table.Cell>Alex Rivera</Table.Cell>
                                    <Table.Cell>
                                      <Badge variant="primary">Admin</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                      <Badge variant="secondary" intent="success">
                                        Active
                                      </Badge>
                                    </Table.Cell>
                                  </Table.Row>
                                  <Table.Row>
                                    <Table.Cell>Morgan Blake</Table.Cell>
                                    <Table.Cell>
                                      <Badge variant="secondary">Editor</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                      <Badge variant="secondary" intent="warning">
                                        Pending
                                      </Badge>
                                    </Table.Cell>
                                  </Table.Row>
                                  <Table.Row>
                                    <Table.Cell>Taylor Reed</Table.Cell>
                                    <Table.Cell>
                                      <Badge variant="outline">Viewer</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                      <Badge variant="secondary" intent="error">
                                        Paused
                                      </Badge>
                                    </Table.Cell>
                                  </Table.Row>
                                </Table.Body>
                              </Table.Root>
                            </Card.Body>

                            <Card.Footer justify="between" gap="sm" wrap="wrap">
                              <Text type="caption" color="muted">
                                3 members displayed
                              </Text>
                              <Button variant="secondary" size="sm">
                                Manage Team
                              </Button>
                            </Card.Footer>
                          </VStack>
                        </Card.Root>

                        {/* Card 5: Interactive Primitives & Top-Layer Overlays */}
                        <Card.Root level={previewCardLevel} padding="lg">
                          <VStack gap="lg" flex={1}>
                            <Card.Header
                              size="md"
                              title="Primitives & Overlays"
                              description="Intent buttons, badges, menus, popovers, and modal dialog."
                              actions={
                                <Badge variant="secondary" intent="warning">
                                  Overlays
                                </Badge>
                              }
                            />

                            <Divider />

                            <Card.Body gap="md">
                              {/* Button Intents - directly showcases solid vs pastel styling */}
                              <VStack gap="sm" align="start">
                                <Text type="label">Button intents</Text>
                                <HStack gap="xs" wrap="wrap">
                                  <Button size="sm" variant="primary" intent="primary">
                                    Primary
                                  </Button>
                                  <Button size="sm" variant="primary" intent="success">
                                    Success
                                  </Button>
                                  <Button size="sm" variant="primary" intent="warning">
                                    Warning
                                  </Button>
                                  <Button size="sm" variant="primary" intent="error">
                                    Error
                                  </Button>
                                  <Button size="sm" variant="primary" intent="info">
                                    Info
                                  </Button>
                                </HStack>
                              </VStack>

                              {/* Button Variants */}
                              <VStack gap="sm" align="start">
                                <Text type="label">Button variants & states</Text>
                                <HStack gap="xs" wrap="wrap">
                                  <Button size="sm" variant="secondary">
                                    Secondary
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Outline
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    Ghost
                                  </Button>
                                  <Button size="sm" variant="primary" loading>
                                    Saving
                                  </Button>
                                </HStack>
                              </VStack>

                              {/* Badges across all intents */}
                              <VStack gap="sm" align="start">
                                <Text type="label">Badge intents</Text>
                                <HStack gap="xs" wrap="wrap">
                                  <Badge variant="primary" intent="primary">
                                    Primary
                                  </Badge>
                                  <Badge variant="primary" intent="success">
                                    Success
                                  </Badge>
                                  <Badge variant="primary" intent="warning">
                                    Warning
                                  </Badge>
                                  <Badge variant="primary" intent="error">
                                    Error
                                  </Badge>
                                  <Badge variant="primary" intent="info">
                                    Info
                                  </Badge>
                                  <Badge variant="outline">Outline</Badge>
                                </HStack>
                              </VStack>
                            </Card.Body>

                            <Divider />

                            {/* Native Top-Layer Overlays */}
                            <Card.Footer justify="between" gap="xs" wrap="wrap">
                              <HStack gap="xs" wrap="wrap">
                                <Tooltip.Root>
                                  <Tooltip.Trigger variant="outline" size="sm">
                                    Tooltip
                                  </Tooltip.Trigger>
                                  <Tooltip.Content>Top-layer CSS Anchor Tooltip</Tooltip.Content>
                                </Tooltip.Root>

                                <Popover.Root>
                                  <Popover.Trigger variant="outline" size="sm">
                                    Popover
                                  </Popover.Trigger>
                                  <Popover.Content size="sm">
                                    <VStack gap="sm">
                                      <Heading as="h4" size="xs">
                                        Anchored Popover
                                      </Heading>
                                      <Text size="xs" color="muted">
                                        Positioned natively with CSS Anchor Positioning and{' '}
                                        <Code>popover=&quot;auto&quot;</Code>.
                                      </Text>
                                    </VStack>
                                  </Popover.Content>
                                </Popover.Root>

                                <Menu.Root>
                                  <Menu.Trigger variant="outline" size="sm">
                                    Menu ▾
                                  </Menu.Trigger>
                                  <Menu.Content>
                                    <Menu.Item shortcut={<Kbd size="xs">⌘D</Kbd>}>
                                      Duplicate
                                    </Menu.Item>
                                    <Menu.Item shortcut={<Kbd size="xs">⌘E</Kbd>}>
                                      Export JSON
                                    </Menu.Item>
                                    <Menu.Separator />
                                    <Menu.Item intent="error" shortcut={<Kbd size="xs">⌫</Kbd>}>
                                      Delete Item
                                    </Menu.Item>
                                  </Menu.Content>
                                </Menu.Root>
                              </HStack>

                              <Dialog.Root>
                                <Dialog.Trigger variant="secondary" size="sm">
                                  Modal Dialog
                                </Dialog.Trigger>
                                <Dialog.Content>
                                  <VStack gap="lg">
                                    <Dialog.Header>
                                      <Dialog.Title>Custom Theme Modal</Dialog.Title>
                                      <Dialog.Description>
                                        This is a native HTML5 top-layer dialog styled with the
                                        active theme tokens.
                                      </Dialog.Description>
                                    </Dialog.Header>

                                    <Alert.Root intent="info" variant="secondary">
                                      <Alert.Icon />
                                      <Alert.Content>
                                        <Alert.Title>Top-Layer Inheritance</Alert.Title>
                                        <Alert.Description>
                                          Dialogs and popovers inherit custom theme variables
                                          directly from their ancestor scope.
                                        </Alert.Description>
                                      </Alert.Content>
                                    </Alert.Root>

                                    <HStack justify="end" gap="sm" wrap="wrap">
                                      <Dialog.Close variant="ghost" size="sm">
                                        Dismiss
                                      </Dialog.Close>
                                      <Dialog.Close variant="primary" size="sm">
                                        Confirm
                                      </Dialog.Close>
                                    </HStack>
                                  </VStack>
                                </Dialog.Content>
                              </Dialog.Root>
                            </Card.Footer>
                          </VStack>
                        </Card.Root>
                      </Grid.Root>
                    </VStack>
                  </div>
                </Surface>
              </VStack>
            </Tabs.Content>
            <Tabs.Content value="palette">
              <Card.Root level={0} padding="lg">
                <VStack gap="lg">
                  <Card.Header
                    size="md"
                    title="Color Palette Shades"
                    description="50–900 OKLCH stepped scales calculated via chroma curves and relative color syntax from the seed colors."
                  />
                  <Divider />
                  <ColorTokens />
                </VStack>
              </Card.Root>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
