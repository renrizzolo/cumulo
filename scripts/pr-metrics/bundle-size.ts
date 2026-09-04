import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRootDir = path.resolve(__dirname, '../..');

export type TargetCategory =
  | 'core-entry'
  | 'component'
  | 'hook'
  | 'token'
  | 'theme'
  | 'css-framework'
  | 'tooling';

export interface BundleMetrics {
  raw: number;
  gzip: number;
  brotli: number;
}

export type PackageName =
  | '@cumulo/core'
  | '@cumulo/css'
  | '@cumulo/parcel-transformer'
  | '@cumulo/unplugin';

export interface TargetDefinition {
  package: PackageName;
  name: string;
  filePath: string;
  category: TargetCategory;
  isPrimary: boolean;
}

export interface BundleEntry extends TargetDefinition {
  metrics: BundleMetrics;
}

export interface BundleSizeReport {
  timestamp: string;
  entries: BundleEntry[];
}

function isDistArtifact(fileName: string): boolean {
  if (fileName.endsWith('.map') || fileName.includes('.d.')) {
    return false;
  }
  // Exclude internal bundler hash chunks (e.g. extractor-AJ8P_WxA.mjs)
  if (/-[a-zA-Z0-9_-]{7,}\.(mjs|cjs)$/.test(fileName)) {
    return false;
  }
  return fileName.endsWith('.mjs') || fileName.endsWith('.cjs') || fileName.endsWith('.css');
}

export function discoverTargets(baseDir: string = defaultRootDir): TargetDefinition[] {
  const targets: TargetDefinition[] = [];

  function addFilesInDir({
    category,
    dirRel,
    isPrimary,
    pkg,
  }: {
    pkg: PackageName;
    dirRel: `packages/${string}/dist` | `packages/${string}/dist/${string}`;
    category: TargetCategory;
    isPrimary: (name: string) => boolean;
  }): void {
    const fullDir = path.resolve(baseDir, dirRel);
    if (!fs.existsSync(fullDir)) {
      return;
    }
    const files = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile() && isDistArtifact(file.name)) {
        const filePath = path.join(dirRel, file.name).replace(/\\/g, '/');
        targets.push({
          package: pkg,
          name: file.name,
          filePath,
          category,
          isPrimary: isPrimary(file.name),
        });
      }
    }
  }

  // 1. @cumulo/css
  addFilesInDir({
    pkg: '@cumulo/css',
    dirRel: 'packages/css/dist',
    category: 'css-framework',
    isPrimary: (name) => name.startsWith('index.'),
  });

  // 2. @cumulo/core top-level entries
  addFilesInDir({
    pkg: '@cumulo/core',
    dirRel: 'packages/core/dist',
    category: 'core-entry',
    isPrimary: () => true,
  });

  // 3. @cumulo/core components & field
  addFilesInDir({
    pkg: '@cumulo/core',
    dirRel: 'packages/core/dist/components',
    category: 'component',
    isPrimary: (name) => name === 'Button.mjs' || name === 'Dialog.mjs',
  });
  addFilesInDir({
    pkg: '@cumulo/core',
    dirRel: 'packages/core/dist/field',
    category: 'component',
    isPrimary: (name) => name === 'Field.mjs',
  });

  // 4. @cumulo/core hooks
  addFilesInDir({
    pkg: '@cumulo/core',
    dirRel: 'packages/core/dist/hooks',
    category: 'hook',
    isPrimary: (name) => name === 'useFocus.mjs' || name === 'useDismissible.mjs',
  });

  // 5. @cumulo/core tokens & themes
  addFilesInDir({
    pkg: '@cumulo/core',
    dirRel: 'packages/core/dist/tokens',
    category: 'token',
    isPrimary: () => false,
  });
  addFilesInDir({
    pkg: '@cumulo/core',
    dirRel: 'packages/core/dist/theme',
    category: 'theme',
    isPrimary: () => false,
  });

  // 6. @cumulo/unplugin
  addFilesInDir({
    pkg: '@cumulo/unplugin',
    dirRel: 'packages/unplugin/dist',
    category: 'tooling',
    isPrimary: (name) => name === 'index.mjs',
  });

  // 7. @cumulo/parcel-transformer
  addFilesInDir({
    pkg: '@cumulo/parcel-transformer',
    dirRel: 'packages/parcel-transformer/dist',
    category: 'tooling',
    isPrimary: (name) => name === 'index.mjs',
  });

  return targets;
}

export function measureFile(absolutePath: string): BundleMetrics | null {
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  const content = fs.readFileSync(absolutePath);
  const raw = content.byteLength;
  const gzip = zlib.gzipSync(content, { level: 9 }).byteLength;
  const brotli = zlib.brotliCompressSync(content, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    },
  }).byteLength;

  return { raw, gzip, brotli };
}

export function collectBundleSizes(baseDir: string = defaultRootDir): BundleSizeReport {
  const targets = discoverTargets(baseDir);
  const entries: BundleEntry[] = [];

  for (const target of targets) {
    const fullPath = path.resolve(baseDir, target.filePath);
    const metrics = measureFile(fullPath);
    if (metrics !== null) {
      entries.push({
        ...target,
        metrics,
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    entries,
  };
}

export function formatBytes(bytes: number): string {
  if (Math.abs(bytes) < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} kB`;
}

export function formatDiff(current: number, base: number): string {
  const diff = current - base;
  if (diff === 0) {
    return '0 B (0.0%)';
  }
  const sign = diff > 0 ? '+' : '';
  const percent = base === 0 ? '100' : ((diff / base) * 100).toFixed(1);
  const formattedBytes = formatBytes(diff);
  return `${sign}${formattedBytes} (${sign}${percent}%)`;
}

// CLI entry point
const isMain =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  const outIndex = process.argv.indexOf('--out');
  const targetDirIndex = process.argv.indexOf('--dir');
  const targetDir =
    targetDirIndex !== -1 && process.argv[targetDirIndex + 1]
      ? path.resolve(process.argv[targetDirIndex + 1])
      : defaultRootDir;
  const report = collectBundleSizes(targetDir);

  if (outIndex !== -1 && process.argv[outIndex + 1]) {
    const outPath = path.resolve(process.argv[outIndex + 1]);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
    process.stdout.write(`Bundle size report saved to ${outPath}\n`);
  } else {
    process.stdout.write(`Discovered and measured ${report.entries.length} bundle targets:\n`);
    for (const entry of report.entries) {
      process.stdout.write(
        `  ${entry.package} [${entry.category}] ${entry.name}: Raw: ${formatBytes(entry.metrics.raw)} | Gzip: ${formatBytes(entry.metrics.gzip)} | Brotli: ${formatBytes(entry.metrics.brotli)}\n`,
      );
    }
  }
}
