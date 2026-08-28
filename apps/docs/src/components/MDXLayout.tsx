import type { PageProps } from '@parcel/rsc';
import React, { type ReactNode } from 'react';
import { Heading, Text, Code, Divider, Table } from '@cumulo/core';
import AppLayout from '../Layout.js';
import { CodeBlock } from './CodeBlock.js';
import { TokenTable } from './TokenTable.js';
import { PropsTable } from './PropsTable.js';
import { ComponentPreview } from './ComponentPreview.js';

export { CodeBlock, TokenTable, PropsTable, ComponentPreview };

export const components = {
  h1: (props: React.ComponentProps<typeof Heading>) => (
    <Heading as="h1" size="3xl" style={{ margin: '28px 0 16px' }} {...props} />
  ),
  h2: (props: React.ComponentProps<typeof Heading>) => (
    <Heading as="h2" size="2xl" style={{ margin: '36px 0 16px' }} {...props} />
  ),
  h3: (props: React.ComponentProps<typeof Heading>) => (
    <Heading as="h3" size="xl" style={{ margin: '24px 0 12px' }} {...props} />
  ),
  h4: (props: React.ComponentProps<typeof Heading>) => (
    <Heading as="h4" size="lg" style={{ margin: '20px 0 8px' }} {...props} />
  ),
  p: (props: React.ComponentProps<typeof Text>) => (
    <Text type="body" style={{ margin: '0 0 16px', lineHeight: 1.7 }} {...props} />
  ),
  code: (props: React.ComponentProps<typeof Code>) => <Code variant="subtle" {...props} />,
  pre: CodeBlock,
  hr: (props: React.ComponentProps<typeof Divider>) => (
    <Divider orientation="horizontal" spacing="lg" {...props} />
  ),
  table: Table.Root,
  thead: Table.Header,
  tbody: Table.Body,
  tr: Table.Row,
  th: Table.Head,
  td: Table.Cell,
  CodeBlock,
  TokenTable,
  PropsTable,
  ComponentPreview,
};

export default function MDXLayout({
  children,
  currentPage,
}: {
  children: ReactNode;
  currentPage: PageProps['currentPage'];
}): React.JSX.Element {
  const title = currentPage?.tableOfContents?.[0]?.title;

  return (
    <AppLayout title={title} currentPage={currentPage}>
      <div>{children}</div>
    </AppLayout>
  );
}
