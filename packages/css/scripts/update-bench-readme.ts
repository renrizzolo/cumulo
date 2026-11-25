import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const START_MARKER = '<!-- benchmarks:start -->';
const END_MARKER = '<!-- benchmarks:end -->';

const LABEL_MAP: Readonly<Record<string, string>> = {
  'cx (simple strings)': '**`cx` (simple strings)**',
  'cx (mixed arguments with conditionals)': '**`cx` (mixed conditionals & objects)**',
  'recipe call (default variants)': '**`recipe` (default variants)**',
  'recipe call (overriding variants)': '**`recipe` (overriding variants)**',
  'recipe call (compound variant match)': '**`recipe` (compound variant match)**',
  'atomic style (simple)': '**`style` (simple atomic)**',
  'keyframes definition': '**`keyframes` definition**',
  'atomic style (complex with pseudo & media)': '**`style` (complex with media & pseudos)**',
  'createTheme instantiation': '**`createTheme` instantiation**',
};

interface VitestBenchTask {
  name?: string;
  latency?: {
    mean?: number;
    p99?: number;
    samplesCount?: number;
  };
  throughput?: {
    mean?: number;
  };
}

interface VitestBenchReport {
  testResults?: Array<{
    assertionResults?: Array<{
      benchmarks?: Array<{
        tasks?: VitestBenchTask[];
      }>;
    }>;
  }>;
}

interface BenchRow {
  readonly label: string;
  readonly hz: number;
  readonly meanMs: number;
  readonly p99Ms: number;
  readonly samples: number;
}

function extractRows(report: VitestBenchReport): BenchRow[] {
  const rows: BenchRow[] = [];

  for (const fileResult of report.testResults ?? []) {
    for (const assertion of fileResult.assertionResults ?? []) {
      for (const group of assertion.benchmarks ?? []) {
        for (const task of group.tasks ?? []) {
          const { name, latency, throughput } = task;
          if (
            !name ||
            throughput?.mean === undefined ||
            latency?.mean === undefined ||
            latency.p99 === undefined ||
            latency.samplesCount === undefined
          ) {
            continue;
          }

          rows.push({
            label: LABEL_MAP[name] ?? `**${name}**`,
            hz: throughput.mean,
            meanMs: latency.mean,
            p99Ms: latency.p99,
            samples: latency.samplesCount,
          });
        }
      }
    }
  }

  return rows.toSorted((a, b) => b.hz - a.hz);
}

function formatTable(rows: readonly BenchRow[]): string {
  const nodeMajor = process.versions.node.split('.')[0] ?? process.versions.node;
  const lines = [
    `Benchmarked with **Vitest Bench** (\`packages/css/bench/css.bench.ts\`) on Node ${nodeMajor} (V8).`,
    '',
    '| Benchmark Test | Operations / sec | Mean Latency | p99 Latency | Samples |',
    '| :------------- | :--------------: | :----------: | :---------: | :-----: |',
    ...rows.map((row) => {
      const ops = `**${Math.round(row.hz).toLocaleString('en-US')} ops/s**`;
      const meanUs = `\`${(row.meanMs * 1000).toFixed(2)} µs\``;
      const p99Us = `\`${(row.p99Ms * 1000).toFixed(2)} µs\``;
      const samples = Math.round(row.samples).toLocaleString('en-US');
      return `| ${row.label} | ${ops} | ${meanUs} | ${p99Us} | ${samples} |`;
    }),
  ];
  return lines.join('\n');
}

function main(): void {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const pkgDir = resolve(scriptDir, '..');
  const repoRoot = resolve(pkgDir, '../..');
  const readmePath = join(pkgDir, 'README.md');
  const outputPath = join(tmpdir(), `cumulo-css-bench-${process.pid}.json`);

  try {
    execFileSync(
      'pnpm',
      [
        'exec',
        'vitest',
        'bench',
        'packages/css',
        '--reporter=default',
        '--reporter=json',
        `--outputFile.json=${outputPath}`,
      ],
      {
        cwd: repoRoot,
        stdio: 'inherit',
      },
    );

    const report: VitestBenchReport = JSON.parse(readFileSync(outputPath, 'utf8'));
    const rows = extractRows(report);
    if (rows.length === 0) {
      throw new Error('No benchmark tasks found in Vitest JSON report');
    }

    const readme = readFileSync(readmePath, 'utf8');
    const startIdx = readme.indexOf(START_MARKER);
    const endIdx = readme.indexOf(END_MARKER);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      throw new Error(`Missing ${START_MARKER} / ${END_MARKER} markers in ${readmePath}`);
    }

    const before = readme.slice(0, startIdx + START_MARKER.length);
    const after = readme.slice(endIdx);
    const updated = `${before}\n\n${formatTable(rows)}\n\n${after}`;
    writeFileSync(readmePath, updated, 'utf8');

    console.log(`\nUpdated ${readmePath} with ${rows.length} benchmark results.`);
  } finally {
    rmSync(outputPath, { force: true });
  }
}

main();
