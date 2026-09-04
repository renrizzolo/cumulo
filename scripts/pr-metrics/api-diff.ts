import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRootDir = path.resolve(__dirname, '../..');

export interface ExportedItem {
  name: string;
  kind: 'function' | 'variable' | 'type' | 'interface' | 'class' | 'export-specifier' | 'other';
  signature: string;
}

export interface FileApiSnapshot {
  fileRelPath: string;
  exports: Record<string, ExportedItem>;
}

export interface PackageApiSnapshot {
  pkgName: string;
  files: Record<string, FileApiSnapshot>;
}

export interface ApiSnapshot {
  timestamp: string;
  packages: Record<string, PackageApiSnapshot>;
}

export interface ExportChange {
  pkgName: string;
  fileRelPath: string;
  name: string;
  type: 'added' | 'removed' | 'modified';
  before?: string;
  after?: string;
}

export interface ApiDiffReport {
  timestamp: string;
  hasChanges: boolean;
  changes: ExportChange[];
}

const PUBLIC_PACKAGES = [
  { name: '@cumulo/css', dir: 'packages/css/dist' },
  { name: '@cumulo/core', dir: 'packages/core/dist' },
  { name: '@cumulo/unplugin', dir: 'packages/unplugin/dist' },
  { name: '@cumulo/parcel-transformer', dir: 'packages/parcel-transformer/dist' },
] as const;

function findDeclarationFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findDeclarationFiles(fullPath, fileList);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.d.ts') ||
        entry.name.endsWith('.d.mts') ||
        entry.name.endsWith('.d.cts'))
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function normalizeSignature(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

function extractFileExports(filePath: string, sourceText: string): FileApiSnapshot {
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);

  const exportsRecord: Record<string, ExportedItem> = {};

  function hasExportModifier(node: ts.Node): boolean {
    if (!ts.canHaveModifiers(node)) {
      return false;
    }
    const modifiers = ts.getModifiers(node);
    if (!modifiers) {
      return false;
    }
    return modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword);
  }

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          const exportName = element.name.text;
          const propName = element.propertyName ? element.propertyName.text : exportName;
          exportsRecord[exportName] = {
            name: exportName,
            kind: 'export-specifier',
            signature:
              propName !== exportName
                ? `export { ${propName} as ${exportName} }`
                : `export { ${exportName} }`,
          };
        }
      }
    } else if (hasExportModifier(statement)) {
      if (ts.isFunctionDeclaration(statement) && statement.name) {
        const name = statement.name.text;
        exportsRecord[name] = {
          name,
          kind: 'function',
          signature: normalizeSignature(statement.getText(sourceFile)),
        };
      } else if (ts.isVariableStatement(statement)) {
        for (const decl of statement.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            const name = decl.name.text;
            exportsRecord[name] = {
              name,
              kind: 'variable',
              signature: normalizeSignature(statement.getText(sourceFile)),
            };
          }
        }
      } else if (ts.isTypeAliasDeclaration(statement)) {
        const name = statement.name.text;
        exportsRecord[name] = {
          name,
          kind: 'type',
          signature: normalizeSignature(statement.getText(sourceFile)),
        };
      } else if (ts.isInterfaceDeclaration(statement)) {
        const name = statement.name.text;
        exportsRecord[name] = {
          name,
          kind: 'interface',
          signature: normalizeSignature(statement.getText(sourceFile)),
        };
      } else if (ts.isClassDeclaration(statement) && statement.name) {
        const name = statement.name.text;
        exportsRecord[name] = {
          name,
          kind: 'class',
          signature: normalizeSignature(statement.getText(sourceFile)),
        };
      }
    }
  }

  return {
    fileRelPath: filePath,
    exports: exportsRecord,
  };
}

export function captureApiSnapshot(baseDir: string = defaultRootDir): ApiSnapshot {
  const packagesRecord: Record<string, PackageApiSnapshot> = {};

  for (const pkg of PUBLIC_PACKAGES) {
    const distDir = path.resolve(baseDir, pkg.dir);
    const files = findDeclarationFiles(distDir);
    const fileSnapshots: Record<string, FileApiSnapshot> = {};

    for (const file of files) {
      const relPath = path.relative(distDir, file).replace(/\\/g, '/');
      // Skip internal / test declaration files if any
      if (relPath.includes('test/') || relPath.endsWith('.map')) {
        continue;
      }
      const content = fs.readFileSync(file, 'utf-8');
      fileSnapshots[relPath] = extractFileExports(relPath, content);
    }

    packagesRecord[pkg.name] = {
      pkgName: pkg.name,
      files: fileSnapshots,
    };
  }

  return {
    timestamp: new Date().toISOString(),
    packages: packagesRecord,
  };
}

