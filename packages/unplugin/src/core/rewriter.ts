import { parseSync } from 'oxc-parser';

export type RewritableApiKind =
  | 'style'
  | 'create'
  | 'keyframes'
  | 'recipe'
  | 'createTheme'
  | 'createGlobalTheme'
  | 'createGlobalStyles';

const REWRITABLE_APIS = new Set<string>([
  'style',
  'create',
  'keyframes',
  'recipe',
  'createTheme',
  'createGlobalTheme',
  'createGlobalStyles',
]);

const RUNTIME_REDIRECTABLE_APIS = new Set<string>(['cx', 'createThemeContract', 'assignVars']);

export interface RecordedCall {
  count: number;
  value: unknown;
}

interface AstNode {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

interface CallSite {
  id: number;
  kind: RewritableApiKind;
  start: number;
  end: number;
  isStatement: boolean;
}

interface LocalContractDecl {
  name: string;
  stmtStart: number;
  stmtEnd: number;
  initStart: number;
  initEnd: number;
}

interface TextEdit {
  start: number;
  end: number;
  replacement: string;
}

interface ParsedImportSpecifier {
  type: 'ImportSpecifier' | 'ImportDefaultSpecifier' | 'ImportNamespaceSpecifier';
  localName: string;
  importedName?: string;
  isTypeOnly: boolean;
}

interface ParsedImportDecl {
  start: number;
  end: number;
  source: string;
  rawSource: string;
  isTypeOnly: boolean;
  specifiers: ParsedImportSpecifier[];
}

export interface RewritePlan {
  instrumentedSource: string;
  callCount: number;
  applyRewrites(recorded: ReadonlyMap<number, RecordedCall>): string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAstNode(value: unknown): value is AstNode {
  return (
    isRecord(value) &&
    typeof value.type === 'string' &&
    typeof value.start === 'number' &&
    typeof value.end === 'number'
  );
}

function isRewritableApi(name: string): name is RewritableApiKind {
  return REWRITABLE_APIS.has(name);
}

function getIdentifierName(node: unknown): string | undefined {
  if (!isAstNode(node)) {
    return undefined;
  }
  if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
    return typeof node.name === 'string' ? node.name : undefined;
  }
  return undefined;
}

function getStringLiteralValue(node: unknown): string | undefined {
  if (!isAstNode(node)) {
    return undefined;
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  return undefined;
}

function parseImportDeclarations(body: unknown[], source: string): ParsedImportDecl[] {
  const imports: ParsedImportDecl[] = [];

  for (const stmt of body) {
    if (!isAstNode(stmt) || stmt.type !== 'ImportDeclaration') {
      continue;
    }
    const sourceNode = stmt.source;
    const sourceVal = getStringLiteralValue(sourceNode);
    if (!isAstNode(sourceNode) || sourceVal === undefined) {
      continue;
    }

    const isTypeOnly = stmt.importKind === 'type';
    const rawSpecs = Array.isArray(stmt.specifiers) ? stmt.specifiers : [];
    const specifiers: ParsedImportSpecifier[] = [];

    for (const spec of rawSpecs) {
      if (!isAstNode(spec)) {
        continue;
      }
      const localName = getIdentifierName(spec.local);
      if (!localName) {
        continue;
      }

      if (spec.type === 'ImportSpecifier') {
        const importedName =
          getIdentifierName(spec.imported) ?? getStringLiteralValue(spec.imported);
        specifiers.push({
          type: 'ImportSpecifier',
          localName,
          importedName,
          isTypeOnly: spec.importKind === 'type',
        });
      } else if (spec.type === 'ImportDefaultSpecifier') {
        specifiers.push({
          type: 'ImportDefaultSpecifier',
          localName,
          isTypeOnly: false,
        });
      } else if (spec.type === 'ImportNamespaceSpecifier') {
        specifiers.push({
          type: 'ImportNamespaceSpecifier',
          localName,
          isTypeOnly: false,
        });
      }
    }

    imports.push({
      start: stmt.start,
      end: stmt.end,
      source: sourceVal,
      rawSource: source.slice(sourceNode.start, sourceNode.end),
      isTypeOnly,
      specifiers,
    });
  }

  return imports;
}

function matchCallApi(
  callee: unknown,
  localToApi: ReadonlyMap<string, RewritableApiKind>,
  namespaceNames: ReadonlySet<string>,
): RewritableApiKind | undefined {
  const directName = getIdentifierName(callee);
  if (directName) {
    return localToApi.get(directName);
  }

  if (isAstNode(callee) && callee.type === 'MemberExpression' && callee.computed !== true) {
    const objName = getIdentifierName(callee.object);
    const propName = getIdentifierName(callee.property);
    if (objName && propName && namespaceNames.has(objName) && isRewritableApi(propName)) {
      return propName;
    }
  }

  return undefined;
}

function isContractCall(
  callee: unknown,
  contractLocals: ReadonlySet<string>,
  namespaceNames: ReadonlySet<string>,
): boolean {
  const directName = getIdentifierName(callee);
  if (directName && contractLocals.has(directName)) {
    return true;
  }
  if (isAstNode(callee) && callee.type === 'MemberExpression' && callee.computed !== true) {
    const objName = getIdentifierName(callee.object);
    const propName = getIdentifierName(callee.property);
    return Boolean(
      objName && propName && namespaceNames.has(objName) && propName === 'createThemeContract',
    );
  }
  return false;
}

function unwrapTypeExpr(node: unknown): AstNode | undefined {
  let current: unknown = node;
  while (isAstNode(current)) {
    if (
      current.type === 'ParenthesizedExpression' ||
      current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TSNonNullExpression'
    ) {
      current = current.expression;
      continue;
    }
    return current;
  }
  return undefined;
}

function collectIdentifiers(
  node: unknown,
  target: Set<string>,
  excludedSpans: ReadonlyArray<{ start: number; end: number }>,
): void {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      collectIdentifiers(item, target, excludedSpans);
    }
    return;
  }

