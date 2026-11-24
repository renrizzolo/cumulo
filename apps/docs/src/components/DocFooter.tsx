'use client';

import { Badge } from '@cumulo/core/components/Badge';
import { Button } from '@cumulo/core/components/Button';
import * as Card from '@cumulo/core/components/Card';
import { Container } from '@cumulo/core/components/Container';
import * as Field from '@cumulo/core/components/Field';
import * as Grid from '@cumulo/core/components/Grid';
import { Heading } from '@cumulo/core/components/Heading';
import { Link as CumuloLink } from '@cumulo/core/components/Link';
import { HStack, VStack } from '@cumulo/core/components/Stack';
import { Text } from '@cumulo/core/components/Text';
import { vars } from '@cumulo/core/contract';
import { style } from '@cumulo/css';
import { Link as RouterLink, type RoutePath } from '@renr/parcel-rsc-router';
import React, { useCallback, useState } from 'react';

import {
  ExternalArrowIcon,
  GitHubIcon,
  metaPillLinkStyle,
  PackageIcon,
  subtleLinkStyle,
} from './ExternalLinks';
import { LakesideParkIllustration, LandscapeConfig } from './FujiKawaguchiko';
import { Logo } from './Logo';
import { Version } from './Version';

const CURRENT_YEAR = new Date().getFullYear();

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

export function DocFooter(): React.JSX.Element {
  const [config, setConfig] = useState<LandscapeConfig>(DEFAULT_CONFIG);

  const [showTuner, setShowTuner] = useState(true);
  const [copied, setCopied] = useState(false);

  const updateParam = useCallback((key: keyof LandscapeConfig, val: number) => {
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
                © {CURRENT_YEAR} Cumulo UI · Released under the MIT License
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
                      className={subtleLinkStyle.className}
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
                      className={subtleLinkStyle.className}
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
