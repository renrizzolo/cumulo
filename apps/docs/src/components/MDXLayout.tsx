import type { PageProps } from '@parcel/rsc';
import React, { type ReactNode } from 'react';
import { style, cx } from '@cumulo/css';
import { Heading, Text, Code, Table, vars } from '@cumulo/core';
import AppLayout from '../Layout.js';
import { CodeBlock } from './CodeBlock.js';
import { TokenTable } from './TokenTable.js';
import { PropsTable } from './PropsTable.js';
import { ComponentPreview } from './ComponentPreview.js';

export { CodeBlock, TokenTable, PropsTable, ComponentPreview };

const mdxContainerStyle = style({
  maxWidth: '820px',
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
});

const h1Style = style({
  margin: `0 0 ${vars.spacing.md}`,
  letterSpacing: '-0.025em',
});

const h2Style = style({
  margin: `${vars.spacing['2xl']} 0 ${vars.spacing.md}`,
  letterSpacing: '-0.02em',
});

const h3Style = style({
  margin: `${vars.spacing.xl} 0 ${vars.spacing.xs}`,
  letterSpacing: '-0.015em',
});

const h4Style = style({
  margin: `${vars.spacing.lg} 0 ${vars.spacing['2xs']}`,
});

const pStyle = style({
  margin: `0 0 ${vars.spacing.md}`,
  lineHeight: vars.line.height.relaxed,
  fontSize: '15px',
});

const hrSpacerStyle = style({
  height: vars.spacing.md,
});

export const components = {
  h1: ({ className, ...props }: React.ComponentProps<typeof Heading>) => (
    <Heading as="h1" size="3xl" className={cx(h1Style.className, className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<typeof Heading>) => (
    <Heading as="h2" size="2xl" className={cx(h2Style.className, className)} {...props} />
  ),
  h3: ({ className, ...props }: React.ComponentProps<typeof Heading>) => (
    <Heading as="h3" size="xl" className={cx(h3Style.className, className)} {...props} />
  ),
  h4: ({ className, ...props }: React.ComponentProps<typeof Heading>) => (
    <Heading as="h4" size="lg" className={cx(h4Style.className, className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<typeof Text>) => (
    <Text as="p" type="body" className={cx(pStyle.className, className)} {...props} />
  ),
  code: ({ className, ...props }: React.ComponentProps<typeof Code>) => (
    <Code variant="subtle" className={className} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<typeof Table>) => (
    <Table variant="bordered" className={className} {...props} />
  ),
  hr: () => <div className={hrSpacerStyle.className} />,
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
      <div className={mdxContainerStyle.className}>{children}</div>
    </AppLayout>
  );
}
