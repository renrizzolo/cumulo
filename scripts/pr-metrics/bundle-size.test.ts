import { describe, expect, it } from 'vitest';
import {
  calculateTotalMetrics,
  formatBytes,
  formatDiff,
  type BundleEntry,
  type BundleSizeReport,
} from './bundle-size.ts';
import { generateBundleSizeSection } from './generate-pr-report.ts';

describe('bundle-size', () => {
  const sampleEntries: BundleEntry[] = [
    {
      package: '@cumulo/core',
      name: 'Button.mjs',
      filePath: 'packages/core/dist/components/Button.mjs',
      category: 'component',
      isPrimary: true,
      metrics: { raw: 2400, gzip: 900, brotli: 800 },
    },
    {
      package: '@cumulo/core',
      name: 'Dialog.mjs',
      filePath: 'packages/core/dist/components/Dialog.mjs',
      category: 'component',
      isPrimary: true,
      metrics: { raw: 6000, gzip: 2000, brotli: 1800 },
    },
  ];

  describe('formatBytes', () => {
    it('formats bytes and kilobytes correctly', () => {
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1024)).toBe('1.00 kB');
      expect(formatBytes(2560)).toBe('2.50 kB');
    });
  });

  describe('formatDiff', () => {
    it('formats zero difference', () => {
      expect(formatDiff(1000, 1000)).toBe('0 B (0.0%)');
    });

    it('formats positive difference', () => {
      expect(formatDiff(1100, 1000)).toBe('+100 B (+10.0%)');
    });

    it('formats negative difference', () => {
      expect(formatDiff(900, 1000)).toBe('-100 B (-10.0%)');
    });
  });

  describe('calculateTotalMetrics', () => {
    it('sums raw, gzip, and brotli across all entries', () => {
      const totals = calculateTotalMetrics(sampleEntries);
      expect(totals.raw).toBe(8400);
      expect(totals.gzip).toBe(2900);
      expect(totals.brotli).toBe(2600);
    });
  });

  describe('generateBundleSizeSection', () => {
    it('renders combined size and collapsed table when no base report', () => {
      const currentReport: BundleSizeReport = {
        timestamp: '2026-09-01T00:00:00Z',
        entries: sampleEntries,
      };

      const section = generateBundleSizeSection(currentReport);
      expect(section).toContain('### 📦 Bundle Size Changes');
      expect(section).toContain('**Combined Size:** `2.83 kB` (gzip)');
      expect(section).toContain('<details><summary><b>Module Breakdown (2 modules)</b></summary>');
      expect(section).toContain('Button.mjs');
      expect(section).toContain('Dialog.mjs');
      expect(section).toContain('</details>');
    });

    it('renders single combined diff value and sorted changed modules when base report is provided', () => {
      const currentReport: BundleSizeReport = {
        timestamp: '2026-09-02T00:00:00Z',
        entries: [
          {
            ...sampleEntries[0]!,
            metrics: { raw: 2500, gzip: 950, brotli: 840 }, // +50 B gzip
          },
          sampleEntries[1]!, // unchanged
        ],
      };

      const baseReport: BundleSizeReport = {
        timestamp: '2026-09-01T00:00:00Z',
        entries: sampleEntries,
      };

      const section = generateBundleSizeSection(currentReport, baseReport);
      expect(section).toContain('### 📦 Bundle Size Changes');
      expect(section).toContain('**Combined Diff:** `+50 B (+1.7%)` (gzip)');
      expect(section).toContain(
        '<details><summary><b>Module Breakdown (1 changed, 2 total)</b></summary>',
      );

      // Changed module should appear before unchanged module in table
      const buttonIdx = section.indexOf('Button.mjs');
      const dialogIdx = section.indexOf('Dialog.mjs');
      expect(buttonIdx).toBeLessThan(dialogIdx);
      expect(section).toContain('+50 B (+5.6%)');
    });
  });
});
