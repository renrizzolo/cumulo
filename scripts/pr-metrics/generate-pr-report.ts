import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  calculateTotalMetrics,
  collectBundleSizes,
  formatBytes,
  formatDiff,
  type BundleEntry,
  type BundleSizeReport,
} from './bundle-size.ts';
import {
  captureApiSnapshot,
  diffApiSnapshots,
  type ApiDiffReport,
  type ExportChange,
} from './api-diff.ts';
import { getCliArg, isDirectExecution, writeCliOutputFile } from './cli-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRootDir = path.resolve(__dirname, '../..');

export const PR_COMMENT_HEADER = '<!-- cumulo-pr-metrics -->';

function renderBundleRow(entry: BundleEntry, baseEntry?: BundleEntry): string {
  const rawStr = formatBytes(entry.metrics.raw);
  const gzipStr = formatBytes(entry.metrics.gzip);
  const brotliStr = formatBytes(entry.metrics.brotli);

  let rawCell = `\`${rawStr}\``;
  let gzipCell = `\`${gzipStr}\``;
  let brotliCell = `\`${brotliStr}\``;

  if (baseEntry) {
    const rawDiff = formatDiff(entry.metrics.raw, baseEntry.metrics.raw);
    const gzipDiff = formatDiff(entry.metrics.gzip, baseEntry.metrics.gzip);
    const brotliDiff = formatDiff(entry.metrics.brotli, baseEntry.metrics.brotli);

    rawCell += entry.metrics.raw !== baseEntry.metrics.raw ? `<br/>*(${rawDiff})*` : '';
    gzipCell += entry.metrics.gzip !== baseEntry.metrics.gzip ? `<br/>*(${gzipDiff})*` : '';
    brotliCell += entry.metrics.brotli !== baseEntry.metrics.brotli ? `<br/>*(${brotliDiff})*` : '';
  }

  return `| **\`${entry.package}\`**<br/>\`${entry.name}\` | \`${entry.category}\` | ${rawCell} | ${gzipCell} | ${brotliCell} |`;
}

export function generateBundleSizeSection(
  currentReport: BundleSizeReport,
  baseReport?: BundleSizeReport,
): string {
  const currentTotal = calculateTotalMetrics(currentReport.entries);
  const baseTotal = baseReport ? calculateTotalMetrics(baseReport.entries) : undefined;

  const baseEntriesMap = new Map<string, BundleEntry>();
  if (baseReport) {
    for (const entry of baseReport.entries) {
      baseEntriesMap.set(`${entry.package}:${entry.name}`, entry);
    }
  }

  const hasDiff = (entry: BundleEntry): boolean => {
    if (!baseReport) {
      return false;
    }
    const base = baseEntriesMap.get(`${entry.package}:${entry.name}`);
    return (
      base === undefined ||
      base.metrics.raw !== entry.metrics.raw ||
      base.metrics.gzip !== entry.metrics.gzip ||
      base.metrics.brotli !== entry.metrics.brotli
    );
  };

  let changedCount = 0;
  for (const entry of currentReport.entries) {
    if (hasDiff(entry)) {
      changedCount++;
    }
  }

  if (baseReport) {
    const currentKeys = new Set(currentReport.entries.map((e) => `${e.package}:${e.name}`));
    for (const entry of baseReport.entries) {
      if (!currentKeys.has(`${entry.package}:${entry.name}`)) {
        changedCount++;
      }
    }
  }

  if (baseReport && baseTotal && currentTotal.gzip === baseTotal.gzip && changedCount === 0) {
    const lines: string[] = [
      '### 📦 Bundle Size Changes',
      '',
      '✅ **No bundle size changes detected.**',
      '',
    ];
    return lines.join('\n');
  }

  const diffSummary = baseTotal
    ? `**Combined Diff:** \`${formatDiff(currentTotal.gzip, baseTotal.gzip)}\` (gzip)`
    : `**Combined Size:** \`${formatBytes(currentTotal.gzip)}\` (gzip)`;

  const sortedEntries = currentReport.entries.toSorted((a, b) => {
    const aDiff = hasDiff(a);
    const bDiff = hasDiff(b);
    if (aDiff !== bDiff) {
      return aDiff ? -1 : 1;
    }
    if (a.package !== b.package) {
      return a.package.localeCompare(b.package);
    }
    return a.name.localeCompare(b.name);
  });

  const summaryText =
    changedCount > 0
      ? `<b>Module Breakdown (${changedCount} changed, ${currentReport.entries.length} total)</b>`
      : `<b>Module Breakdown (${currentReport.entries.length} modules)</b>`;

  const lines: string[] = [
    '### 📦 Bundle Size Changes',
    '',
    diffSummary,
    '',
    `<details><summary>${summaryText}</summary>`,
    '',
    '| Package / Target | Category | Raw Size | Gzip | Brotli |',
    '| :--- | :---: | :---: | :---: | :---: |',
  ];

  for (const entry of sortedEntries) {
    const baseEntry = baseEntriesMap.get(`${entry.package}:${entry.name}`);
    lines.push(renderBundleRow(entry, baseEntry));
  }

  lines.push('');
  lines.push('</details>');
  lines.push('');
  lines.push('> *Sizes measured with maximum compression (gzip -9, brotli -11).*');
  lines.push('');

  return lines.join('\n');
}

export function generateApiDiffSection(diffReport: ApiDiffReport): string {
  const lines: string[] = ['### 🔍 Public API Changes', ''];

  if (!diffReport.hasChanges) {
    lines.push('✅ **No public API or declaration changes detected.**');
    lines.push('');
    return lines.join('\n');
  }

  const grouped = new Map<string, ExportChange[]>();
  for (const change of diffReport.changes) {
    const list = grouped.get(change.pkgName) ?? [];
    list.push(change);
    grouped.set(change.pkgName, list);
  }

  for (const [pkgName, changes] of grouped.entries()) {
    lines.push(`#### \`${pkgName}\``);
    lines.push('');

    for (const change of changes) {
      lines.push(`**${change.symbolId}**`);
      lines.push('');
      lines.push(change.diffBlock);
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function generateFullReport(options: {
  currentBundle: BundleSizeReport;
  baseBundle?: BundleSizeReport;
  apiDiff: ApiDiffReport;
}): string {
  const parts: string[] = [
    PR_COMMENT_HEADER,
    '## 📊 Pull Request Metrics Report',
    '',
    generateBundleSizeSection(options.currentBundle, options.baseBundle),
    generateApiDiffSection(options.apiDiff),
  ];

  return parts.join('\n');
}

// CLI entry point
// CLI entry point
if (isDirectExecution(import.meta.url)) {
  const prDir = getCliArg('--pr-dir') ?? defaultRootDir;
  const baseDir = getCliArg('--base-dir');
  const outPath = getCliArg('--out');

  const currentBundle = collectBundleSizes(prDir);
  const baseBundle = baseDir && fs.existsSync(baseDir) ? collectBundleSizes(baseDir) : undefined;

  const currentApi = captureApiSnapshot(prDir);
  const baseApi = baseDir && fs.existsSync(baseDir) ? captureApiSnapshot(baseDir) : currentApi;
  const apiDiff = diffApiSnapshots(baseApi, currentApi);

  const markdown = generateFullReport({
    currentBundle,
    baseBundle,
    apiDiff,
  });

  if (outPath) {
    writeCliOutputFile(outPath, markdown);
    process.stdout.write(`PR report written to ${outPath}\n`);
  } else {
    process.stdout.write(markdown);
  }
}
