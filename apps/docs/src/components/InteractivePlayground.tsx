'use client';

import React, { useState } from 'react';
import { Surface, Button, Input, Badge, Card } from '@cumulo/core';

export function InteractivePlayground() {
  const [count, setCount] = useState(0);
  const [seedColor, setSeedColor] = useState('#2563eb');
  const [inputValue, setInputValue] = useState('');

  const handleSeedChange = (color: string) => {
    setSeedColor(color);
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-primary-base', color);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        margin: '20px 0',
      }}
    >
      {/* Dynamic Surface Nesting Showcase */}
      <Surface
        level={0}
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Surface Level 0 (Canvas)
            </h4>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--surface-muted)',
                margin: '4px 0 0',
              }}
            >
              Interactive elements automatically darken/adapt via <code>--surface-bg-next</code>.
            </p>
          </div>
          <Badge variant="primary" intent="primary">
            Surface 0
          </Badge>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button variant="primary" onClick={() => setCount((c) => c + 1)}>
            Primary Action ({count})
          </Button>
          <Button variant="secondary" onClick={() => setCount(0)}>
            Secondary Reset
          </Button>
          <Button variant="outline" intent="success">
            Outline Success
          </Button>
          <div style={{ width: '220px' }}>
            <Input
              placeholder="Input on Surface 0..."
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            />
          </div>
        </div>

        {/* Nested Surface Level 1 */}
        <Surface
          level={1}
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                Surface Level 1 (Card / Container)
              </h5>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--surface-muted)',
                  margin: '2px 0 0',
                }}
              >
                Hovering inputs/buttons shifts into Surface Level 2 background.
              </p>
            </div>
            <Badge variant="secondary" intent="success">
              Surface 1
            </Badge>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button variant="secondary" intent="warning">
              Warning Secondary
            </Button>
            <Button variant="outline" intent="error">
              Error Outline
            </Button>
            <div style={{ width: '220px' }}>
              <Input placeholder="Input on Surface 1..." />
            </div>
          </div>

          {/* Nested Surface Level 2 */}
          <Surface
            level={2}
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                Surface Level 2 (Elevated Popover / Modal)
              </span>
              <Badge variant="outline" intent="info">
                Surface 2
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Button size="small" variant="primary">
                Small Primary
              </Button>
              <Button size="small" variant="secondary">
                Small Secondary
              </Button>
              <div style={{ width: '180px' }}>
                <Input size="small" placeholder="Input on Surface 2..." />
              </div>
            </div>
          </Surface>
        </Surface>
      </Surface>

      {/* Live OKLCH Color Seeding Controls */}
      <Card level={1} padding="md" style={{ gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
            Live Mathematical OKLCH Color Seeding
          </h4>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--surface-muted)',
              margin: '4px 0 0',
            }}
          >
            Change the seed color below to see the entire 50-900 palette recompute live in pure CSS!
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Blue', hex: '#2563eb' },
            { label: 'Purple', hex: '#7c3aed' },
            { label: 'Emerald', hex: '#059669' },
            { label: 'Rose', hex: '#e11d48' },
            { label: 'Amber', hex: '#d97706' },
          ].map((preset) => (
            <Button
              key={preset.hex}
              size="small"
              variant={seedColor === preset.hex ? 'primary' : 'outline'}
              onClick={() => handleSeedChange(preset.hex)}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: preset.hex,
                  display: 'inline-block',
                  marginRight: '6px',
                }}
              />
              {preset.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
