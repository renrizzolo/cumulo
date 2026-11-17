import { Code, Divider, Flow, Heading, HStack, Link as CumuloLink, Text, vars } from '@cumulo/core';
import { textBase } from '@cumulo/core/typography';
import { style } from '@cumulo/css';
import React, { type ReactNode } from 'react';
import type { PageProps } from '@renr/parcel-rsc-router';
import AppLayout, { type DocsLayoutMode, isFullWidthLayout } from '../Layout';
import { CodeBlock } from './CodeBlock';
import { ColorTokens } from './ColorTokens';
import { ComponentPreview } from './ComponentPreview';
import { PropsTable, type DocgenData } from './PropsTable';
import { BundlerAlert, RscAlert } from './Alerts';
import { TokenTable } from './TokenTable';
import { Link } from './Link';
import { Logo } from './Logo';

const GITHUB_BLOB_BASE = 'https://github.com/renrizzolo/cumulo/blob/main';
const EASE_OUT_STRONG = 'cubic-bezier(0.23, 1, 0.32, 1)';

/**
 * Wrapper component for MDX's implicit `<p>` mapping.
 *
 * Using a distinct component identity (`node.type === MDXParagraph`) allows
 * `unwrapMdxParagraphs` to differentiate paragraphs auto-injected by the MDX
 * compiler from explicit `<Text>` or `<p>` elements authored in JSX demos.
 */
function MDXParagraph(props: React.ComponentProps<typeof Text>): React.JSX.Element {
  return <Text as="p" type="body" {...props} />;
}

const components = {
  a: Link,
  Link,
  h1: (props: React.ComponentProps<typeof Heading>) => <Heading as="h1" size="3xl" {...props} />,
  h2: (props: React.ComponentProps<typeof Heading>) => <Heading as="h2" size="2xl" {...props} />,
  h3: (props: React.ComponentProps<typeof Heading>) => <Heading as="h3" size="xl" {...props} />,
  h4: (props: React.ComponentProps<typeof Heading>) => <Heading as="h4" size="lg" {...props} />,
  p: MDXParagraph,
  code: (props: React.ComponentProps<typeof Code>) => <Code {...props} />,
  hr: () => <Divider />,
  CodeBlock,
  ColorTokens,
  Logo,
  TokenTable,
  PropsTable,
  ComponentPreview,
  RscAlert,
  BundlerAlert,
};

// this applies base text styles to the child markdown content.
const styles = style({
  selectors: {
    '& > p, & > h1, & > h2, & > h3, & > h4': textBase,
  },
});

const sourceLinksRowStyle = style(
  {
    '--flow-space': vars.spacing.md,
  },
  'mdx-source-links-row',
);

const docFooterLinkRowStyle = style(
  {
    '--flow-space': vars.spacing['2xl'],
  },
  'mdx-doc-footer-link-row',
);

const githubLinkStyle = style(
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing['2xs'],
    fontSize: vars.font.size.xs,
    lineHeight: vars.line.height.tight,
    color: vars.surface.muted,
    textDecoration: 'none',
    transition: `color ${vars.duration.fast} ${vars.ease.default}`,
    ':hover': {
      color: vars.surface.fg,
      textDecoration: 'none',
    },
  },
  'mdx-github-link',
);

const githubIconStyle = style(
  {
    width: vars.size['4xs'],
    height: vars.size['4xs'],
    flexShrink: 0,
  },
  'mdx-github-icon',
);

const externalArrowStyle = style(
  {
    width: '11px',
    height: '11px',
    opacity: 0.55,
    flexShrink: 0,
    transition: `transform 180ms ${EASE_OUT_STRONG}, opacity 180ms ${vars.ease.default}`,
    selectors: {
      'a:hover &': {
        transform: 'translate3d(1.5px, -1.5px, 0)',
        opacity: 1,
      },
    },
    '@media': {
      '(hover: none)': {
        transform: 'none',
      },
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
        transform: 'none',
      },
    },
  },
  'mdx-external-arrow',
);

function GitHubIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={githubIconStyle.className}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function ExternalArrowIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={externalArrowStyle.className}
    >
      <path d="M4.5 11.5 11.5 4.5" />
      <path d="M5.5 4.5h6v6" />
    </svg>
  );
}

interface ComponentSourceInfo {
  name: string;
  path: string;
}

