'use client';

import {
  Badge,
  Button,
  Card,
  Container,
  Link as CumuloLink,
  Field,
  Grid,
  Heading,
  HStack,
  Text,
  vars,
  VStack,
} from '@cumulo/core';
import { style } from '@cumulo/css';
import { Link as RouterLink, type RoutePath } from '@renr/parcel-rsc-router';
import React, { useCallback, useState } from 'react';
import { LakesideParkIllustration, LandscapeConfig } from './FujiKawaguchiko';
import { Logo } from './Logo';
import { Version } from './Version';

const EASE_OUT_STRONG = 'cubic-bezier(0.23, 1, 0.32, 1)';

const DEFAULT_CONFIG: LandscapeConfig = {
  bounciness: 2,
  dotPitch: 2.75,
  dotScale: 1.25,
  inkOpacity: 1.75,
  mountainScale: 1.25,
  treeScale: 1.15,
  cloudScale: 0.9,
  lawnRatio: 0.5,
  seed: 42,
};

interface InternalFooterLink {
  label: string;
  to: RoutePath;
}

interface ExternalFooterLink {
  label: string;
  href: string;
}

const DOC_LINKS: InternalFooterLink[] = [
  { label: 'Overview', to: '/' },
  { label: 'Bundler Setup', to: '/bundlers' },
  { label: 'Tokens & Theming', to: '/tokens' },
  { label: 'Styling (@cumulo/css)', to: '/css' },
  { label: 'Working with AI', to: '/ai' },
  { label: 'Theme Builder', to: '/theme-builder' },
];

const RESOURCE_LINKS: ExternalFooterLink[] = [
  { label: 'GitHub Repository', href: 'https://github.com/renrizzolo/cumulo' },
  { label: 'Releases & Changelog', href: 'https://github.com/renrizzolo/cumulo/releases' },
  { label: 'Issues & Bug Reports', href: 'https://github.com/renrizzolo/cumulo/issues' },
  { label: '@cumulo/core on npm', href: 'https://www.npmjs.com/package/@cumulo/core' },
  { label: '@cumulo/css on npm', href: 'https://www.npmjs.com/package/@cumulo/css' },
];

const footerSurfaceStyle = style(
  {
    position: 'relative',
    overflow: 'clip',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: vars.surface.border,
    background: 'linear-gradient(0deg, #e1d53621, #0000 80%)',
  },
  'doc-footer-surface',
);

const footerContainerStyle = style(
  {
    position: 'relative',
    zIndex: 1,
    padding: vars.spacing['2xl'],
    '@media': {
      '(max-width: 1200px)': {
        paddingInline: vars.spacing.lg,
      },
      '(max-width: 768px)': {
        paddingTop: vars.spacing.xl,
        paddingBottom: vars.spacing.md,
        paddingInline: vars.spacing.md,
      },
    },
  },
  'doc-footer-container',
);

const topRowStyle = style(
  {
    width: '100%',
    '@media': {
      '(max-width: 900px)': {
        flexDirection: 'column',
        gap: vars.spacing.xl,
      },
    },
  },
  'doc-footer-top-row',
);

const navColumnsGroupStyle = style(
  {
    gap: vars.spacing['2xl'],
    '@media': {
      '(max-width: 1100px)': {
        gap: vars.spacing.xl,
      },
      '(max-width: 600px)': {
        flexWrap: 'wrap',
        gap: vars.spacing.lg,
      },
    },
  },
  'doc-footer-nav-cols',
);

