import React from 'react';
import { describe, it, expect } from 'vitest';
import { reactNodeToJsx } from './reactNodeToJsx';
import {
  Surface,
  VStack,
  Text,
  Button,
  Field,
  Table,
  Collapsible,
  ThemeToggle,
} from '@cumulo/core';

describe('reactNodeToJsx', () => {
  it('serializes single elements with text children and props', () => {
    const jsx = reactNodeToJsx(<Button variant="primary">Click me</Button>);
    expect(jsx).toBe('<Button variant="primary">Click me</Button>');
  });

  it('serializes self-closing elements with boolean props', () => {
    const jsx = reactNodeToJsx(<Field.Root isInvalid />);
    expect(jsx).toBe('<Field.Root isInvalid />');
  });

  it('serializes nested structures with clean indentation', () => {
    const jsx = reactNodeToJsx(
      <Surface level={0} padding="sm" radius="2xl">
        <VStack gap="sm">
          <Text type="label">Surface Level 0 (Canvas)</Text>
          <Surface level={1} padding="xs" radius="auto">
            <VStack gap="sm">
              <Text type="label">Surface Level 1 (Card)</Text>
              <Surface level={2} padding="xs" radius="auto">
                <Text type="label">Surface Level 2 (Elevated)</Text>
              </Surface>
            </VStack>
          </Surface>
        </VStack>
      </Surface>,
    );

    const expected = `<Surface level={0} padding="sm" radius="2xl">
  <VStack gap="sm">
    <Text type="label">Surface Level 0 (Canvas)</Text>
    <Surface level={1} padding="xs" radius="auto">
      <VStack gap="sm">
        <Text type="label">Surface Level 1 (Card)</Text>
        <Surface level={2} padding="xs" radius="auto">
          <Text type="label">Surface Level 2 (Elevated)</Text>
        </Surface>
      </VStack>
    </Surface>
  </VStack>
</Surface>`;

    expect(jsx).toBe(expected);
  });

  it('serializes mapped items and nodes as props', () => {
    const jsx = reactNodeToJsx(
      <>
        {[1, 2, 3].map((n) => (
          <Button key={n} icon={<Text>n</Text>} variant="primary">
            Click me
          </Button>
        ))}
      </>,
    );
    expect(jsx).toBe(
      `<>
  <Button icon={<Text>n</Text>} variant="primary">Click me</Button>
  <Button icon={<Text>n</Text>} variant="primary">Click me</Button>
  <Button icon={<Text>n</Text>} variant="primary">Click me</Button>
</>`,
    );
  });

  it('serializes Field compound components', () => {
    const jsx = reactNodeToJsx(
      <Field.Root isInvalid>
        <Field.Label>Work Email</Field.Label>
        <Field.Input placeholder="you@company.com" />
      </Field.Root>,
    );

    const expected = `<Field.Root isInvalid>
  <Field.Label>Work Email</Field.Label>
  <Field.Input placeholder="you@company.com" />
</Field.Root>`;

    expect(jsx).toBe(expected);
  });

  it('serializes Collapsible compound components', () => {
    const jsx = reactNodeToJsx(
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content>Panel</Collapsible.Content>
      </Collapsible.Root>,
    );

    const expected = `<Collapsible.Root defaultOpen>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Content>Panel</Collapsible.Content>
</Collapsible.Root>`;

    expect(jsx).toBe(expected);
  });

  it('serializes Table compound components', () => {
    const jsx = reactNodeToJsx(
      <Table variant="bordered">
        <Table.Header>
          <Table.Row>
            <Table.Head>Feature</Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>,
    );

    const expected = `<Table variant="bordered">
  <Table.Header>
    <Table.Row>
      <Table.Head>Feature</Table.Head>
    </Table.Row>
  </Table.Header>
</Table>`;

    expect(jsx).toBe(expected);
  });

  it('serializes ThemeToggle component', () => {
    const jsx = reactNodeToJsx(<ThemeToggle mode="cycle" />);
    expect(jsx).toBe('<ThemeToggle mode="cycle" />');
  });

  it('resolves RSC Client Reference proxies with $$id and $$exportName', () => {
    const FakeClientRef = {
      $$typeof: Symbol.for('react.client.reference'),
      $$id: 'packages/core/dist/index.mjs#ThemeToggle',
    };
    const element = React.createElement(
      FakeClientRef as unknown as React.ComponentType<{ mode: string }>,
      { mode: 'toggle' },
    );
    expect(reactNodeToJsx(element)).toBe('<ThemeToggle mode="toggle" />');

    const FakeCompoundRef = {
      $$typeof: Symbol.for('react.client.reference'),
      $$id: 'packages/core/dist/index.mjs#FieldInput',
    };
    const inputElement = React.createElement(
      FakeCompoundRef as unknown as React.ComponentType<{ placeholder: string }>,
      { placeholder: 'hi' },
    );
    expect(reactNodeToJsx(inputElement)).toBe('<Field.Input placeholder="hi" />');
  });
});