  if (!isAstNode(node)) {
    return;
  }

  for (const span of excludedSpans) {
    if (node.start >= span.start && node.end <= span.end) {
      return;
    }
  }

  switch (node.type) {
    case 'ImportDeclaration':
      return;

    case 'Identifier':
    case 'JSXIdentifier': {
      if (typeof node.name === 'string') {
        target.add(node.name);
      }
      return;
    }

    case 'MemberExpression': {
      collectIdentifiers(node.object, target, excludedSpans);
      if (node.computed === true) {
        collectIdentifiers(node.property, target, excludedSpans);
      }
      return;
    }

    case 'JSXMemberExpression': {
      collectIdentifiers(node.object, target, excludedSpans);
      return;
    }

    case 'JSXAttribute': {
      collectIdentifiers(node.value, target, excludedSpans);
      return;
    }

    case 'Property':
    case 'ObjectProperty': {
      if (node.computed === true) {
        collectIdentifiers(node.key, target, excludedSpans);
      }
      collectIdentifiers(node.value, target, excludedSpans);
      return;
    }

    case 'MethodDefinition':
    case 'PropertyDefinition': {
      if (node.computed === true) {
        collectIdentifiers(node.key, target, excludedSpans);
      }
      collectIdentifiers(node.value, target, excludedSpans);
      return;
    }

    case 'VariableDeclarator': {
      if (isAstNode(node.id) && 'typeAnnotation' in node.id) {
        collectIdentifiers(node.id.typeAnnotation, target, excludedSpans);
      }
      collectIdentifiers(node.init, target, excludedSpans);
      return;
    }

    case 'ExportSpecifier': {
      collectIdentifiers(node.local, target, excludedSpans);
      return;
    }

    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression': {
      collectIdentifiers(node.typeParameters, target, excludedSpans);
      collectIdentifiers(node.returnType, target, excludedSpans);
      if (Array.isArray(node.params)) {
        for (const param of node.params) {
          collectIdentifiersInParam(param, target, excludedSpans);
        }
      }
      collectIdentifiers(node.body, target, excludedSpans);
      return;
    }

    case 'LabeledStatement': {
      collectIdentifiers(node.body, target, excludedSpans);
      return;
    }

    default: {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'type' || key === 'start' || key === 'end') {
          continue;
        }
        collectIdentifiers(value, target, excludedSpans);
      }
    }
  }
}

