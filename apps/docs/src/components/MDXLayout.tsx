import type { PageProps } from '@parcel/rsc';
import type { ReactNode } from 'react';
import AppLayout from '../Layout.js';
import { CodeBlock } from './CodeBlock.js';
import { TokenTable } from './TokenTable.js';

export { CodeBlock, TokenTable };

export const components = {
  CodeBlock,
  pre: CodeBlock,
  TokenTable,
};

export default function MDXLayout({
  children,
  currentPage,
}: {
  children: ReactNode;
  currentPage: PageProps['currentPage'];
}) {
  const title = currentPage?.tableOfContents?.[0]?.title;

  return (
    <AppLayout title={title} currentPage={currentPage}>
      <div className="docs-content">{children}</div>
    </AppLayout>
  );
}
