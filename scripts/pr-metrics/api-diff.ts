import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Diff from 'diff';
import ts from 'typescript';
import { getCliArg, isDirectExecution, writeCliOutputFile } from './cli-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRootDir = path.resolve(__dirname, '../..');

export interface ExportedItem {
  name: string;
  kind: 'function' | 'variable' | 'type' | 'interface' | 'class' | 'enum' | 'other';
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
  symbolId: string;
  name: string;
  type: 'added' | 'removed' | 'modified';
  diffBlock: string;
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

export function findDeclarationFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findDeclarationFiles(fullPath, fileList);
    } else if (entry.isFile()) {
      if (
        entry.name.endsWith('.map') ||
        entry.name.includes('test') ||
        /-[A-Za-z0-9_-]{6,}\.d\./.test(entry.name)
      ) {
        continue;
      }

      if (entry.name.endsWith('.d.mts') || entry.name.endsWith('.d.ts')) {
        fileList.push(fullPath);
      } else if (entry.name.endsWith('.d.cts')) {
        const matchingMts = fullPath.replace(/\.d\.cts$/, '.d.mts');
        if (!fs.existsSync(matchingMts)) {
          fileList.push(fullPath);
        }
      }
    }
  }
  return fileList;
}

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
}

function formatSortedMembers(
  members: readonly (ts.TypeElement | ts.ClassElement)[],
  sf: ts.SourceFile,
): string[] {
  return members
    .map((m) => {
      let text = stripComments(m.getText(sf));
      if (text.endsWith(';')) text = text.slice(0, -1);
      return `  ${text}`;
    })
    .filter((line) => line.trim().length > 0)
    .toSorted();
}

function formatTypeParams(
  typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined,
  sf: ts.SourceFile,
): string {
  return typeParameters ? `<${typeParameters.map((tp) => tp.getText(sf)).join(', ')}>` : '';
}

function formatHeritage(
  heritageClauses: ts.NodeArray<ts.HeritageClause> | undefined,
  sf: ts.SourceFile,
): string {
  return heritageClauses ? ` ${heritageClauses.map((h) => h.getText(sf)).join(' ')}` : '';
}

function formatBlockType(
  keyword: string,
  name: string,
  typeParams: string,
  heritage: string,
  members: string[],
): string {
  const prefix = keyword ? `${keyword} ` : '';
  return `${prefix}${name}${typeParams}${heritage} {\n${members.join('\n')}\n}`;
}

function formatInterface(node: ts.InterfaceDeclaration, sf: ts.SourceFile): string {
  return formatBlockType(
    '',
    node.name.text,
    formatTypeParams(node.typeParameters, sf),
    formatHeritage(node.heritageClauses, sf),
    formatSortedMembers(node.members, sf),
  );
}

function formatTypeAlias(node: ts.TypeAliasDeclaration, sf: ts.SourceFile): string {
  const name = node.name.text;
  const typeParams = formatTypeParams(node.typeParameters, sf);

  if (ts.isTypeLiteralNode(node.type)) {
    return formatBlockType(
      'type',
      `${name}${typeParams} =`,
      '',
      '',
      formatSortedMembers(node.type.members, sf),
    );
  }

  let typeText = stripComments(node.type.getText(sf));
  if (typeText.endsWith(';')) typeText = typeText.slice(0, -1);
  return `type ${name}${typeParams} = ${typeText}`;
}

function formatFunction(node: ts.FunctionDeclaration, sf: ts.SourceFile): string {
  const name = node.name ? node.name.text : 'anonymous';
  const typeParams = formatTypeParams(node.typeParameters, sf);
  const returnType = node.type ? `: ${node.type.getText(sf)}` : '';

  const params = node.parameters
    .map((p) => {
      if (ts.isObjectBindingPattern(p.name) && p.type) {
        return `props: ${p.type.getText(sf)}`;
      }
      return p.getText(sf);
    })
    .join(', ');

  return `function ${name}${typeParams}(${params})${returnType}`;
}