function getDocFilePath(currentPage?: PageProps['currentPage']): string | null {
  const url = currentPage?.url;
  if (!url) return null;
  const mdxRelative = url.replace(/^\//, '').replace(/\.html$/, '.mdx');
  return `apps/docs/src/pages/${mdxRelative}`;
}

export default function MDXLayout({
  children,
  currentPage,
  layout,
}: {
  children: ReactNode;
  currentPage: PageProps['currentPage'];
  layout?: DocsLayoutMode;
}): React.JSX.Element {
  const title = currentPage?.tableOfContents?.[0]?.title;
  const body = withMDXComponents(children, currentPage);
  const isFullWidth = isFullWidthLayout(currentPage, layout);
  const docFilePath = getDocFilePath(currentPage);

  return (
    <AppLayout title={title} currentPage={currentPage} layout={isFullWidth ? 'full' : 'restricted'}>
      {isFullWidth ? (
        children
      ) : (
        <Flow className={styles.className}>
          {body}
          {docFilePath ? (
            <HStack align="center" className={docFooterLinkRowStyle.className}>
              <CumuloLink
                href={`${GITHUB_BLOB_BASE}/${docFilePath}`}
                external
                variant="subtle"
                className={githubLinkStyle.className}
              >
                <GitHubIcon />
                <span>View this page on GitHub</span>
                <ExternalArrowIcon />
              </CumuloLink>
            </HStack>
          ) : null}
        </Flow>
      )}
    </AppLayout>
  );
}

interface MDXBodyProps {
  components?: Record<string, unknown>;
}

function isMdxContentFunction(type: unknown): type is (props: MDXBodyProps) => React.ReactNode {
  return typeof type === 'function';
}

/**
 * Recursively strips implicit `MDXParagraph` wrappers when nested inside JSX components.
 *
 * Why: Per the CommonMark/MDX specification, any JSX tag whose opening and closing
 * tags span multiple lines (e.g. formatted by `oxfmt` as `<Badge>\n  Primary\n</Badge>`)
 * is parsed as a block-level flow container (`mdxJsxFlowElement`). MDX treats bare text
 * inside block flow containers as Markdown prose and wraps it in `<_components.p>`.
 *
 * Without unwrapping, multiline JSX in `.mdx` files would:
 * 1. Render `<Text as="p" type="body">` inside interactive/inline UI components
 *    (`<Badge>`, `<Button>`, `<Heading>`, `<Text>`, `<Table.Cell>`, etc.), breaking layout and semantics.
 * 2. Pollute `<ComponentPreview>`'s serialized "View Code" snippets (`reactNodeToJsx`)
 *    with unwanted `<p>...</p>` tags.
 *
 * Top-level Markdown prose and Markdown block containers (`blockquote`, `li`) keep
 * their `MDXParagraph` wrappers intact.
 */
function unwrapMdxParagraphs(node: React.ReactNode, insideJsx = false): React.ReactNode {
  if (Array.isArray(node)) {
    return node.flatMap((child) => {
      const unwrapped = unwrapMdxParagraphs(child, insideJsx);
      return Array.isArray(unwrapped) ? unwrapped : [unwrapped];
    });
  }

  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return node;
  }

  // Unwrap MDX-generated paragraphs only when inside a JSX element tree.
  if (node.type === MDXParagraph) {
    if (insideJsx) {
      return unwrapMdxParagraphs(node.props.children, true);
    }
    return node;
  }

  // Fragments and Markdown prose containers (`blockquote`, `li`) preserve paragraph
  // wrapping for their direct children; all other JSX elements mark their subtree as JSX.
  const isJsxContainer =
    node.type !== React.Fragment && node.type !== 'blockquote' && node.type !== 'li';
  const nextInsideJsx = insideJsx || isJsxContainer;

  if (node.props.children !== undefined) {
    const nextChildren = unwrapMdxParagraphs(node.props.children, nextInsideJsx);
    const childArgs = Array.isArray(nextChildren) ? nextChildren : [nextChildren];
    return React.cloneElement(node, undefined, ...childArgs);
  }

  return node;
}

