---
'@cumulo/core': minor
---

**core (deprecation):** The root @cumulo/core barrel is deprecated. Import from per-component paths (e.g. @cumulo/core/components/Button) so RSC client boundaries are explicit and per-component CSS keeps a stable, shared order across bundles.

fix: add `useTheme` missing `'use client'` directive.
