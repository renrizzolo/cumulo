'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createTheme, createThemeContract, cx, style } from '@cumulo/css';
import {
  Surface,
  Card,
  Button,
  Badge,
  Heading,
  Text,
  Divider,
  Code,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Field,
  Header,
  HStack,
  VStack,
  ThemeToggle,
  vars,
  FieldGroup,
  FieldLabel,
  FieldInput,
  ButtonGroup,
} from '@cumulo/core';
import { ColorTokens } from './ColorTokens';

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
    '(min-width: 1500px)': {
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
    top: '1rem',
    maxHeight: 'calc(100vh - 2rem)',
    overflowY: 'auto',
    '@media': {
      '(max-width: 1500px)': {
        flex: '1 1 100%',
        width: '100%',
        position: 'static',
        top: 'auto',
        maxHeight: 'none',
        overflowY: 'visible',
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

const cardGridStyle = style(
  {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: vars.spacing.lg,
    width: '100%',
    alignItems: 'stretch',
  },
  'theme-builder-card-grid',
);

const colorGridStyle = style(
  {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: vars.spacing.md,
    width: '100%',
  },
  'theme-color-grid',
);

const tokenGridStyle = style(
  {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: vars.spacing.sm,
    width: '100%',
  },
  'theme-token-grid',
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

const sliderInputStyle = style(
  {
    width: '100%',
    cursor: 'pointer',
  },
  'theme-slider-input',
);

const marginTopAutoStyle = style(
  {
    marginTop: 'auto',
  },
  'theme-margin-top-auto',
);

const codeSurfaceStyle = style(
  {
    // maxHeight: '350px',
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

export interface ThemeConfig {
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

type PresetTheme = (typeof PRESET_THEMES)[number];

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
}) {
  return (
    <Field>
      <FieldGroup gap="xs">
        <FieldLabel>{label}</FieldLabel>
        <HStack gap="xs" align="center" className={fullWidthStyle.className}>
          <input
            type="color"
            value={value.startsWith('#') ? value : defaultHex}
            onChange={(e) => onChange(colorKey, e.target.value)}
            className={colorInputStyle.className}
            aria-label={`${label} color picker`}
          />
          <FieldInput
            size="sm"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(colorKey, e.target.value)
            }
          />
        </HStack>
      </FieldGroup>
    </Field>
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

function ScaleSliderField({ label, code, value, min, max, step, onChange }: ScaleSliderFieldProps) {
  return (
    <Field>
      <HStack justify="between" align="center" className={fullWidthStyle.className}>
        <FieldLabel>
          {label}: {value}x
        </FieldLabel>
        <Code>{code}</Code>
      </HStack>
      <FieldInput
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value))}
        className={sliderInputStyle.className}
      />
    </Field>
  );
}

interface TokenInputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function TokenInputField({ label, value, onChange }: TokenInputFieldProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldInput
        size="sm"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </Field>
  );
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
  { key: 'xs', label: 'XS (8px)' },
  { key: 'sm', label: 'SM (12px)' },
  { key: 'md', label: 'MD (16px)' },
  { key: 'lg', label: 'LG (24px)' },
  { key: 'xl', label: 'XL (32px)' },
];

export function ThemeBuilder(): React.JSX.Element {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [activePresetId, setActivePresetId] = useState<PresetTheme['id']>('default');
  const [localColors, setLocalColors] = useState<ThemeConfig['colors']>(DEFAULT_THEME.colors);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('colors');
  const debounceTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updateColor = useCallback((key: keyof ThemeConfig['colors'], value: string) => {
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
    (key: keyof ThemeConfig['colors'], value: string) => {
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

  const updateScale = (key: keyof ThemeConfig['scales'], value: number) => {
    setTheme((prev) => ({
      ...prev,
      scales: {
        ...prev.scales,
        [key]: value,
      },
    }));
  };

  const updateRadius = (key: keyof ThemeConfig['radii'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      radii: {
        ...prev.radii,
        [key]: value,
      },
    }));
  };

  const updateSpacing = (key: keyof ThemeConfig['spacing'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
  };

  const applyPreset = (preset: PresetTheme) => {
    setActivePresetId(preset.id);
    const nextColors = {
      ...theme.colors,
      ...preset.config.colors,
    };
    const nextFonts = {
      sans: preset.config.fonts?.sans ?? DEFAULT_THEME.fonts.sans,
      mono: preset.config.fonts?.mono ?? DEFAULT_THEME.fonts.mono,
    };
    loadGoogleFontsForStacks([nextFonts.sans, nextFonts.mono]);
    setLocalColors(nextColors);
    setTheme((prev) => ({
      ...prev,
      ...preset.config,
      intentStyle: preset.config.intentStyle ?? 'solid',
      colors: nextColors,
      scales: {
        ...prev.scales,
        lightness: 0,
        ...preset.config.scales,
      },
      radii: {
        ...prev.radii,
        ...preset.config.radii,
      },
      fonts: nextFonts,
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGoogleFontsForStacks([theme.fonts.sans, theme.fonts.mono]);
    }, 250);
    return () => clearTimeout(timer);
  }, [theme.fonts.sans, theme.fonts.mono]);

  const generatedCss = useMemo(() => {
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

    return `${fontImport}${selector} {
  /* Seed Colors */
  --color-primary-base: ${theme.colors.primary};
  --color-success-base: ${theme.colors.success};
  --color-warning-base: ${theme.colors.warning};
  --color-error-base: ${theme.colors.error};
  --color-info-base: ${theme.colors.info};
  --color-grey-base: ${theme.colors.grey};

  /* Palette Tuning */
  --theme-chroma-scale: ${theme.scales.chroma};
  --theme-contrast-scale: ${theme.scales.contrast};
  --theme-lightness-offset: ${theme.scales.lightness};${pastelOverrides}

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
  --theme-font-mono: ${theme.fonts.mono};
}`;
  }, [theme]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCss);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [generatedCss]);

  const handleReset = () => {
    setActivePresetId('default');
    setLocalColors(DEFAULT_THEME.colors);
    setTheme(DEFAULT_THEME);
  };

  return (
    <div className={cx(rootStyle.className, sidebarTheme.className)}>
      {/* Dynamic Scoped Styles for the preview container */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            [data-theme='theme-builder-preview'] {
              --color-primary-base: ${theme.colors.primary};
              --color-success-base: ${theme.colors.success};
              --color-warning-base: ${theme.colors.warning};
              --color-error-base: ${theme.colors.error};
              --color-info-base: ${theme.colors.info};
              --color-grey-base: ${theme.colors.grey};
              --theme-chroma-scale: ${theme.scales.chroma};
              --theme-contrast-scale: ${theme.scales.contrast};
              --theme-lightness-offset: ${theme.scales.lightness};
              --theme-radius-control: ${theme.radii.control};
              --theme-radius-md: ${theme.radii.md};
              --theme-radius-lg: ${theme.radii.lg};
              --theme-radius-xl: ${theme.radii.xl};
              --theme-radius-2xl: ${theme.radii['2xl']};
              --theme-spacing-xs: ${theme.spacing.xs};
              --theme-spacing-sm: ${theme.spacing.sm};
              --theme-spacing-md: ${theme.spacing.md};
              --theme-spacing-lg: ${theme.spacing.lg};
              --theme-spacing-xl: ${theme.spacing.xl};
              --theme-font-sans: ${theme.fonts.sans};
              --theme-font-mono: ${theme.fonts.mono};
            }
          `,
        }}
      />

      {/* Main Two-Column Layout: Left Preview Showcase & Right Sticky Sidebar */}
      <div className={rootGridStyle.className}>
        {/* Controls Sidebar: Sticky on large viewports, full-width at top on small viewports */}
        <aside className={sidebarStyle.className}>
          <VStack gap="lg">
            {/* Presets & Actions Toolbar Card */}
            <Card level={0} padding="md">
              <VStack gap="lg">
                <HStack justify="between" align="center">
                  <HStack gap="xs" align="center">
                    <ThemeToggle />
                    <Button size="sm" variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                  </HStack>
                  <Button size="sm" variant="primary" onClick={handleCopy}>
                    {copied ? '✓ Copied!' : 'Copy CSS'}
                  </Button>
                </HStack>

                <Divider />

                {/* Preset Button Group */}
                <ButtonGroup.Root
                  wrap="wrap"
                  value={activePresetId}
                  onValueChange={(id) => {
                    const p = PRESET_THEMES.find((preset) => preset.id === id);
                    if (p) applyPreset(p);
                  }}
                  orientation="vertical"
                >
                  {PRESET_THEMES.map((preset) => (
                    <ButtonGroup.Item key={preset.id} value={preset.id} size="sm" width="full">
                      <HStack gap="xs" justify="between" flex="auto" align="center">
                        <span>{preset.name}</span>
                        <Badge
                          variant="primary"
                          style={{
                            color: `contrast-color(${preset.config.colors?.primary})`,
                            backgroundColor: preset.config.colors?.primary,
                          }}
                        >
                          {preset.badge}
                        </Badge>
                      </HStack>
                    </ButtonGroup.Item>
                  ))}
                </ButtonGroup.Root>
              </VStack>
            </Card>

            {/* Configuration Controls Card */}
            <Card level={0} padding="md">
              <VStack gap="lg">
                <Field>
                  <FieldGroup direction="row" align="center" justify="between">
                    <FieldLabel>Theme ID</FieldLabel>

                    <FieldInput
                      size="sm"
                      value={theme.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTheme((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. brand-theme"
                    />
                  </FieldGroup>
                </Field>

                <Tabs
                  defaultValue={activeTab}
                  onValueChange={(val: string) => setActiveTab(val)}
                  variant="line"
                >
                  <TabsList>
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="radii">Radii</TabsTrigger>
                    <TabsTrigger value="spacing">Spacing</TabsTrigger>
                    <TabsTrigger value="typography">Typography</TabsTrigger>
                  </TabsList>

                  {/* Colors & Tuning Tab */}
                  <TabsContent value="colors">
                    <VStack gap="lg" className={tabContentStyle.className}>
                      <div className={colorGridStyle.className}>
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
                      </div>

                      {/* Intent Style */}
                      <VStack gap="sm" align="start">
                        <Text type="label">Intent style</Text>
                        <ButtonGroup.Root
                          wrap="wrap"
                          direction="row"
                          value={theme.intentStyle}
                          onValueChange={(val) =>
                            setTheme((prev) => ({
                              ...prev,
                              intentStyle: val,
                            }))
                          }
                        >
                          <ButtonGroup.Item value="solid">Solid</ButtonGroup.Item>
                          <ButtonGroup.Item value="pastel">Pastel</ButtonGroup.Item>
                          <ButtonGroup.Item value="pastel-dark">
                            Pastel (dark mode only)
                          </ButtonGroup.Item>
                        </ButtonGroup.Root>
                      </VStack>

                      <Divider />

                      {/* Chroma, Contrast & Lightness Tuning */}
                      <VStack gap="lg">
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
                          label="Lightness Shift"
                          code="--theme-lightness-offset"
                          value={theme.scales.lightness}
                          min={-0.15}
                          max={0.15}
                          step={0.01}
                          onChange={(val) => updateScale('lightness', Math.round(val * 100) / 100)}
                        />
                      </VStack>
                    </VStack>
                  </TabsContent>

                  {/* Border Radii Tab */}
                  <TabsContent value="radii">
                    <VStack gap="lg" className={tabContentStyle.className}>
                      <ButtonGroup.Root
                        wrap="wrap"
                        value={
                          RADIUS_PRESETS.find(
                            (p) =>
                              p.values.control === theme.radii.control &&
                              p.values.md === theme.radii.md &&
                              p.values.lg === theme.radii.lg,
                          )?.label ?? ''
                        }
                        onValueChange={(label) => {
                          const preset = RADIUS_PRESETS.find((p) => p.label === label);
                          if (preset) {
                            setTheme((prev) => ({
                              ...prev,
                              radii: { ...preset.values },
                            }));
                          }
                        }}
                      >
                        {RADIUS_PRESETS.map((preset) => (
                          <ButtonGroup.Item key={preset.label} value={preset.label} size="sm">
                            {preset.label}
                          </ButtonGroup.Item>
                        ))}
                      </ButtonGroup.Root>

                      <Divider />

                      <div className={tokenGridStyle.className}>
                        {RADII_CONFIGS.map((item) => (
                          <TokenInputField
                            key={item.key}
                            label={item.label}
                            value={theme.radii[item.key]}
                            onChange={(val) => updateRadius(item.key, val)}
                          />
                        ))}
                      </div>
                    </VStack>
                  </TabsContent>

                  {/* Spacing Scale Tab */}
                  <TabsContent value="spacing">
                    <VStack gap="lg" className={tabContentStyle.className}>
                      <ButtonGroup.Root
                        wrap="wrap"
                        value={
                          SPACING_PRESETS.find(
                            (p) =>
                              p.values.xs === theme.spacing.xs &&
                              p.values.md === theme.spacing.md &&
                              p.values.lg === theme.spacing.lg,
                          )?.label ?? ''
                        }
                        onValueChange={(label) => {
                          const preset = SPACING_PRESETS.find((p) => p.label === label);
                          if (preset) {
                            setTheme((prev) => ({
                              ...prev,
                              spacing: { ...preset.values },
                            }));
                          }
                        }}
                      >
                        {SPACING_PRESETS.map((preset) => (
                          <ButtonGroup.Item key={preset.label} value={preset.label} size="sm">
                            {preset.label}
                          </ButtonGroup.Item>
                        ))}
                      </ButtonGroup.Root>

                      <Divider />

                      <div className={tokenGridStyle.className}>
                        {SPACING_CONFIGS.map((item) => (
                          <TokenInputField
                            key={item.key}
                            label={item.label}
                            value={theme.spacing[item.key]}
                            onChange={(val) => updateSpacing(item.key, val)}
                          />
                        ))}
                      </div>
                    </VStack>
                  </TabsContent>

                  {/* Typography Tab */}
                  <TabsContent value="typography">
                    <VStack gap="lg" className={tabContentStyle.className}>
                      <ButtonGroup.Root
                        wrap="wrap"
                        value={FONT_PRESETS.find((p) => p.sans === theme.fonts.sans)?.label ?? ''}
                        onValueChange={(label) => {
                          const preset = FONT_PRESETS.find((p) => p.label === label);
                          if (preset) {
                            loadGoogleFontsForStacks([preset.sans, preset.mono]);
                            setTheme((prev) => ({
                              ...prev,
                              fonts: {
                                sans: preset.sans,
                                mono: preset.mono,
                              },
                            }));
                          }
                        }}
                      >
                        {FONT_PRESETS.map((preset) => (
                          <ButtonGroup.Item key={preset.label} value={preset.label} size="sm">
                            {preset.label}
                          </ButtonGroup.Item>
                        ))}
                      </ButtonGroup.Root>

                      <Divider />

                      <VStack gap="lg">
                        <Field>
                          <FieldLabel>Sans-Serif Font Stack</FieldLabel>
                          <FieldInput
                            size="sm"
                            value={theme.fonts.sans}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setTheme((prev) => ({
                                ...prev,
                                fonts: { ...prev.fonts, sans: e.target.value },
                              }))
                            }
                          />
                        </Field>

                        <Field>
                          <FieldLabel>Monospace Font Stack</FieldLabel>
                          <FieldInput
                            size="sm"
                            value={theme.fonts.mono}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setTheme((prev) => ({
                                ...prev,
                                fonts: { ...prev.fonts, mono: e.target.value },
                              }))
                            }
                          />
                        </Field>
                      </VStack>
                    </VStack>
                  </TabsContent>
                </Tabs>
              </VStack>
            </Card>

            {/* Direct CSS Output Card with Copy */}
            <Card level={0} padding="lg">
              <VStack gap="lg">
                <Header
                  size="md"
                  title="Theme CSS"
                  description="Place this in your app's global CSS or inside a scoped container with data-theme."
                  actions={
                    <Button variant="primary" onClick={handleCopy}>
                      {copied ? '✓ Copied to Clipboard!' : 'Copy Theme CSS'}
                    </Button>
                  }
                />

                <Surface level={1} padding="md" radius="md" className={codeSurfaceStyle.className}>
                  <pre className={preStyle.className}>
                    <code>{generatedCss}</code>
                  </pre>
                </Surface>
              </VStack>
            </Card>
          </VStack>
        </aside>

        {/* Left Column: Preview Showcase Area */}
        <div className={showcaseAreaStyle.className}>
          <VStack gap="xl">
            {/* Live Theme Scoped Preview Container */}
            <Surface bordered={false} level={1} padding="lg">
              <div
                data-theme="theme-builder-preview"
                data-intent-style={theme.intentStyle}
                className={fullWidthStyle.className}
              >
                <VStack gap="xl">
                  {/* UI Component Showcase Section: 4 Balanced Representative Cards */}
                  <div className={cardGridStyle.className}>
                    {/* Card 1: Registration Form */}
                    <Card level={0} padding="lg">
                      <VStack gap="lg">
                        <Header
                          size="md"
                          title="Create Account"
                          description="Form inputs, descriptions, and state validation."
                          actions={
                            <Badge variant="secondary" intent="primary">
                              Form
                            </Badge>
                          }
                        />

                        <Divider />

                        <Field.Group>
                          <Field.Root>
                            <Field.Label>Email Address</Field.Label>
                            <Field.Input
                              type="email"
                              placeholder="alex@company.com"
                              defaultValue="alex@company.com"
                            />
                            <Field.Description>
                              We will never share your email address.
                            </Field.Description>
                          </Field.Root>

                          <Field.Root>
                            <Field.Label>Password</Field.Label>
                            <Field.Input type="password" defaultValue="secretPassword123" />
                          </Field.Root>

                          <Field.Root>
                            <HStack gap="xs" align="center">
                              <Field.Checkbox defaultChecked />
                              <Field.Label>I accept the terms and privacy policy</Field.Label>
                            </HStack>
                          </Field.Root>
                        </Field.Group>

                        <HStack
                          gap="sm"
                          align="center"
                          justify="between"
                          className={marginTopAutoStyle.className}
                        >
                          <Button variant="ghost" size="sm">
                            Sign In Instead
                          </Button>
                          <Button variant="primary" size="sm">
                            Create Account
                          </Button>
                        </HStack>
                      </VStack>
                    </Card>

                    {/* Card 2: Settings & Preferences */}
                    <Card level={0} padding="lg">
                      <VStack gap="lg">
                        <Header
                          size="md"
                          title="Account Preferences"
                          description="Switches, textareas, and secondary actions."
                          actions={
                            <Badge variant="secondary" intent="success">
                              Settings
                            </Badge>
                          }
                        />

                        <Divider />

                        <Field.Group>
                          <Field.Root>
                            <Field.Label>Public Bio</Field.Label>
                            <Field.Textarea
                              rows={3}
                              defaultValue="Frontend design system engineer passionate about accessible interfaces and mathematical CSS color spaces."
                            />
                          </Field.Root>

                          <Field.Root>
                            <HStack justify="between" align="start">
                              <VStack gap="xs">
                                <Field.Label>Two-Factor Authentication</Field.Label>
                                <Field.Description>
                                  Enhanced security for account logins
                                </Field.Description>
                              </VStack>
                              <Field.Switch defaultChecked />
                            </HStack>
                          </Field.Root>

                          <Field.Root>
                            <HStack justify="between" align="start">
                              <VStack gap="xs">
                                <Field.Label>Email Digest</Field.Label>
                                <Field.Description>
                                  Weekly product updates and reports
                                </Field.Description>
                              </VStack>
                              <Field.Switch defaultChecked />
                            </HStack>
                          </Field.Root>
                        </Field.Group>

                        <HStack
                          gap="sm"
                          align="center"
                          justify="end"
                          className={marginTopAutoStyle.className}
                        >
                          <Button variant="outline" intent="error" size="sm">
                            Discard
                          </Button>
                          <Button variant="primary" size="sm">
                            Save Changes
                          </Button>
                        </HStack>
                      </VStack>
                    </Card>

                    {/* Card 3: Metrics & Data Table */}
                    <Card level={0} padding="lg">
                      <VStack gap="lg">
                        <Header
                          size="md"
                          title="Team & Subscriptions"
                          description="Bordered data table and intent badges."
                          actions={
                            <Badge variant="primary" intent="success">
                              +18.4% MRR
                            </Badge>
                          }
                        />

                        <VStack gap="sm" align="baseline">
                          <Heading as="h3" size="2xl">
                            $38,450
                          </Heading>
                          <Text type="caption" color="muted">
                            Total active plan billing
                          </Text>
                        </VStack>

                        <Table variant="default" interactive>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Member</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Alex Rivera</TableCell>
                              <TableCell>
                                <Badge variant="primary">Admin</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" intent="success">
                                  Active
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Morgan Blake</TableCell>
                              <TableCell>
                                <Badge variant="secondary">Editor</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" intent="warning">
                                  Pending
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Taylor Reed</TableCell>
                              <TableCell>
                                <Badge variant="outline">Viewer</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" intent="error">
                                  Paused
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

                        <HStack
                          justify="between"
                          align="center"
                          className={marginTopAutoStyle.className}
                        >
                          <Text type="caption" color="muted">
                            3 members active
                          </Text>
                          <Button variant="secondary" size="sm">
                            Manage Team
                          </Button>
                        </HStack>
                      </VStack>
                    </Card>

                    {/* Card 4: Interactive Primitives & Dialog */}
                    <Card level={0} padding="lg">
                      <VStack gap="lg">
                        <Header
                          size="md"
                          title="Interactive Primitives"
                          description="Intent styles, buttons, badges, and native dialog."
                          actions={
                            <Badge variant="secondary" intent="info">
                              Overlays
                            </Badge>
                          }
                        />

                        <Divider />

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
                          <Text type="label">Button variants</Text>
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
                          </HStack>
                        </VStack>

                        <Divider />

                        {/* Native Modal Dialog */}
                        <div className={marginTopAutoStyle.className}>
                          <DialogRoot>
                            <DialogTrigger variant="secondary" size="sm" width="full">
                              Open Theme Modal Dialog
                            </DialogTrigger>
                            <DialogContent>
                              <VStack gap="lg">
                                <DialogHeader>
                                  <DialogTitle>Custom Theme Modal</DialogTitle>
                                  <DialogDescription>
                                    This is a native HTML5 dialog styled with the active theme
                                    tokens.
                                  </DialogDescription>
                                </DialogHeader>

                                <HStack justify="end" gap="sm">
                                  <DialogClose variant="ghost" size="sm">
                                    Dismiss
                                  </DialogClose>
                                  <DialogClose variant="primary" size="sm">
                                    Confirm
                                  </DialogClose>
                                </HStack>
                              </VStack>
                            </DialogContent>
                          </DialogRoot>
                        </div>
                      </VStack>
                    </Card>
                  </div>
                </VStack>
              </div>
            </Surface>
            {/* Color Palette Shades Section */}
            <Card level={0} padding="lg">
              <VStack gap="lg">
                <Header
                  size="md"
                  title="Color Palette Shades"
                  description="50–900 OKLCH stepped scales calculated via chroma curves and relative color syntax from the seed colors."
                />
                <Divider />
                <ColorTokens />
              </VStack>
            </Card>
          </VStack>
        </div>
      </div>
    </div>
  );
}