function collectVariantLiteralMembers(arg: ts.TypeNode): ts.TypeLiteralNode[] {
  if (ts.isTypeLiteralNode(arg)) return [arg];
  if (ts.isIntersectionTypeNode(arg)) {
    return arg.types.filter(ts.isTypeLiteralNode);
  }
  return [];
}

function collectRecipeVariantMap(
  typeLiterals: ts.TypeLiteralNode[],
  sf: ts.SourceFile,
): Map<string, Set<string>> {
  const variantMap = new Map<string, Set<string>>();
  for (const lit of typeLiterals) {
    for (const member of lit.members) {
      const varName = member.name ? member.name.getText(sf) : '';
      if (
        !varName ||
        !('type' in member) ||
        !member.type ||
        !ts.isTypeLiteralNode(member.type as ts.TypeNode)
      ) {
        continue;
      }
      const typeLit = member.type as ts.TypeLiteralNode;
      const values = typeLit.members.map((m) => (m.name ? m.name.getText(sf) : '')).filter(Boolean);
      const existing = variantMap.get(varName) || new Set<string>();
      for (const v of values) existing.add(v);
      variantMap.set(varName, existing);
    }
  }
  return variantMap;
}

function extractRecipeVariants(typeNode: ts.TypeNode, sf: ts.SourceFile): string | null {
  const text = typeNode.getText(sf);
  if (!text.includes('RecipeFunction')) return null;

  const typeArgs = (typeNode as ts.TypeReferenceNode).typeArguments;
  if (!typeArgs || typeArgs.length === 0) return null;

  const typeLiterals = collectVariantLiteralMembers(typeArgs[0]);
  if (typeLiterals.length === 0) return null;

  const variantMap = collectRecipeVariantMap(typeLiterals, sf);
  const sortedKeys = Array.from(variantMap.keys()).toSorted();
  const lines = sortedKeys.map((k) => {
    const vals = Array.from(variantMap.get(k)!)
      .toSorted()
      .map((v) => `'${v}'`)
      .join(' | ');
    return `  ${k}?: ${vals}`;
  });

  return `RecipeFunction<{\n${lines.join('\n')}\n}>`;
}

function formatVariable(decl: ts.VariableDeclaration, isConst: boolean, sf: ts.SourceFile): string {
  const name = decl.name.getText(sf);
  const keyword = isConst ? 'const' : 'let';

  if (decl.type) {
    const recipeStr = extractRecipeVariants(decl.type, sf);
    if (recipeStr) {
      return `${keyword} ${name}: ${recipeStr}`;
    }
    let typeText = stripComments(decl.type.getText(sf));
    if (typeText.endsWith(';')) typeText = typeText.slice(0, -1);
    typeText = typeText.replace(/import\([^)]+\)\./g, '');
    return `${keyword} ${name}: ${typeText}`;
  }

  return `${keyword} ${name}`;
}

function formatClass(node: ts.ClassDeclaration, sf: ts.SourceFile): string {
  return formatBlockType(
    'class',
    node.name ? node.name.text : 'anonymous',
    formatTypeParams(node.typeParameters, sf),
    formatHeritage(node.heritageClauses, sf),
    formatSortedMembers(node.members, sf),
  );
}

function formatEnum(node: ts.EnumDeclaration, sf: ts.SourceFile): string {
  const name = node.name.text;
  const members = node.members.map((m) => `  ${m.getText(sf)}`);
  return `enum ${name} {\n${members.join('\n')}\n}`;
}

function hasExportModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) return false;
  const modifiers = ts.getModifiers(node);
  return modifiers ? modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword) : false;
}

