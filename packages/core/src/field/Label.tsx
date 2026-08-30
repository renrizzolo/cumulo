import React from 'react';
import type { ElementProps } from '../ElementProps.js';
import { style, cx } from '@cumulo/css';
import { vars } from '../contract.js';

const labelStyle = style({
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.medium,
  lineHeight: vars.line.height.none,
  color: vars.surface.fg,
  fontFamily: vars.font.sans,
  userSelect: 'none',
});

export interface LabelProps extends ElementProps<HTMLLabelElement> {
  htmlFor?: string;
  children?: React.ReactNode;
}

export function Label({ className, children, htmlFor, id, ref, ...props }: LabelProps) {
  return (
    <label ref={ref} id={id} htmlFor={htmlFor} className={cx(labelStyle, className)} {...props}>
      {children}
    </label>
  );
}
