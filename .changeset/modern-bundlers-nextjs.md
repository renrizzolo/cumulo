---
'@cumulo/unplugin': minor
'@cumulo/parcel-transformer': patch
'@cumulo/core': minor
---

**unplugin:**

- Added dedicated `@cumulo/unplugin/next` entrypoint with `withCumulo` Webpack plugin wrapper.
- Added dedicated `@cumulo/unplugin/postcss` entrypoint with `cumuloPostcss` for seamless zero-config CSS extraction in Next.js (Turbopack and Webpack) and standalone PostCSS pipelines.
- Standardized a single `cumulo` named export alongside the default export across all bundler subpaths (`/vite`, `/webpack`, `/rollup`, `/esbuild`, `/parcel`, `/next`, `/postcss`, and root `/index`).
- Added dual ESM and CommonJS outputs for universal bundler loader compatibility.

**parcel-transformer:**

- Standardized `cumulo` named export alongside default export.

**core:**

- `Link`: Added polymorphic `as` prop support with full generic type preservation (`LinkProps<E>`).
- `Sidebar`: Added `Sidebar.Content` (`SidebarContent`) subcomponent with configurable collapse behaviors (`clip`, `fade`, `collapse`, `none`) and `flex` filling.
- `ElementProps`: Added `'hint'` support to `popover` prop type.
- `Heading`: Calibrated default sizes across heading levels (`h1: '2xl'`, `h2: 'xl'`, `h3: 'lg'`, `h4: 'md'`, `h5: 'sm'`).
- `Badge`: Added `whiteSpace: 'nowrap'` and `flexShrink: 0` for consistent label layout.
- `Code`: Refined font size to `0.9em` and updated base variant background token.
- `Flow`: Adjusted default spacing variant to `lg`.
