import type { ResponsiveRuleEntry } from '@cumulo/css';
import { describe, expect, it } from 'vitest';

import {
  createResponsiveUsageTracker,
  pruneDeadResponsiveClasses,
} from '../src/core/responsivePruner.js';

function makeEntry(
  className: string,
  conditionKey: string,
  variantName: string,
  optionName: string,
): ResponsiveRuleEntry {
  return {
    className,
    conditionKey,
    atRule: '@media (min-width: 768px)',
    layer: `responsive.bp-${conditionKey}`,
    innerRules: [`.${className}{gap:8px;}`],
    usages: [{ variantName, optionName }],
  };
}

describe('responsivePruner', () => {
  it('tracks literal responsive values across JSX, ternaries, and helper objects while pruning unused options', () => {
    const tracker = createResponsiveUsageTracker(['sm', 'md', 'lg', 'xl', '2xl']);

    tracker.scanSource(
      `
      const layoutGap = { initial: 'sm', lg: 'xl' };
      export function Page({ compact }: { compact: boolean }) {
        return (
          <Stack
            direction={{ initial: 'column', md: compact ? 'column' : 'row' }}
            gap={layoutGap}
          />
        );
      }
      `,
      'Page.tsx',
    );

    expect(tracker.wildcardAll).toBe(false);
    expect(tracker.isRuleUsed(makeEntry('rv-md-row', 'md', 'direction', 'row'))).toBe(true);
    expect(tracker.isRuleUsed(makeEntry('rv-md-col', 'md', 'direction', 'column'))).toBe(true);
    expect(tracker.isRuleUsed(makeEntry('rv-lg-xl', 'lg', 'gap', 'xl'))).toBe(true);

    // Unused option at md and unused breakpoints sm/xl/2xl are pruned
    expect(tracker.isRuleUsed(makeEntry('rv-md-rev', 'md', 'direction', 'row-reverse'))).toBe(
      false,
    );
    expect(tracker.isRuleUsed(makeEntry('rv-sm-xs', 'sm', 'gap', 'xs'))).toBe(false);
    expect(tracker.isRuleUsed(makeEntry('rv-2xl-lg', '2xl', 'gap', 'lg'))).toBe(false);
  });

  it('ignores nested object values in recipe style definitions without triggering false wildcards', () => {
    const tracker = createResponsiveUsageTracker(['sm', 'md', 'lg']);

    tracker.scanSource(
      `
      const r = recipe({
        responsiveVariants: ['gap'],
        variants: {
          gap: {
            sm: { gap: '8px' },
            md: { gap: '16px' },
            lg: { gap: '24px' },
          },
        },
      });
      export const cls = r({ gap: { initial: 'sm', md: 'lg' } });
      `,
      'Component.tsx',
    );

    expect(tracker.wildcardAll).toBe(false);
    expect(tracker.isRuleUsed(makeEntry('rv-md-lg', 'md', 'gap', 'lg'))).toBe(true);
    expect(tracker.isRuleUsed(makeEntry('rv-md-sm', 'md', 'gap', 'sm'))).toBe(false);
    expect(tracker.isRuleUsed(makeEntry('rv-lg-lg', 'lg', 'gap', 'lg'))).toBe(false);
  });

  it('conservatively wildcards a single breakpoint when a dynamic scalar expression is passed', () => {
    const tracker = createResponsiveUsageTracker(['sm', 'md', 'lg']);

    tracker.scanSource(
      `
      export function Page({ dir }: { dir: 'row' | 'column' }) {
        return <Stack direction={{ initial: 'column', md: dir }} />;
      }
      `,
      'Dynamic.tsx',
    );

    expect(tracker.wildcardAll).toBe(false);
    // All md options are conservatively kept
    expect(tracker.isRuleUsed(makeEntry('rv-md-row', 'md', 'direction', 'row'))).toBe(true);
    expect(tracker.isRuleUsed(makeEntry('rv-md-rev', 'md', 'direction', 'row-reverse'))).toBe(true);
    // Unmentioned breakpoints stay pruned
    expect(tracker.isRuleUsed(makeEntry('rv-lg-row', 'lg', 'direction', 'row'))).toBe(false);
  });

  it('conservatively disables pruning when spread or computed keys appear in responsive objects', () => {
    const tracker = createResponsiveUsageTracker(['sm', 'md', 'lg']);

    tracker.scanSource(
      `
      export function Page({ extra }: { extra: Record<string, string> }) {
        return <Stack gap={{ initial: 'sm', ...extra }} />;
      }
      `,
      'Spread.tsx',
    );

    expect(tracker.wildcardAll).toBe(true);
    expect(tracker.isRuleUsed(makeEntry('rv-lg-xl', 'lg', 'gap', 'xl'))).toBe(true);
  });

  it('respects responsiveSafelist for breakpoints and variants', () => {
    const tracker = createResponsiveUsageTracker(['sm', 'md', 'lg']);
    tracker.scanSource(`export const x = 1;`, 'Empty.tsx');

    const safelist = { breakpoints: ['md'], variants: ['columns'] };
    expect(tracker.isRuleUsed(makeEntry('rv-md-xs', 'md', 'gap', 'xs'), safelist)).toBe(true);
    expect(tracker.isRuleUsed(makeEntry('rv-lg-3', 'lg', 'columns', '3'), safelist)).toBe(true);
    expect(tracker.isRuleUsed(makeEntry('rv-lg-xs', 'lg', 'gap', 'xs'), safelist)).toBe(false);
  });

  it('strips dead responsive rules and empty @media/@container/@layer wrappers while keeping live & unrelated CSS', () => {
    const css = [
      '@layer reset, base, components, responsive, utilities;',
      '@layer components{.stack-base-1{display:flex;}}',
      '@layer responsive.bp-sm, responsive.bp-md, responsive.bp-lg;',
      '@layer responsive.bp-sm{@media (min-width: 640px){.rv-sm-dead{gap:4px;}.rv-sm-dead > *{--p:4px;}}}',
      '@layer responsive.bp-md{@media (min-width: 768px){.rv-md-live{flex-direction:row;}.rv-md-dead{gap:8px;}}}',
      '@layer responsive.bp-lg{@container card (min-width: 600px){.rv-lg-dead{content:"}";}}}',
      '.user-custom{color:red;}',
    ].join('\n');

    const dead = new Set(['rv-sm-dead', 'rv-md-dead', 'rv-lg-dead']);
    const pruned = pruneDeadResponsiveClasses(css, dead);

    expect(pruned).toContain('@layer components{.stack-base-1{display:flex;}}');
    expect(pruned).toContain('.rv-md-live{flex-direction:row;}');
    expect(pruned).toContain('.user-custom{color:red;}');

    // Dead rules and now-empty @media / @container / @layer blocks must be gone
    expect(pruned).not.toContain('rv-sm-dead');
    expect(pruned).not.toContain('rv-md-dead');
    expect(pruned).not.toContain('rv-lg-dead');
    expect(pruned).not.toContain('@media (min-width: 640px)');
    expect(pruned).not.toContain('@container card (min-width: 600px)');
    expect(pruned).not.toContain('@layer responsive.bp-sm{');
    expect(pruned).not.toContain('@layer responsive.bp-lg{');
  });
});
