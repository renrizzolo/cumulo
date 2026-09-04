import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
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
  const baseEntriesMap = new Map<string, BundleEntry>();
  if (baseReport) {
    for (const entry of baseReport.entries) {
      baseEntriesMap.set(`${entry.package}:${entry.name}`, entry);
    }
  }

  const hasDiff = (entry: BundleEntry): boolean => {
    const base = baseEntriesMap.get(`${entry.package}:${entry.name}`);
    return base !== undefined && base.metrics.raw !== entry.metrics.raw;
  };

  const primaryEntries = currentReport.entries.filter(
    (e) => e.isPrimary || e.category === 'core-entry' || hasDiff(e),
  );
  const otherEntries = currentReport.entries.filter((e) => !primaryEntries.includes(e));

  const lines: string[] = [
    '### 📦 Bundle Size Changes',
    '',
    '| Package / Target | Category | Raw Size | Gzip | Brotli |',
    '| :--- | :---: | :---: | :---: | :---: |',
  ];

  for (const entry of primaryEntries) {
    const baseEntry = baseEntriesMap.get(`${entry.package}:${entry.name}`);
    lines.push(renderBundleRow(entry, baseEntry));
  }

  if (otherEntries.length > 0) {
    lines.push('');
    lines.push(
      `<details><summary><b>Full Target Breakdown (${currentReport.entries.length} targets across components, hooks & tokens)</b></summary>`,
    );
    lines.push('');
    lines.push('| Package / Target | Category | Raw Size | Gzip | Brotli |');
    lines.push('| :--- | :---: | :---: | :---: | :---: |');
    for (const entry of otherEntries) {
      const baseEntry = baseEntriesMap.get(`${entry.package}:${entry.name}`);
      lines.push(renderBundleRow(entry, baseEntry));
    }
    lines.push('');
    lines.push('</details>');
  }

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

    const added = changes.filter((c) => c.type === 'added');
    const removed = changes.filter((c) => c.type === 'removed');
    const modified = changes.filter((c) => c.type === 'modified');

    if (added.length > 0) {
      lines.push('**🟢 Added Exports:**');
      for (const item of added) {
        lines.push(`- \`${item.name}\` in \`${item.fileRelPath}\``);
        lines.push('  ```ts');
        lines.push(`  ${item.after ?? ''}`);
        lines.push('  ```');
      }
      lines.push('');
    }

    if (modified.length > 0) {
      lines.push('**🟡 Modified Signatures:**');
      for (const item of modified) {
        lines.push(`- \`${item.name}\` in \`${item.fileRelPath}\``);
        lines.push('  ```diff');
        lines.push(`  - ${item.before ?? ''}`);
        lines.push(`  + ${item.after ?? ''}`);
        lines.push('  ```');
      }
      lines.push('');
    }

    if (removed.length > 0) {
      lines.push('**🔴 Removed Exports (Breaking Changes):**');
      for (const item of removed) {
        lines.push(`- \`${item.name}\` in \`${item.fileRelPath}\``);
        lines.push('  ```ts');
        lines.push(`  ${item.before ?? ''}`);
        lines.push('  ```');
      }
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
const isMain =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  const baseDirIndex = process.argv.indexOf('--base-dir');
  const prDirIndex = process.argv.indexOf('--pr-dir');
  const outIndex = process.argv.indexOf('--out');

  const prDir =
    prDirIndex !== -1 && process.argv[prDirIndex + 1]
      ? path.resolve(process.argv[prDirIndex + 1])
      : defaultRootDir;
  const baseDir =
    baseDirIndex !== -1 && process.argv[baseDirIndex + 1]
      ? path.resolve(process.argv[baseDirIndex + 1])
      : undefined;

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

  if (outIndex !== -1 && process.argv[outIndex + 1]) {
    const outPath = path.resolve(process.argv[outIndex + 1]);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown, 'utf-8');
    process.stdout.write(`PR report written to ${outPath}\n`);
  } else {
    process.stdout.write(markdown);
  }
}
