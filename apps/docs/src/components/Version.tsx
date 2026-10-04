import corePackage from '@cumulo/core/package.json';

export function Version() {
  return `v${corePackage.version}`;
}
