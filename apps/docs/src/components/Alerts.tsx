import * as Alert from '@cumulo/core/components/Alert';
import React from 'react';

import { Link } from './Link';

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