const brandLinkStyle = style(
  {
    textDecoration: 'none',
    color: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    transition: `${vars.duration.fast} ${vars.ease.default}`,
    ':active': {
      transform: 'scale(0.98)',
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  'doc-footer-brand-link',
);

const brandSummaryStyle = style(
  {
    maxWidth: '38ch',
  },
  'doc-footer-brand-summary',
);

const metaPillLinkStyle = style(
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing['2xs'],
    paddingBlock: vars.spacing['3xs'],
    paddingInline: vars.spacing.xs,
    borderRadius: vars.radius.full,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars.surface.border,
    backgroundColor: vars.surface.bg.next,
    color: vars.surface.fg,
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.medium,
    textDecoration: 'none',
    ':hover': {
      borderColor: vars.primary.border,
      backgroundColor: vars.surface.secondary.hover,
      color: vars.primary['600'],
      textDecoration: 'none',
    },
    ':active': {
      transform: 'scale(0.97)',
    },
  },
  'doc-footer-meta-pill',
);

const iconSmallStyle = style(
  {
    width: vars.size['4xs'],
    height: vars.size['4xs'],
    flexShrink: 0,
  },
  'doc-footer-icon-sm',
);

const columnHeadingStyle = style(
  {
    fontFamily: vars.font.mono,
    fontSize: vars.font.size['2xs'],
    fontWeight: vars.font.weight.medium,
    letterSpacing: '0.08em',
    color: vars.surface.subtle,
  },
  'doc-footer-col-heading',
);

const footerNavLinkStyle = style(
  {
    fontSize: vars.font.size.sm,
    lineHeight: vars.line.height.tight,
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing['2xs'],
    color: vars.surface.muted,
    textDecoration: 'none',
    transition: `color 150ms ${vars.ease.default}`,
    ':hover': {
      color: vars.surface.fg,
      textDecoration: 'none',
    },
  },
  'doc-footer-nav-link',
);

const externalArrowStyle = style(
  {
    width: '11px',
    height: '11px',
    opacity: 0.55,
    flexShrink: 0,
    transition: `transform 180ms ${EASE_OUT_STRONG}, opacity 180ms ${vars.ease.default}`,
    selectors: {
      'a:hover &': {
        transform: 'translate3d(1.5px, -1.5px, 0)',
        opacity: 1,
      },
    },
    '@media': {
      '(hover: none)': {
        transform: 'none',
      },
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
        transform: 'none',
      },
    },
  },
  'doc-footer-external-arrow',
);

const tunerCardStyle = style(
  {
    // keep this hidden, config is just for testing/fun
    selectors: {
      '&&': {
        display: 'none',
      },
    },
    width: '100%',
  },
  'doc-footer-tuner-card',
);

const sliderValueStyle = style(
  {
    fontFamily: vars.font.mono,
    fontSize: vars.font.size.xs,
    color: vars.surface.muted,
  },
  'doc-footer-slider-val',
);

function GitHubIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={iconSmallStyle.className}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function PackageIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={iconSmallStyle.className}
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}

function ExternalArrowIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={externalArrowStyle.className}
    >
      <path d="M4.5 11.5 11.5 4.5" />
      <path d="M5.5 4.5h6v6" />
    </svg>
  );
}

