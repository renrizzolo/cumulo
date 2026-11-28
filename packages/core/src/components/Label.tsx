import { style, cx } from '@cumulo/css';
import React from 'react';

import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { textBase } from '../typography.js';

const labelStyle = style(
  {
    fontSize: vars.font.size.sm,
    fontWeight: vars.font.weight.medium,
    lineHeight: vars.line.height.none,
    color: vars.surface.fg,
    fontFamily: vars.font.sans,
    userSelect: 'none',
    minWidth: 'max-content',
    ...textBase,
  },
  { layer: 'components' },
);

export interface LabelProps extends ElementProps<HTMLLabelElement> {
  htmlFor?: string;
  children?: React.ReactNode;
}

export function Label({
  className,
  children,
  htmlFor,
  id,
  ref,
  ...props
}: LabelProps): React.JSX.Element {
  return (
    <label ref={ref} id={id} htmlFor={htmlFor} className={cx(labelStyle, className)} {...props}>
      {children}
    </label>
  );
}

Label.displayName = 'Label';
