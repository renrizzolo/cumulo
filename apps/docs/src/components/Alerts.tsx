import React from 'react';
import * as Alert from '@cumulo/core/components/Alert';
import { Code } from '@cumulo/core';
import { Link } from './Link';

export interface RscAlertProps {
  /** The compound component name, e.g. "RadioGroup" or "Tabs" */
  component: string;
  /** Optional custom subpath if different from `@cumulo/core/components/${component}` */
  subpath?: string;
}

export function RscAlert({ component, subpath }: RscAlertProps): React.JSX.Element {
  const resolvedSubpath = subpath ?? `@cumulo/core/components/${component}`;

  return (
    <Alert.Root intent="info">
      <Alert.Icon />
      <Alert.Content>
        <Alert.Title>React Server Components (RSC)</Alert.Title>
        <Alert.Description>
          In <Code>'use client'</Code> components, import directly from <Code>@cumulo/core</Code>.
          If rendering <Code>{component}</Code> directly inside a Server Component without{' '}
          <Code>'use client'</Code>, import from the component subpath instead:{' '}
          <Code>
            import * as {component} from '{resolvedSubpath}'
          </Code>
          .
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}

export const BundlerAlert = () => {
  return (
    <Alert.Root intent="warning">
      <Alert.Icon />
      <Alert.Content>
        <Alert.Title>Bundler plugin</Alert.Title>
        <Alert.Description>
          Cumulo components and styles rely on compile-time static CSS extraction. Both{' '}
          <code>@cumulo/core</code> and <code>@cumulo/css</code> <strong>will not work</strong>
          without a bundler plugin. See <Link href="/css">CSS</Link> for setup instructions.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
};