function collectIdentifiersInParam(
  param: unknown,
  target: Set<string>,
  excludedSpans: ReadonlyArray<{ start: number; end: number }>,
): void {
  if (!isAstNode(param)) {
    return;
  }
  switch (param.type) {
    case 'Identifier':
      if ('typeAnnotation' in param) {
        collectIdentifiers(param.typeAnnotation, target, excludedSpans);
      }
      return;
    case 'AssignmentPattern':
      collectIdentifiersInParam(param.left, target, excludedSpans);
      collectIdentifiers(param.right, target, excludedSpans);
      return;
    case 'RestElement':
      collectIdentifiersInParam(param.argument, target, excludedSpans);
      if ('typeAnnotation' in param) {
        collectIdentifiers(param.typeAnnotation, target, excludedSpans);
      }
      return;
    case 'ObjectPattern':
      if (Array.isArray(param.properties)) {
        for (const prop of param.properties) {
          if (!isAstNode(prop)) continue;
          if (prop.type === 'RestElement') {
            collectIdentifiersInParam(prop, target, excludedSpans);
          } else {
            if (prop.computed === true) {
              collectIdentifiers(prop.key, target, excludedSpans);
            }
            collectIdentifiersInParam(prop.value, target, excludedSpans);
          }
        }
      }
      if ('typeAnnotation' in param) {
        collectIdentifiers(param.typeAnnotation, target, excludedSpans);
      }
      return;
    case 'ArrayPattern':
      if (Array.isArray(param.elements)) {
        for (const el of param.elements) {
          collectIdentifiersInParam(el, target, excludedSpans);
        }
      }
      if ('typeAnnotation' in param) {
        collectIdentifiers(param.typeAnnotation, target, excludedSpans);
      }
      return;
    default:
      collectIdentifiers(param, target, excludedSpans);
  }
}

function findDirectivePrologueEnd(body: unknown[]): number {
  let end = 0;
  for (const stmt of body) {
    if (!isAstNode(stmt)) {
      break;
    }
    if (
      stmt.type === 'ExpressionStatement' &&
      (typeof stmt.directive === 'string' || getStringLiteralValue(stmt.expression) !== undefined)
    ) {
      end = stmt.end;
      continue;
    }
    break;
  }
  return end;
}

const CUMULO_META_KEY = Symbol.for('__CUMULO_META__');

interface SerializedReplacement {
  code: string;
  helpers: ReadonlyArray<'runtimeStyle' | 'runtimeKeyframes' | 'runtimeTheme' | 'runtimeRecipe'>;
}

function readCumuloMeta(value: unknown): Record<string, unknown> | undefined {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) {
    return undefined;
  }
  const meta: unknown = Reflect.get(value, CUMULO_META_KEY);
  return isRecord(meta) ? meta : undefined;
}

function serializeRecordedCall(site: CallSite, value: unknown): SerializedReplacement | null {
  const meta = readCumuloMeta(value);
  if (!meta) {
    return null;
  }

  switch (meta.kind) {
    case 'style':
      return typeof meta.className === 'string'
        ? {
            code: `__cumuloStyle(${JSON.stringify(meta.className)})`,
            helpers: ['runtimeStyle'],
          }
        : null;

    case 'create': {
      if (!isRecord(meta.entries)) {
        return null;
      }
      const entries = Object.entries(meta.entries).map(
        ([key, className]) => `${JSON.stringify(key)}: __cumuloStyle(${JSON.stringify(className)})`,
      );
      return {
        code: `({ ${entries.join(', ')} })`,
        helpers: entries.length > 0 ? ['runtimeStyle'] : [],
      };
    }

    case 'keyframes':
      return typeof meta.name === 'string'
        ? {
            code: `__cumuloKeyframes(${JSON.stringify(meta.name)})`,
            helpers: ['runtimeKeyframes'],
          }
        : null;

    case 'theme':
      return typeof meta.className === 'string' && isRecord(meta.vars)
        ? {
            code: `__cumuloTheme(${JSON.stringify(meta.className)}, ${JSON.stringify(meta.vars)})`,
            helpers: ['runtimeTheme'],
          }
        : null;

    case 'global':
      if (site.isStatement) {
        return { code: 'void 0', helpers: [] };
      }
      return isRecord(meta.vars)
        ? {
            code: `({ vars: ${JSON.stringify(meta.vars)} })`,
            helpers: [],
          }
        : null;

    case 'recipe':
      return isRecord(meta.config)
        ? {
            code: `__cumuloRecipe(${JSON.stringify(meta.config)})`,
            helpers: ['runtimeRecipe'],
          }
        : null;

    default:
      return null;
  }
}

