import { Code, Divider, Flow, Heading, HStack, Link as CumuloLink, Text } from '@cumulo/core';
import { textBase } from '@cumulo/core/typography';
import { style } from '@cumulo/css';
import React, { type ReactNode } from 'react';
import type { PageProps } from '@renr/parcel-rsc-router';
import AppLayout, { type DocsLayoutMode, isFullWidthLayout } from '../Layout';
import { CodeBlock } from './CodeBlock';
import { ColorTokens } from './ColorTokens';
import { ComponentPreview } from './ComponentPreview';
import { ExternalArrowIcon, GitHubIcon, subtleLinkStyle } from './ExternalLinks';
import { PropsTable, type DocgenData } from './PropsTable';
import { BundlerAlert, RscAlert } from './Alerts';
import { TokenTable } from './TokenTable';
import { Link } from './Link';
import { Logo } from './Logo';

const GITHUB_BLOB_BASE = 'https://github.com/renrizzolo/cumulo/blob/main';

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
            <HStack align="center">
              <CumuloLink
                href={`${GITHUB_BLOB_BASE}/${docFilePath}`}
                external
                variant="plain"
                className={subtleLinkStyle.className}
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
    <HStack key="__component-source-links" gap="md" align="center" wrap="wrap">
      {sources.map((source) => (
        <CumuloLink
          key={source.path}
          href={`${GITHUB_BLOB_BASE}/${source.path}`}
          external
          variant="plain"
          className={subtleLinkStyle.className}
        >
          <GitHubIcon />
          <span>{sources.length > 1 ? `View ${source.name} on GitHub` : 'View on GitHub'}</span>
          <ExternalArrowIcon />
        </CumuloLink>
      ))}
    </HStack>
  );

  const insertIntoChildren = (children: React.ReactNode[]): React.ReactNode[] => {
    const h1Index = children.findIndex(
      (child) => React.isValidElement(child) && child.type === components.h1,
    );
    if (h1Index !== -1) {
      const next = [...children];
      next[h1Index] = (
        <HStack key="__component-title-row" justify="between" align="start" gap="md" wrap="wrap">
          {children[h1Index]}
          {sourceLinksElement}
        </HStack>
      );
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
