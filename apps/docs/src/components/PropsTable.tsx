import React from 'react';
import { Table, Badge, Code, Text, HStack } from '@cumulo/core';

export interface DocgenPropType {
  name: string;
  raw?: string;
  value?: Array<{ value: string }>;
}

export interface DocgenProp {
  name: string;
  description?: string;
  required: boolean;
  type: DocgenPropType;
  defaultValue?: { value: string } | null;
  shortPropTypeName?: string | null;
}

export interface DocgenData {
  name: string;
  path?: string;
  fileName?: string;
  description?: string;
  props?: Record<string, DocgenProp>;
}

export interface PropsTableProps {
  data?: DocgenData | null;
  excludeProps?: string[];
}

function formatTypeValue(type: DocgenPropType): React.ReactNode {
  if (type.value && Array.isArray(type.value)) {
    // Enum or union
    const cleanValues = type.value
      .map((v) => v.value.replace(/^["']|["']$/g, ''))
      .filter((v) => v !== 'undefined');

    if (cleanValues.length > 0) {
      return (
        <HStack gap="2xs" wrap="wrap" align="center">
          {cleanValues.map((val) => (
            <Code key={val} variant="subtle">
              {val}
            </Code>
          ))}
        </HStack>
      );
    }
  }

  const raw = type.raw || type.name;
  return <Code variant="subtle">{raw.replace(/\s*\|\s*undefined/g, '')}</Code>;
}

const DEFAULT_EXCLUDE_PROPS = ['ref', 'className', 'style'];

export function PropsTable({
  data,
  excludeProps = DEFAULT_EXCLUDE_PROPS,
}: PropsTableProps): React.JSX.Element {
  const propKeys = Object.keys(data?.props || {}).filter((key) => !excludeProps.includes(key));

  if (propKeys.length === 0) {
    return (
      <Text type="caption" color="muted">
        No custom props documented for this component.
      </Text>
    );
  }

  return (
    <Table variant="bordered">
      <Table.Header>
        <Table.Row>
          <Table.Head>Prop</Table.Head>
          <Table.Head>Type</Table.Head>
          <Table.Head>Default</Table.Head>
          <Table.Head>Description</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {propKeys.map((key) => {
          const prop = data?.props?.[key];
          if (!prop) return null;
          const defaultValue = prop.defaultValue?.value;
          const cleanDefault = defaultValue?.replace(/^["']|["']$/g, '');

          return (
            <Table.Row key={key} interactive>
              <Table.Cell>
                <HStack gap="xs" align="center">
                  <Code variant="primary">{prop.name}</Code>
                  {prop.required ? (
                    <Badge variant="primary" intent="error">
                      required
                    </Badge>
                  ) : null}
                </HStack>
              </Table.Cell>
              <Table.Cell>{formatTypeValue(prop.type)}</Table.Cell>
              <Table.Cell>
                {cleanDefault ? (
                  <Code variant="ghost">{cleanDefault}</Code>
                ) : (
                  <Text as="span" type="caption" color="muted">
                    —
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell>
                <Text as="span" type="body" size="sm">
                  {prop.description || '—'}
                </Text>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}
