import React from 'react';
import * as Alert from '@cumulo/core/components/Alert';
import { Code } from '@cumulo/core';

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
          In <Code variant="subtle">'use client'</Code> components, import directly from{' '}
          <Code variant="subtle">@cumulo/core</Code>. If rendering{' '}
          <Code variant="subtle">{component}</Code> directly inside a Server Component without{' '}
          <Code variant="subtle">'use client'</Code>, import from the component subpath instead:{' '}
          <Code variant="subtle">
            import * as {component} from '{resolvedSubpath}'
          </Code>
          .
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