function collectComponentSources(
  node: React.ReactNode,
  seenPaths = new Set<string>(),
  result: ComponentSourceInfo[] = [],
): ComponentSourceInfo[] {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectComponentSources(child, seenPaths, result);
    }
    return result;
  }

  if (!React.isValidElement<{ data?: DocgenData | null; children?: React.ReactNode }>(node)) {
    return result;
  }

  if (node.type === PropsTable && node.props.data?.path) {
    const { path, fileName, name } = node.props.data;
    if (!seenPaths.has(path)) {
      seenPaths.add(path);
      const cleanName = fileName ? fileName.replace(/\.[jt]sx?$/, '') : name.replace(/\.Root$/, '');
      result.push({ name: cleanName, path });
    }
  }

  if (node.props.children !== undefined) {
    collectComponentSources(node.props.children, seenPaths, result);
  }

  return result;
}

function resolveComponentSources(
  node: React.ReactNode,
  currentPage?: PageProps['currentPage'],
): ComponentSourceInfo[] {
  const sources = collectComponentSources(node);
  if (sources.length > 0) {
    return sources;
  }

  if (currentPage?.url.startsWith('/components/')) {
    const slug = currentPage.url.replace(/^\/components\//, '').replace(/\.html$/, '');
    const pascalName = slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    if (pascalName) {
      return [
        {
          name: pascalName,
          path: `packages/core/src/components/${pascalName}.tsx`,
        },
      ];
    }
  }

  return [];
}

function injectComponentSourceLinks(
  node: React.ReactNode,
  currentPage?: PageProps['currentPage'],
): React.ReactNode {
  const sources = resolveComponentSources(node, currentPage);
  if (sources.length === 0) {
    return node;
  }

  const sourceLinksElement = (
    <HStack
      key="__component-source-links"
      gap="md"
      align="center"
      wrap="wrap"
      className={sourceLinksRowStyle.className}
    >
      {sources.map((source) => (
        <CumuloLink
          key={source.path}
          href={`${GITHUB_BLOB_BASE}/${source.path}`}
          external
          variant="subtle"
          className={githubLinkStyle.className}
        >
          <GitHubIcon />
          <span>{sources.length > 1 ? `View ${source.name} on GitHub` : 'View on GitHub'}</span>
          <ExternalArrowIcon />
        </CumuloLink>
      ))}
    </HStack>
  );

  const insertIntoChildren = (children: React.ReactNode[]): React.ReactNode[] => {
    const codeBlockIndex = children.findIndex(
      (child) => React.isValidElement(child) && child.type === CodeBlock,
    );
    if (codeBlockIndex !== -1) {
      const next = [...children];
      next.splice(codeBlockIndex, 0, sourceLinksElement);
      return next;
    }

    const h1Index = children.findIndex(
      (child) => React.isValidElement(child) && child.type === components.h1,
    );
    if (h1Index !== -1) {
      const next = [...children];
      next.splice(h1Index + 1, 0, sourceLinksElement);
      return next;
    }

    return [sourceLinksElement, ...children];
  };

  if (Array.isArray(node)) {
    return insertIntoChildren(node);
  }

  if (
    React.isValidElement<{ children?: React.ReactNode }>(node) &&
    node.type === React.Fragment &&
    node.props.children !== undefined
  ) {
    const rawChildren = Array.isArray(node.props.children)
      ? node.props.children
      : [node.props.children];
    const nextChildren = insertIntoChildren(rawChildren);
    return React.cloneElement(node, undefined, ...nextChildren);
  }

  return node;
}

/**
 * Injects the MDX component mappings into the compiled MDX page content,
 * unwraps implicit `<p>` tags nested inside JSX subtrees, and automatically
 * injects component source GitHub links on component pages.
 *
 * Calling `children.type(...)` directly evaluates the compiled `MDXContent` function
 * into its React element tree so `unwrapMdxParagraphs` can inspect and clean up
 * children before `<ComponentPreview>` or UI primitives receive them.
 */
function withMDXComponents(
  children: React.ReactNode,
  currentPage?: PageProps['currentPage'],
): React.ReactNode {
  if (!React.isValidElement<MDXBodyProps>(children)) return children;

  if (isMdxContentFunction(children.type)) {
    const rendered = children.type({ ...children.props, components });
    const unwrapped = unwrapMdxParagraphs(rendered, false);
    return injectComponentSourceLinks(unwrapped, currentPage);
  }

  return React.cloneElement<MDXBodyProps>(children, { components });
}
