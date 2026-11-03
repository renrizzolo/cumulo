import { Code, Divider, Flow, Heading, Text, Link } from '@cumulo/core';
import { textBase } from '@cumulo/core/typography';
import { style } from '@cumulo/css';
import { Link as RouterLink, type PageProps, type RoutePath } from '@renr/parcel-rsc-router';
import React, { type ReactNode } from 'react';
import AppLayout, { type DocsLayoutMode } from '../Layout';
import { flatRoutes } from '../../routes';
import { CodeBlock } from './CodeBlock';
import { ColorTokens } from './ColorTokens';
import { ComponentPreview } from './ComponentPreview';
import { PropsTable } from './PropsTable';
import { RscAlert } from './RscAlert';
import { TokenTable } from './TokenTable';

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

const routePathSet = new Set<string>(flatRoutes.map((route) => route.path));

function isRoutePath(path: string): path is RoutePath {
  return routePathSet.has(path);
}

interface ParsedInternalRoute {
  to: RoutePath;
  hash?: string;
  search?: Record<string, string>;
}

function parseInternalRoute(href: string): ParsedInternalRoute | null {
  if (
    href.startsWith('//') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return null;
  }

  if (!href.startsWith('/') && !href.startsWith('.')) {
    return null;
  }

  try {
    const url = new URL(href, 'http://localhost');
    let pathname = url.pathname;
    if (pathname.endsWith('.html')) {
      pathname = pathname.slice(0, -5);
      if (pathname === '/index') {
        pathname = '/';
      }
    }
    if (isRoutePath(pathname)) {
      const hash = url.hash.length > 1 ? url.hash.slice(1) : undefined;
      const search: Record<string, string> = {};
      let hasSearch = false;
      for (const [key, value] of url.searchParams.entries()) {
        search[key] = value;
        hasSearch = true;
      }
      return {
        to: pathname,
        hash,
        search: hasSearch ? search : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function MDXAnchor({
  href,
  children,
  target,
  rel,
  ...props
}: React.JSX.IntrinsicElements['a']): React.JSX.Element {
  if (!href) {
    return (
      <Link target={target} rel={rel} {...props}>
        {children}
      </Link>
    );
  }

  if (href.startsWith('#')) {
    return (
      <Link href={href} target={target} rel={rel} {...props}>
        {children}
      </Link>
    );
  }

  const internalRoute = parseInternalRoute(href);
  if (internalRoute && (!target || target === '_self')) {
    return (
      <Link
        as={RouterLink}
        to={internalRoute.to}
        hash={internalRoute.hash}
        search={internalRoute.search}
        target={target}
        rel={rel}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    // oxlint-disable-next-line jsx-a11y/anchor-has-content
    <a href={href} target={target ?? '_blank'} rel={rel ?? 'noreferrer noopener'} {...props}>
      {children}
    </a>
  );
}

const components = {
  a: MDXAnchor,
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
  TokenTable,
  PropsTable,
  ComponentPreview,
  RscAlert,
  RSCAlert: RscAlert,
};

// this applies base text styles to the child markdown content.
const styles = style({
  selectors: {
    '& > p, & > h1, & > h2, & > h3, & > h4': textBase,
  },
});

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
  const body = withMDXComponents(children);
  const isFullWidth = layout === 'full' || currentPage?.url === '/theme-builder.html';

  return (
    <AppLayout title={title} currentPage={currentPage} layout={layout}>
      {isFullWidth ? children : <Flow className={styles.className}>{body}</Flow>}
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

/**
 * Injects the MDX component mappings into the compiled MDX page content and
 * unwraps implicit `<p>` tags nested inside JSX subtrees.
 *
 * Calling `children.type(...)` directly evaluates the compiled `MDXContent` function
 * into its React element tree so `unwrapMdxParagraphs` can inspect and clean up
 * children before `<ComponentPreview>` or UI primitives receive them.
 */
function withMDXComponents(children: React.ReactNode): React.ReactNode {
  if (!React.isValidElement<MDXBodyProps>(children)) return children;

  if (isMdxContentFunction(children.type)) {
    const rendered = children.type({ ...children.props, components });
    return unwrapMdxParagraphs(rendered, false);
  }

  return React.cloneElement<MDXBodyProps>(children, { components });
}
