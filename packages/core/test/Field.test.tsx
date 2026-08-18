import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  Field,
  FieldRoot,
  FieldInput,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
} from '../src/index.js';

describe('Field compound components', () => {
  it('exports all compound field subcomponents', () => {
    expect(Field.Root).toBe(FieldRoot);
    expect(Field.Input).toBe(FieldInput);
    expect(Field.Label).toBe(FieldLabel);
    expect(Field.Error).toBe(FieldError);
    expect(Field.Description).toBe(FieldDescription);
    expect(Field.Group).toBe(FieldGroup);
  });

  it('instantiates complete Field composition', () => {
    const elem = (
      <Field.Root id="email-field" isInvalid>
        <Field.Label>Email Address</Field.Label>
        <Field.Input type="email" placeholder="name@domain.com" />
        <Field.Description>We will never share your email.</Field.Description>
        <Field.Error>Please enter a valid email address.</Field.Error>
      </Field.Root>
    );

    expect(elem.props.id).toBe('email-field');
    expect(elem.props.isInvalid).toBe(true);
    expect(React.Children.count(elem.props.children)).toBe(4);
  });

  it('instantiates Field.Group for inline layout', () => {
    const groupElem = (
      <Field.Group className="inline-fields">
        <Field.Input placeholder="First Name" />
        <Field.Input placeholder="Last Name" />
      </Field.Group>
    );

    expect(groupElem.props.className).toBe('inline-fields');
    expect(React.Children.count(groupElem.props.children)).toBe(2);
  });
});
