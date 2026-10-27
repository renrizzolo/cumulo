import { Flow } from '@cumulo/core';
import { textBase } from '@cumulo/core/typography';
import { style } from '@cumulo/css';
import type { PageProps } from '@renr/parcel-rsc-router';
import React, { type ReactNode } from 'react';
import AppLayout from '../Layout';
import { CodeBlock } from './CodeBlock';
import { ColorTokens } from './ColorTokens';
import { ComponentPreview } from './ComponentPreview';
import { PropsTable } from './PropsTable';
import { TokenTable } from './TokenTable';

export { CodeBlock, ColorTokens, ComponentPreview, PropsTable, TokenTable };

// TODO: figure out how to set up mdx components

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

  return (
    <AppLayout title={title} currentPage={currentPage}>
      {currentPage?.url === '/theme-builder.html' ? (
        children
      ) : (
        <Flow className={styles.className}>{children}</Flow>
      )}
    </AppLayout>
  );
}
