import React from 'react';

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
}) {
  return (
    <div style={{ overflowX: 'auto', margin: '20px 0' }}>
      <table className="docs-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Token</th>
            <th>Value / Description</th>
            {type !== 'text' && <th style={{ width: '120px' }}>Preview</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name}>
              <td>
                <code>{item.name}</code>
              </td>
              <td>{item.description || item.value}</td>
              {type === 'space' && (
                <td aria-label={item.value}>
                  <div
                    style={{
                      height: '12px',
                      width: item.value || '8px',
                      maxWidth: '100px',
                      backgroundColor: 'var(--docs-brand)',
                      borderRadius: '2px',
                    }}
                  />
                </td>
              )}
              {type === 'radii' && (
                <td aria-label={item.value}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      border: '2px solid var(--docs-brand)',
                      borderRadius: item.value || '0px',
                      background: 'var(--docs-brand-subtle)',
                    }}
                  />
                </td>
              )}
              {type === 'shadow' && (
                <td aria-label={item.value}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'var(--docs-bg)',
                      border: '1px solid var(--docs-border)',
                    }}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TokenTable;