export function DocFooter(): React.JSX.Element {
  const [config, setConfig] = useState<LandscapeConfig>(DEFAULT_CONFIG);

  const [showTuner, setShowTuner] = useState(true);
  const [copied, setCopied] = useState(false);

  const updateParam = useCallback(<K extends keyof LandscapeConfig>(key: K, val: number) => {
    setConfig((prev): LandscapeConfig => ({ ...prev, [key]: val }));
  }, []);

  React.useEffect(() => {
    const seed = Math.floor(Math.random() * 100);
    // oxlint-disable-next-line react/set-state-in-effect
    updateParam('seed', seed);
  }, [updateParam]);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const handleCopy = useCallback(() => {
    void navigator.clipboard?.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [config]);

  return (
    <footer className={footerSurfaceStyle.className}>
      <Container size="2xl">
        <VStack gap="xl" className={footerContainerStyle.className}>
          {/* Temporary Interactive Landscape Style Tuner */}
          <Card.Root level={2} padding="md" className={tunerCardStyle.className}>
            <VStack gap="md">
              <HStack justify="between" align="center" wrap="wrap" gap="sm">
                <HStack gap="xs" align="center">
                  <Text size="xs" weight="semibold">
                    Footer Landscape &amp; Halftone Controls
                  </Text>
                </HStack>

                <HStack gap="xs" align="center">
                  <Button size="xs" variant="secondary" onClick={handleCopy}>
                    {copied ? 'Copied JSON!' : 'Copy Config'}
                  </Button>
                  <Button size="xs" variant="ghost" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => setShowTuner((prev) => !prev)}>
                    {showTuner ? 'Hide' : 'Expand'}
                  </Button>
                </HStack>
              </HStack>

              {showTuner ? (
                <Grid.Root minColumnWidth="200px" gap="md">
                  <Grid.Item>
                    <Field.Root gap="xs">
                      <HStack justify="between" align="center">
                        <Field.Label>Bounciness / Puffiness</Field.Label>
                        <span className={sliderValueStyle.className}>
                          {config.bounciness.toFixed(2)}
                        </span>
                      </HStack>
                      <Field.Slider
                        size="sm"
                        min={-2.4}
                        max={2.4}
                        step={0.05}
                        value={config.bounciness}
                        onValueChange={(v) => updateParam('bounciness', v)}
                      />
                    </Field.Root>
                  </Grid.Item>

                  <Grid.Item>
                    <Field.Root gap="xs">
                      <HStack justify="between" align="center">
                        <Field.Label>Halftone Dot Pitch</Field.Label>
                        <span className={sliderValueStyle.className}>
                          {config.dotPitch.toFixed(1)}px
                        </span>
                      </HStack>
                      <Field.Slider
                        size="sm"
                        min={3}
                        max={24}
                        step={0.5}
                        value={config.dotPitch}
                        onValueChange={(v) => updateParam('dotPitch', v)}
                      />
                    </Field.Root>
                  </Grid.Item>

                  <Grid.Item>
                    <Field.Root gap="xs">
                      <HStack justify="between" align="center">
                        <Field.Label>Halftone Dot Size</Field.Label>
                        <span className={sliderValueStyle.className}>
                          {config.dotScale.toFixed(2)}×
                        </span>
                      </HStack>
                      <Field.Slider
                        size="sm"
                        min={0.4}
                        max={2.2}
                        step={0.05}
                        value={config.dotScale}
                        onValueChange={(v) => updateParam('dotScale', v)}
                      />
                    </Field.Root>
                  </Grid.Item>

                  <Grid.Item>
                    <Field.Root gap="xs">
                      <HStack justify="between" align="center">
                        <Field.Label>Ink Contrast</Field.Label>
                        <span className={sliderValueStyle.className}>
                          {config.inkOpacity.toFixed(2)}×
                        </span>
                      </HStack>
                      <Field.Slider
                        size="sm"
                        min={0.25}
                        max={1.75}
                        step={0.05}
                        value={config.inkOpacity}
                        onValueChange={(v) => updateParam('inkOpacity', v)}
                      />
                    </Field.Root>
                  </Grid.Item>

                  <Grid.Item>
                    <Field.Root gap="xs">
                      <HStack justify="between" align="center">
                        <Field.Label>Mountain Elevation</Field.Label>
                        <span className={sliderValueStyle.className}>
                          {config.mountainScale.toFixed(2)}×
                        </span>
                      </HStack>
                      <Field.Slider
                        size="sm"
                        min={0.4}
                        max={1.7}
                        step={0.05}
                        value={config.mountainScale}
                        onValueChange={(v) => updateParam('mountainScale', v)}
                      />
                    </Field.Root>
                  </Grid.Item>

                  <Grid.Item>
                    <Field.Root gap="xs">
                      <HStack justify="between" align="center">
                        <Field.Label>Tree Canopy Scale</Field.Label>
                        <span className={sliderValueStyle.className}>
                          {config.treeScale.toFixed(2)}×
                        </span>
                      </HStack>
                      <Field.Slider
                        size="sm"
                        min={0.5}
                        max={1.5}
                        step={0.05}
                        value={config.treeScale}
                        onValueChange={(v) => updateParam('treeScale', v)}
                      />
                    </Field.Root>
                  </Grid.Item>

                  <Grid.Item>
                    <Field.Root gap="xs">
                      <HStack justify="between" align="center">
                        <Field.Label>Cloud Volume</Field.Label>
                        <span className={sliderValueStyle.className}>
                          {config.cloudScale.toFixed(2)}×
                        </span>
                      </HStack>
                      <Field.Slider
                        size="sm"
                        min={0}
                        max={1.6}
                        step={0.05}
                        value={config.cloudScale}
                        onValueChange={(v) => updateParam('cloudScale', v)}
                      />
                    </Field.Root>
                  </Grid.Item>

                  <Grid.Item>
                    <Field.Root gap="xs">
                      <HStack justify="between" align="center">
                        <Field.Label>Lawn Depth</Field.Label>
                        <span className={sliderValueStyle.className}>
                          {config.lawnRatio.toFixed(2)}×
                        </span>
                      </HStack>
                      <Field.Slider
                        size="sm"
                        min={0.5}
                        max={1.6}
                        step={0.05}
                        value={config.lawnRatio}
                        onValueChange={(v) => updateParam('lawnRatio', v)}
                      />
                    </Field.Root>
                  </Grid.Item>
                  <Grid.Item>
                    <Field.Root>
                      <Field.Label>Random Seed</Field.Label>
                      <Field.Input
                        type="number"
                        value={config.seed}
                        onChange={(e) => updateParam('seed', Number(e.target.value))}
                      />
                    </Field.Root>
                  </Grid.Item>
                </Grid.Root>
              ) : null}
            </VStack>
          </Card.Root>

          <HStack
            justify="between"
            align="start"
            gap="xl"
            wrap="wrap"
            className={topRowStyle.className}
          >
            {/* Left Brand, Version & Links Column */}
            <VStack gap="md" align="start">
              <HStack gap="xs" align="center" wrap="wrap">
                <CumuloLink
                  as={RouterLink}
                  to="/"
                  variant="plain"
                  className={brandLinkStyle.className}
                >
                  <Logo size="lg" />
                </CumuloLink>
                <Badge variant="secondary" size="2xs">
                  <Version />
                </Badge>
              </HStack>

              <Text size="sm" color="muted" className={brandSummaryStyle.className}>
                Dependency-free React 19 component library and zero-runtime CSS engine built on
                modern web platform standards.
              </Text>

              <HStack gap="xs" align="center" wrap="wrap">
                <CumuloLink
                  href="https://github.com/renrizzolo/cumulo"
                  external
                  variant="plain"
                  className={metaPillLinkStyle.className}
                >
                  <GitHubIcon />
                  <span>GitHub</span>
                </CumuloLink>
                <CumuloLink
                  href="https://www.npmjs.com/package/@cumulo/core"
                  external
                  variant="plain"
                  className={metaPillLinkStyle.className}
                >
                  <PackageIcon />
                  <span>
                    @cumulo/core <Version />
                  </span>
                </CumuloLink>
              </HStack>

              <Text size="2xs" color="subtle">
                © {new Date().getFullYear()} Cumulo UI · Released under the MIT License
              </Text>
            </VStack>

            {/* Right Navigation Columns */}
            <HStack align="start" className={navColumnsGroupStyle.className} gap="xl">
              <VStack as="nav" aria-label="Documentation links" gap="md" align="start">
                <Heading
                  as="h3"
                  size="xs"
                  transform="uppercase"
                  className={columnHeadingStyle.className}
                >
                  Getting Started
                </Heading>
                <VStack gap="sm" align="start">
                  {DOC_LINKS.map((item) => (
                    <CumuloLink
                      key={item.to}
                      as={RouterLink}
                      to={item.to}
                      variant="plain"
                      className={footerNavLinkStyle.className}
                    >
                      {item.label}
                    </CumuloLink>
                  ))}
                </VStack>
              </VStack>

              <VStack as="nav" aria-label="External resource links" gap="md" align="start">
                <Heading
                  as="h3"
                  size="xs"
                  transform="uppercase"
                  className={columnHeadingStyle.className}
                >
                  Resources
                </Heading>
                <VStack gap="sm" align="start">
                  {RESOURCE_LINKS.map((item) => (
                    <CumuloLink
                      key={item.href}
                      href={item.href}
                      external
                      variant="plain"
                      className={footerNavLinkStyle.className}
                    >
                      <span>{item.label}</span>
                      <ExternalArrowIcon />
                    </CumuloLink>
                  ))}
                </VStack>
              </VStack>
            </HStack>
          </HStack>
        </VStack>
      </Container>
      <LakesideParkIllustration config={config} />

      {/* Bottom Full-Width Halftone Lakeside Park Landscape */}
      {/* <LakesideParkIllustration_ config={config} /> */}
    </footer>
  );
}