function formatImportDeclaration(
  decl: ParsedImportDecl,
  keptSpecifiers: ParsedImportSpecifier[],
): string {
  if (keptSpecifiers.length === 0) {
    return '';
  }

  let defaultSpec: ParsedImportSpecifier | undefined;
  let namespaceSpec: ParsedImportSpecifier | undefined;
  const namedSpecs: ParsedImportSpecifier[] = [];

  for (const spec of keptSpecifiers) {
    if (spec.type === 'ImportDefaultSpecifier') {
      defaultSpec = spec;
    } else if (spec.type === 'ImportNamespaceSpecifier') {
      namespaceSpec = spec;
    } else {
      namedSpecs.push(spec);
    }
  }

  const parts: string[] = [];
  if (defaultSpec) {
    parts.push(defaultSpec.localName);
  }
  if (namespaceSpec) {
    parts.push(`* as ${namespaceSpec.localName}`);
  }
  if (namedSpecs.length > 0) {
    const formattedNamed = namedSpecs.map((spec) => {
      const prefix = spec.isTypeOnly ? 'type ' : '';
      const imported = spec.importedName ?? spec.localName;
      if (imported === spec.localName) {
        return `${prefix}${imported}`;
      }
      return `${prefix}${imported} as ${spec.localName}`;
    });
    parts.push(`{ ${formattedNamed.join(', ')} }`);
  }

  return `import ${parts.join(', ')} from ${decl.rawSource};`;
}

function applyTextEdits(source: string, edits: TextEdit[]): string {
  const sorted = edits.toSorted((a, b) => b.start - a.start || b.end - a.end);
  let result = source;
  let lastStart = source.length + 1;

  for (const edit of sorted) {
    if (edit.end > lastStart) {
      // Skip overlapping edit defensively
      continue;
    }
    result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
    lastStart = edit.start;
  }

  return result;
}

/**
 * Analyzes a JS/TS/JSX/TSX module for top-level `@cumulo/css` style/recipe/theme calls
 * and prepares an instrumented copy for recording evaluated class names during Jiti
 * extraction, plus an `applyRewrites` finalizer that strips build-time style definitions
 * and now-unused imports from the output code.
 */
