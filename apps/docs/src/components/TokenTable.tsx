import React from 'react';
import { Table, Code, Text } from '@cumulo/core';

export interface TokenItem {
  name: string;
  value?: string;
  description?: string;
}

export function TokenTable({
  items,
  type = 'text',
}: {
  items: TokenItem[];
  type?: 'color' | 'space' | 'radii' | 'shadow' | 'text';
}): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto', margin: '20px 0' }}>
      <Table variant="bordered">
        <Table.Header>
          <Table.Row>
            <Table.Head style={{ width: '40%' }}>Token</Table.Head>
            <Table.Head>Value / Description</Table.Head>
            {type !== 'text' && <Table.Head style={{ width: '120px' }}>Preview</Table.Head>}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item) => (
            <Table.Row key={item.name} interactive>
              <Table.Cell>
                <Code variant="primary">{item.name}</Code>
              </Table.Cell>
              <Table.Cell>
                <Text type="body" size="sm">
                  {item.description || item.value}
                </Text>
              </Table.Cell>
              {type === 'space' && (
                <Table.Cell aria-label={item.value}>
                  <div
                    style={{
                      height: '12px',
                      width: item.value || '8px',
                      maxWidth: '100px',
                      backgroundColor: 'var(--theme-primary, #6366f1)',
                      borderRadius: '2px',
                    }}
                  />
                </Table.Cell>
              )}
              {type === 'radii' && (
                <Table.Cell aria-label={item.value}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      border: '2px solid var(--theme-primary, #6366f1)',
                      borderRadius: item.value || '0px',
                      backgroundColor: 'var(--theme-primary-subtle, rgba(99, 102, 241, 0.15))',
                    }}
                  />
                </Table.Cell>
              )}
              {type === 'shadow' && (
                <Table.Cell aria-label={item.value}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--surface-bg)',
                      border: '1px solid var(--surface-border)',
                      boxShadow: item.description?.includes('shadow-0')
                        ? 'var(--theme-shadow-0)'
                        : item.description?.includes('shadow-1')
                          ? 'var(--theme-shadow-1)'
                          : 'var(--theme-shadow-2)',
                    }}
                  />
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export default TokenTable;
