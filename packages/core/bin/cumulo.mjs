#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distCliSubdir = path.resolve(__dirname, '../dist/cli/index.mjs');
const distCliRoot = path.resolve(__dirname, '../dist/cli.mjs');

const entry = fs.existsSync(distCliSubdir)
  ? '../dist/cli/index.mjs'
  : fs.existsSync(distCliRoot)
    ? '../dist/cli.mjs'
    : '../src/cli/index.ts';

import(entry).catch((err) => {
  console.error('[cumulo] Failed to launch CLI:', err);
  process.exit(1);
});