function getExportedName(
  stmt: ts.DeclarationStatement,
  exportedSpecifiers: Map<string, string>,
): string | null {
  if (!stmt.name || !ts.isIdentifier(stmt.name)) return null;
  const localName = stmt.name.text;
  if (exportedSpecifiers.has(localName)) {
    return exportedSpecifiers.get(localName)!;
  }
  if (hasExportModifier(stmt)) {
    return localName;
  }
  return null;
}

function parseImports(stmt: ts.Statement, importedSpecifiers: Map<string, string>): void {
  if (
    ts.isImportDeclaration(stmt) &&
    stmt.importClause?.namedBindings &&
    ts.isNamedImports(stmt.importClause.namedBindings) &&
    ts.isStringLiteral(stmt.moduleSpecifier)
  ) {
    const mod = stmt.moduleSpecifier.text;
    for (const elem of stmt.importClause.namedBindings.elements) {
      importedSpecifiers.set(elem.name.text, mod);
    }
  }
}

function parseExports(stmt: ts.Statement, exportedSpecifiers: Map<string, string>): void {
  if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
    for (const elem of stmt.exportClause.elements) {
      const expName = elem.name.text;
      const localName = elem.propertyName ? elem.propertyName.text : expName;
      exportedSpecifiers.set(localName, expName);
    }
  }
}

function parseImportsAndExports(sf: ts.SourceFile): {
  exportedSpecifiers: Map<string, string>;
  importedSpecifiers: Map<string, string>;
} {
  const exportedSpecifiers = new Map<string, string>();
  const importedSpecifiers = new Map<string, string>();

  for (const stmt of sf.statements) {
    parseImports(stmt, importedSpecifiers);
    parseExports(stmt, exportedSpecifiers);
  }

  return { exportedSpecifiers, importedSpecifiers };
}

function extractDeclaredExport(
  stmt: ts.Statement,
  sf: ts.SourceFile,
  exportedSpecifiers: Map<string, string>,
  exportsRecord: Record<string, ExportedItem>,
): void {
  if (ts.isInterfaceDeclaration(stmt)) {
    const expName = getExportedName(stmt, exportedSpecifiers);
    if (expName) {
      exportsRecord[expName] = {
        name: expName,
        kind: 'interface',
        signature: formatInterface(stmt, sf),
      };
    }
  } else if (ts.isTypeAliasDeclaration(stmt)) {
    const expName = getExportedName(stmt, exportedSpecifiers);
    if (expName) {
      exportsRecord[expName] = {
        name: expName,
        kind: 'type',
        signature: formatTypeAlias(stmt, sf),
      };
    }
  } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
    const expName = getExportedName(stmt, exportedSpecifiers);
    if (expName) {
      exportsRecord[expName] = {
        name: expName,
        kind: 'function',
        signature: formatFunction(stmt, sf),
      };
    }
  } else if (ts.isVariableStatement(stmt)) {
    const isConst = (stmt.declarationList.flags & ts.NodeFlags.Const) !== 0;
    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name)) {
        const localName = decl.name.text;
        const isExported = exportedSpecifiers.has(localName) || hasExportModifier(stmt);
        if (isExported) {
          const expName = exportedSpecifiers.get(localName) ?? localName;
          exportsRecord[expName] = {
            name: expName,
            kind: 'variable',
            signature: formatVariable(decl, isConst, sf),
          };
        }
      }
    }
  } else if (ts.isClassDeclaration(stmt) && stmt.name) {
    const expName = getExportedName(stmt, exportedSpecifiers);
    if (expName) {
      exportsRecord[expName] = {
        name: expName,
        kind: 'class',
        signature: formatClass(stmt, sf),
      };
    }
  } else if (ts.isEnumDeclaration(stmt)) {
    const expName = getExportedName(stmt, exportedSpecifiers);
    if (expName) {
      exportsRecord[expName] = {
        name: expName,
        kind: 'enum',
        signature: formatEnum(stmt, sf),
      };
    }
  }
}

