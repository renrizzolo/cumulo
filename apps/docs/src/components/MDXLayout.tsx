import { Code, Divider, Flow, Heading, Text } from '@cumulo/core';
import { textBase } from '@cumulo/core/typography';
import { style } from '@cumulo/css';
import { type PageProps } from '@renr/parcel-rsc-router';
import React, { type ReactNode } from 'react';
import AppLayout from '../Layout';
import { CodeBlock } from './CodeBlock';
import { ColorTokens } from './ColorTokens';
import { ComponentPreview } from './ComponentPreview';
import { PropsTable } from './PropsTable';
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

const components = {
  a: (props: React.JSX.IntrinsicElements['a']) => (
    // oxlint-disable-next-line jsx-a11y/anchor-has-content
    <a target="_blank" rel="noreferrer noopener" {...props} />
  ),
  h1: (props: React.ComponentProps<typeof Heading>) => <Heading as="h1" size="3xl" {...props} />,
  h2: (props: React.ComponentProps<typeof Heading>) => <Heading as="h2" size="2xl" {...props} />,
  h3: (props: React.ComponentProps<typeof Heading>) => <Heading as="h3" size="xl" {...props} />,
  h4: (props: React.ComponentProps<typeof Heading>) => <Heading as="h4" size="lg" {...props} />,
  p: MDXParagraph,
  code: (props: React.ComponentProps<typeof Code>) => <Code variant="subtle" {...props} />,
  hr: () => <Divider />,
  CodeBlock,
  ColorTokens,
  TokenTable,
  PropsTable,
  ComponentPreview,
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
}: {
  children: ReactNode;
  currentPage: PageProps['currentPage'];
}): React.JSX.Element {
  const title = currentPage?.tableOfContents?.[0]?.title;
  const body = withMDXComponents(children);

  return (
    <AppLayout title={title} currentPage={currentPage}>
      {currentPage?.url === '/theme-builder.html' ? (
        children
      ) : (
        <Flow className={styles.className}>{body}</Flow>
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
