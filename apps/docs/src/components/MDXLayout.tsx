import { Code, Divider, Flow, Heading, Table, Text } from '@cumulo/core';
import type { PageProps } from '@parcel/rsc';
import React, { type ReactNode } from 'react';
import AppLayout from '../Layout';
import { CodeBlock } from './CodeBlock';
import { ComponentPreview } from './ComponentPreview';
import { PropsTable } from './PropsTable';
import { TokenTable } from './TokenTable';

export { CodeBlock, ComponentPreview, PropsTable, TokenTable };

export const components = {
  h1: ({ ...props }: React.ComponentProps<typeof Heading>) => (
    <Heading as="h1" size="3xl" {...props} />
  ),
  h2: ({ ...props }: React.ComponentProps<typeof Heading>) => (
    <Heading as="h2" size="2xl" {...props} />
  ),
  h3: ({ ...props }: React.ComponentProps<typeof Heading>) => (
    <Heading as="h3" size="xl" {...props} />
  ),
  h4: ({ ...props }: React.ComponentProps<typeof Heading>) => (
    <Heading as="h4" size="lg" {...props} />
  ),
  p: ({ ...props }: React.ComponentProps<typeof Text>) => <Text as="p" type="body" {...props} />,
  code: ({ className, ...props }: React.ComponentProps<typeof Code>) => (
    <Code variant="subtle" className={className} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<typeof Table>) => (
    <Table variant="bordered" className={className} {...props} />
  ),
  hr: () => <Divider />,
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
      <Flow>{children}</Flow>
    </AppLayout>
  );
}
