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

interface BenchRow {
  readonly label: string;
  readonly hz: number;
  readonly meanMs: number;
  readonly p99Ms: number;
  readonly samples: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractRows(json: unknown): BenchRow[] {
  if (!isRecord(json) || !Array.isArray(json.testResults)) {
    throw new Error('Unexpected Vitest JSON report structure: missing testResults');
  }

  const rows: BenchRow[] = [];

  for (const fileResult of json.testResults) {
    if (!isRecord(fileResult) || !Array.isArray(fileResult.assertionResults)) continue;
    for (const assertion of fileResult.assertionResults) {
      if (!isRecord(assertion) || !Array.isArray(assertion.benchmarks)) continue;
      for (const group of assertion.benchmarks) {
        if (!isRecord(group) || !Array.isArray(group.tasks)) continue;
        for (const task of group.tasks) {
          if (!isRecord(task) || typeof task.name !== 'string') continue;
          if (!isRecord(task.latency) || !isRecord(task.throughput)) continue;

          const hz = task.throughput.mean;
          const meanMs = task.latency.mean;
          const p99Ms = task.latency.p99;
          const samples = task.latency.samplesCount;

          if (
            typeof hz !== 'number' ||
            typeof meanMs !== 'number' ||
            typeof p99Ms !== 'number' ||
            typeof samples !== 'number'
          ) {
            continue;
          }

          rows.push({
            label: LABEL_MAP[task.name] ?? `**${task.name}**`,
            hz,
            meanMs,
            p99Ms,
            samples,
          });
        }
      }
    }
  }

  return rows.sort((a, b) => b.hz - a.hz);
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

    const raw: unknown = JSON.parse(readFileSync(outputPath, 'utf8'));
    const rows = extractRows(raw);
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