export function createRewritePlan(source: string, filePath: string): RewritePlan | null {
  let parsed: ReturnType<typeof parseSync>;
  try {
    parsed = parseSync(filePath, source);
  } catch {
    return null;
  }

  if (parsed.errors.length > 0) {
    return null;
  }

  const programNode: unknown = parsed.program;
  if (!isAstNode(programNode) || !Array.isArray(programNode.body)) {
    return null;
  }
  const body = programNode.body;

  const imports = parseImportDeclarations(body, source);
  const localToApi = new Map<string, RewritableApiKind>();
  const contractLocals = new Set<string>();
  const namespaceNames = new Set<string>();

  for (const decl of imports) {
    if (decl.isTypeOnly || decl.source !== '@cumulo/css') {
      continue;
    }
    for (const spec of decl.specifiers) {
      if (spec.isTypeOnly) {
        continue;
      }
      if (spec.type === 'ImportNamespaceSpecifier') {
        namespaceNames.add(spec.localName);
      } else if (spec.type === 'ImportSpecifier' && spec.importedName) {
        if (isRewritableApi(spec.importedName)) {
          localToApi.set(spec.localName, spec.importedName);
        } else if (spec.importedName === 'createThemeContract') {
          contractLocals.add(spec.localName);
        }
      }
    }
  }

  if (localToApi.size === 0 && namespaceNames.size === 0) {
    return null;
  }

  const callSites: CallSite[] = [];
  const localContractDecls: LocalContractDecl[] = [];

  const walkTopLevelExpr = (node: unknown, isStatement: boolean): void => {
    const expr = unwrapTypeExpr(node);
    if (!expr) {
      return;
    }

    if (expr.type === 'CallExpression') {
      const kind = matchCallApi(expr.callee, localToApi, namespaceNames);
      if (kind) {
        callSites.push({
          id: callSites.length,
          kind,
          start: expr.start,
          end: expr.end,
          isStatement,
        });
        return;
      }
      return;
    }

    if (expr.type === 'ObjectExpression' && Array.isArray(expr.properties)) {
      for (const prop of expr.properties) {
        if (isAstNode(prop) && (prop.type === 'Property' || prop.type === 'ObjectProperty')) {
          walkTopLevelExpr(prop.value, false);
        }
      }
      return;
    }

    if (expr.type === 'ArrayExpression' && Array.isArray(expr.elements)) {
      for (const el of expr.elements) {
        walkTopLevelExpr(el, false);
      }
    }
  };

  for (const stmt of body) {
    if (!isAstNode(stmt)) {
      continue;
    }

    if (stmt.type === 'VariableDeclaration' && Array.isArray(stmt.declarations)) {
      if (stmt.declarations.length === 1) {
        const firstDecl = stmt.declarations[0];
        if (isAstNode(firstDecl) && firstDecl.type === 'VariableDeclarator') {
          const declName = getIdentifierName(firstDecl.id);
          const init = unwrapTypeExpr(firstDecl.init);
          if (
            declName &&
            init &&
            init.type === 'CallExpression' &&
            isContractCall(init.callee, contractLocals, namespaceNames)
          ) {
            localContractDecls.push({
              name: declName,
              stmtStart: stmt.start,
              stmtEnd: stmt.end,
              initStart: init.start,
              initEnd: init.end,
            });
            continue;
          }
        }
      }

      for (const decl of stmt.declarations) {
        if (isAstNode(decl) && decl.type === 'VariableDeclarator') {
          walkTopLevelExpr(decl.init, false);
        }
      }
    } else if (stmt.type === 'ExportNamedDeclaration') {
      const declaration = stmt.declaration;
      if (
        isAstNode(declaration) &&
        declaration.type === 'VariableDeclaration' &&
        Array.isArray(declaration.declarations)
      ) {
        for (const decl of declaration.declarations) {
          if (isAstNode(decl) && decl.type === 'VariableDeclarator') {
            walkTopLevelExpr(decl.init, false);
          }
        }
      }
    } else if (stmt.type === 'ExportDefaultDeclaration') {
      walkTopLevelExpr(stmt.declaration, false);
    } else if (stmt.type === 'ExpressionStatement') {
      walkTopLevelExpr(stmt.expression, true);
    }
  }

  if (callSites.length === 0) {
    return null;
  }

  const instrumentEdits: TextEdit[] = callSites.map((site) => ({
    start: site.start,
    end: site.end,
    replacement: `globalThis.__cumuloRecord(${site.id}, (${source.slice(site.start, site.end)}))`,
  }));

  const instrumentedSource = applyTextEdits(source, instrumentEdits);
  const directivePrologueEnd = findDirectivePrologueEnd(body);

  return {
    instrumentedSource,
    callCount: callSites.length,
    applyRewrites(recorded: ReadonlyMap<number, RecordedCall>): string | null {
      const edits: TextEdit[] = [];
      const rewrittenSpans: Array<{ start: number; end: number }> = [];
      const neededHelpers = new Set<
        'runtimeStyle' | 'runtimeKeyframes' | 'runtimeTheme' | 'runtimeRecipe'
      >();

      for (const site of callSites) {
        const entry = recorded.get(site.id);
        if (!entry || entry.count !== 1) {
          continue;
        }
        const serialized = serializeRecordedCall(site, entry.value);
        if (!serialized) {
          continue;
        }
        edits.push({
          start: site.start,
          end: site.end,
          replacement: serialized.code,
        });
        rewrittenSpans.push({ start: site.start, end: site.end });
        for (const helper of serialized.helpers) {
          neededHelpers.add(helper);
        }
      }

      if (edits.length === 0) {
        return null;
      }

      // Check which non-exported local `createThemeContract(...)` declarations are now dead
      // (referenced only inside rewritten style/recipe/theme calls).
      const referencedOutsideCalls = new Set<string>();
      collectIdentifiers(programNode, referencedOutsideCalls, rewrittenSpans);

      for (const contractDecl of localContractDecls) {
        if (!referencedOutsideCalls.has(contractDecl.name)) {
          edits.push({
            start: contractDecl.stmtStart,
            end: contractDecl.stmtEnd,
            replacement: '',
          });
          rewrittenSpans.push({ start: contractDecl.stmtStart, end: contractDecl.stmtEnd });
        }
      }

      // Recompute references outside ALL rewritten/removed spans and inside rewritten spans
      // so we only prune imports that were actually used inside rewritten calls and nowhere else.
      const referencedOutside = new Set<string>();
      collectIdentifiers(programNode, referencedOutside, rewrittenSpans);

      const usedInsideRewritten = new Set<string>();
      for (const stmt of body) {
        if (!isAstNode(stmt) || stmt.type === 'ImportDeclaration') {
          continue;
        }
        collectIdentifiersWithinSpans(stmt, usedInsideRewritten, rewrittenSpans);
      }

      const redirectedRuntimeSpecifiers: string[] = [];

      for (const decl of imports) {
        if (decl.isTypeOnly || decl.specifiers.length === 0) {
          continue;
        }

        const kept: ParsedImportSpecifier[] = [];
        let changed = false;

        for (const spec of decl.specifiers) {
          if (spec.isTypeOnly) {
            kept.push(spec);
            continue;
          }

          const wasUsedInRewritten = usedInsideRewritten.has(spec.localName);
          const isUsedOutside = referencedOutside.has(spec.localName);

          if (wasUsedInRewritten && !isUsedOutside) {
            changed = true;
            continue;
          }

          kept.push(spec);
        }

        // Redirect remaining runtime-safe `@cumulo/css` value specifiers (`cx`,
        // `createThemeContract`, `assignVars`) to `@cumulo/css/runtime` so client bundles
        // never pull in `@cumulo/css`'s build-time compiler, `hash`, or `sheet`.
        if (decl.source === '@cumulo/css') {
          const remainingAfterRedirect: ParsedImportSpecifier[] = [];
          for (const spec of kept) {
            if (
              !spec.isTypeOnly &&
              spec.type === 'ImportSpecifier' &&
              spec.importedName &&
              RUNTIME_REDIRECTABLE_APIS.has(spec.importedName)
            ) {
              changed = true;
              if (spec.importedName === spec.localName) {
                redirectedRuntimeSpecifiers.push(spec.importedName);
              } else {
                redirectedRuntimeSpecifiers.push(`${spec.importedName} as ${spec.localName}`);
              }
            } else {
              remainingAfterRedirect.push(spec);
            }
          }
          if (changed) {
            edits.push({
              start: decl.start,
              end: decl.end,
              replacement: formatImportDeclaration(decl, remainingAfterRedirect),
            });
          }
          continue;
        }

        if (changed) {
          edits.push({
            start: decl.start,
            end: decl.end,
            replacement: formatImportDeclaration(decl, kept),
          });
        }
      }

      const runtimeSpecs: string[] = [];
      if (neededHelpers.has('runtimeStyle')) {
        runtimeSpecs.push('runtimeStyle as __cumuloStyle');
      }
      if (neededHelpers.has('runtimeKeyframes')) {
        runtimeSpecs.push('runtimeKeyframes as __cumuloKeyframes');
      }
      if (neededHelpers.has('runtimeTheme')) {
        runtimeSpecs.push('runtimeTheme as __cumuloTheme');
      }
      if (neededHelpers.has('runtimeRecipe')) {
        runtimeSpecs.push('runtimeRecipe as __cumuloRecipe');
      }
      runtimeSpecs.push(...redirectedRuntimeSpecifiers);

      if (runtimeSpecs.length > 0) {
        const runtimeImport = `import { ${runtimeSpecs.join(', ')} } from '@cumulo/css/runtime';`;
        const prefix = directivePrologueEnd > 0 ? '\n' : '';
        edits.push({
          start: directivePrologueEnd,
          end: directivePrologueEnd,
          replacement: `${prefix}${runtimeImport}\n`,
        });
      }

      return applyTextEdits(source, edits);
    },
  };
}

function collectIdentifiersWithinSpans(
  node: unknown,
  target: Set<string>,
  targetSpans: ReadonlyArray<{ start: number; end: number }>,
): void {
  if (!node || typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectIdentifiersWithinSpans(item, target, targetSpans);
    }
    return;
  }
  if (!isAstNode(node)) {
    return;
  }

  for (const span of targetSpans) {
    if (node.start >= span.start && node.end <= span.end) {
      collectIdentifiers(node, target, []);
      return;
    }
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'type' || key === 'start' || key === 'end') {
      continue;
    }
    collectIdentifiersWithinSpans(value, target, targetSpans);
  }
}
