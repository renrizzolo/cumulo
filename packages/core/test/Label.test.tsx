import { describe, it, expect } from 'vitest';
import React from 'react';
import { Label } from '../src/index.js';

describe('Label component', () => {
  it('instantiates Label with htmlFor and ElementProps', () => {
    const elem = (
      <Label htmlFor="username-input" id="username-label" className="custom-label">
        Username
      </Label>
    );

    expect(elem.props.htmlFor).toBe('username-input');
    expect(elem.props.id).toBe('username-label');
    expect(elem.props.children).toBe('Username');
    expect(elem.props.className).toBe('custom-label');
  });
});