export function extractFileExports(
  filePath: string,
  sourceText: string,
  knownSubpaths: Set<string> = new Set(),
): FileApiSnapshot {
  const sf = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const exportsRecord: Record<string, ExportedItem> = {};
  const { exportedSpecifiers, importedSpecifiers } = parseImportsAndExports(sf);

  for (const stmt of sf.statements) {
    extractDeclaredExport(stmt, sf, exportedSpecifiers, exportsRecord);
  }

  for (const [localName, expName] of exportedSpecifiers.entries()) {
    if (!exportsRecord[expName]) {
      const importSource = importedSpecifiers.get(localName);
      if (importSource && importSource.startsWith('.')) {
        const resolvedSubpath = path
          .normalize(path.join(path.dirname(filePath), importSource))
          .replace(/\\/g, '/')
          .replace(/\.(mjs|js|cjs)$/, '');

        if (knownSubpaths.has(resolvedSubpath)) {
          continue;
        }
      }

      exportsRecord[expName] = {
        name: expName,
        kind: 'other',
        signature: `export { ${localName !== expName ? `${localName} as ${expName}` : expName} }`,
      };
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

    const knownSubpaths = new Set<string>();
    for (const file of files) {
      const relPath = path.relative(distDir, file).replace(/\\/g, '/');
      const noExt = relPath.replace(/\.d\.[cm]?ts$/, '');
      knownSubpaths.add(noExt);
    }

    const fileSnapshots: Record<string, FileApiSnapshot> = {};

    for (const file of files) {
      const relPath = path.relative(distDir, file).replace(/\\/g, '/');
      const content = fs.readFileSync(file, 'utf-8');
      const snapshot = extractFileExports(relPath, content, knownSubpaths);
      if (Object.keys(snapshot.exports).length > 0) {
        fileSnapshots[relPath] = snapshot;
      }
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

export function formatSymbolIdentifier(pkgName: string, fileRelPath: string, name: string): string {
  const cleanRel = fileRelPath.replace(/\.d\.[cm]?ts$/, '');
  if (cleanRel === 'index') {
    return `/${pkgName}:${name}`;
  }
  return `/${pkgName}/${cleanRel}:${name}`;
}

function computeCompactDiff(oldLines: string[], hunks: Diff.StructuredPatchHunk[]): string[] {
  const result: string[] = [];
  let prevEnd = 1;

  for (const hunk of hunks) {
    if (hunk.oldStart > prevEnd) {
      result.push(...oldLines.slice(prevEnd - 1, hunk.oldStart - 1).map((item) => ` ${item}`));
    }
    for (const line of hunk.lines) {
      if (!line.startsWith('\\')) {
        result.push(line);
      }
    }
    prevEnd = hunk.oldStart + hunk.oldLines;
  }
  if (prevEnd - 1 < oldLines.length) {
    result.push(...oldLines.slice(prevEnd - 1).map((item) => ` ${item}`));
  }
  return result;
}

function computeStandardHunks(hunks: Diff.StructuredPatchHunk[]): string[] {
  const result: string[] = [];
  for (const hunk of hunks) {
    result.push(`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`);
    for (const line of hunk.lines) {
      if (!line.startsWith('\\')) {
        result.push(line);
      }
    }
  }
  return result;
}

export function computeDiffBlock(oldText?: string, newText?: string): string {
  if (!oldText && newText) {
    const lines = newText.split('\n').map((l) => `+ ${l}`);
    return `\`\`\`diff\n${lines.join('\n')}\n\`\`\``;
  }
  if (oldText && !newText) {
    const lines = oldText.split('\n').map((l) => `- ${l}`);
    return `\`\`\`diff\n${lines.join('\n')}\n\`\`\``;
  }
  if (!oldText || !newText || oldText === newText) {
    return '';
  }

  const patch = Diff.structuredPatch('old', 'new', oldText, newText, undefined, undefined);
  if (!patch || !patch.hunks || patch.hunks.length === 0) {
    return '';
  }

  const oldLines = oldText.split('\n');
  const result =
    oldLines.length <= 45
      ? computeCompactDiff(oldLines, patch.hunks)
      : computeStandardHunks(patch.hunks);

  return `\`\`\`diff\n${result.join('\n')}\n\`\`\``;
}

function pushChange(
  changes: ExportChange[],
  pkgName: string,
  fileRelPath: string,
  name: string,
  type: 'added' | 'removed' | 'modified',
  before?: string,
  after?: string,
): void {
  changes.push({
    pkgName,
    fileRelPath,
    symbolId: formatSymbolIdentifier(pkgName, fileRelPath, name),
    name,
    type,
    diffBlock: computeDiffBlock(before, after),
    before,
    after,
  });
}

function pushAllFileExports(
  changes: ExportChange[],
  pkgName: string,
  fileRel: string,
  fileSnap: FileApiSnapshot,
  type: 'added' | 'removed',
): void {
  for (const [expName, expItem] of Object.entries(fileSnap.exports)) {
    pushChange(
      changes,
      pkgName,
      fileRel,
      expName,
      type,
      type === 'removed' ? expItem.signature : undefined,
      type === 'added' ? expItem.signature : undefined,
    );
  }
}

function diffFileSymbols(
  changes: ExportChange[],
  pkgName: string,
  fileRel: string,
  baseFile: FileApiSnapshot,
  currentFile: FileApiSnapshot,
): void {
  for (const [expName, currentExp] of Object.entries(currentFile.exports)) {
    const baseExp = baseFile.exports[expName];
    if (!baseExp) {
      pushChange(changes, pkgName, fileRel, expName, 'added', undefined, currentExp.signature);
    } else if (baseExp.signature !== currentExp.signature) {
      pushChange(
        changes,
        pkgName,
        fileRel,
        expName,
        'modified',
        baseExp.signature,
        currentExp.signature,
      );
    }
  }

  for (const [expName, baseExp] of Object.entries(baseFile.exports)) {
    if (!currentFile.exports[expName]) {
      pushChange(changes, pkgName, fileRel, expName, 'removed', baseExp.signature, undefined);
    }
  }
}

export function diffApiSnapshots(
  baseSnapshot: ApiSnapshot,
  currentSnapshot: ApiSnapshot,
): ApiDiffReport {
  const changes: ExportChange[] = [];

  for (const [pkgName, currentPkg] of Object.entries(currentSnapshot.packages)) {
    const basePkg = baseSnapshot.packages[pkgName];
    if (!basePkg) {
      for (const [fileRel, fileSnap] of Object.entries(currentPkg.files)) {
        pushAllFileExports(changes, pkgName, fileRel, fileSnap, 'added');
      }
      continue;
    }

    for (const [fileRel, currentFile] of Object.entries(currentPkg.files)) {
      const baseFile = basePkg.files[fileRel];
      if (!baseFile) {
        pushAllFileExports(changes, pkgName, fileRel, currentFile, 'added');
        continue;
      }
      diffFileSymbols(changes, pkgName, fileRel, baseFile, currentFile);
    }

    for (const [fileRel, baseFile] of Object.entries(basePkg.files)) {
      if (!currentPkg.files[fileRel]) {
        pushAllFileExports(changes, pkgName, fileRel, baseFile, 'removed');
      }
    }
  }

  for (const [pkgName, basePkg] of Object.entries(baseSnapshot.packages)) {
    if (!currentSnapshot.packages[pkgName]) {
      for (const [fileRel, fileSnap] of Object.entries(basePkg.files)) {
        pushAllFileExports(changes, pkgName, fileRel, fileSnap, 'removed');
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
if (isDirectExecution(import.meta.url)) {
  const outPath = getCliArg('--out');
  const baseDir = getCliArg('--dir') ?? defaultRootDir;
  const snapshot = captureApiSnapshot(baseDir);

  if (outPath) {
    writeCliOutputFile(outPath, JSON.stringify(snapshot, null, 2));
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