export function diffApiSnapshots(
  baseSnapshot: ApiSnapshot,
  currentSnapshot: ApiSnapshot,
): ApiDiffReport {
  const changes: ExportChange[] = [];

  for (const [pkgName, currentPkg] of Object.entries(currentSnapshot.packages)) {
    const basePkg = baseSnapshot.packages[pkgName];
    if (!basePkg) {
      // Entire package is new
      for (const [fileRel, fileSnap] of Object.entries(currentPkg.files)) {
        for (const [expName, expItem] of Object.entries(fileSnap.exports)) {
          changes.push({
            pkgName,
            fileRelPath: fileRel,
            name: expName,
            type: 'added',
            after: expItem.signature,
          });
        }
      }
      continue;
    }

    for (const [fileRel, currentFile] of Object.entries(currentPkg.files)) {
      const baseFile = basePkg.files[fileRel];
      if (!baseFile) {
        // Entire declaration file is new
        for (const [expName, expItem] of Object.entries(currentFile.exports)) {
          changes.push({
            pkgName,
            fileRelPath: fileRel,
            name: expName,
            type: 'added',
            after: expItem.signature,
          });
        }
        continue;
      }

      // Compare symbols inside existing file
      for (const [expName, currentExp] of Object.entries(currentFile.exports)) {
        const baseExp = baseFile.exports[expName];
        if (!baseExp) {
          changes.push({
            pkgName,
            fileRelPath: fileRel,
            name: expName,
            type: 'added',
            after: currentExp.signature,
          });
        } else if (baseExp.signature !== currentExp.signature) {
          changes.push({
            pkgName,
            fileRelPath: fileRel,
            name: expName,
            type: 'modified',
            before: baseExp.signature,
            after: currentExp.signature,
          });
        }
      }

      // Check for removed symbols in file
      for (const [expName, baseExp] of Object.entries(baseFile.exports)) {
        if (!currentFile.exports[expName]) {
          changes.push({
            pkgName,
            fileRelPath: fileRel,
            name: expName,
            type: 'removed',
            before: baseExp.signature,
          });
        }
      }
    }

    // Check for removed declaration files
    for (const [fileRel, baseFile] of Object.entries(basePkg.files)) {
      if (!currentPkg.files[fileRel]) {
        for (const [expName, baseExp] of Object.entries(baseFile.exports)) {
          changes.push({
            pkgName,
            fileRelPath: fileRel,
            name: expName,
            type: 'removed',
            before: baseExp.signature,
          });
        }
      }
    }
  }

  // Check for removed packages
  for (const [pkgName, basePkg] of Object.entries(baseSnapshot.packages)) {
    if (!currentSnapshot.packages[pkgName]) {
      for (const [fileRel, fileSnap] of Object.entries(basePkg.files)) {
        for (const [expName, baseExp] of Object.entries(fileSnap.exports)) {
          changes.push({
            pkgName,
            fileRelPath: fileRel,
            name: expName,
            type: 'removed',
            before: baseExp.signature,
          });
        }
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    hasChanges: changes.length > 0,
    changes,
  };
}

// CLI entry point
const isMain =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  const outIndex = process.argv.indexOf('--out');
  const targetDirIndex = process.argv.indexOf('--dir');
  const baseDir =
    targetDirIndex !== -1 && process.argv[targetDirIndex + 1]
      ? path.resolve(process.argv[targetDirIndex + 1])
      : defaultRootDir;
  const snapshot = captureApiSnapshot(baseDir);

  if (outIndex !== -1 && process.argv[outIndex + 1]) {
    const outPath = path.resolve(process.argv[outIndex + 1]);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf-8');
    process.stdout.write(`API snapshot saved to ${outPath}\n`);
  } else {
    let totalExports = 0;
    for (const pkg of Object.values(snapshot.packages)) {
      for (const f of Object.values(pkg.files)) {
        totalExports += Object.keys(f.exports).length;
      }
    }
    process.stdout.write(
      `API Snapshot: Analyzed ${Object.keys(snapshot.packages).length} packages, found ${totalExports} public exports.\n`,
    );
  }
}
