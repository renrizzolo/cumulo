import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const tableRecipe = recipe(
  {
    base: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: vars.font.size.sm,
      fontFamily: vars.font.sans,
      color: vars.surface.fg,
    },
    variants: {
      variant: {
        default: {},
        bordered: {
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
        },
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
  'table',
);

export const tableHeadCellRecipe = recipe(
  {
    base: {
      padding: `${vars.spacing.sm} ${vars.spacing.md}`,
      fontWeight: vars.font.weight.semibold,
      color: vars.surface.fg,
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: vars.surface.border,
      backgroundColor: vars.surface.bg.next,
      textAlign: 'left',
    },
    variants: {},
  },
  'table-th',
);

export const tableCellRecipe = recipe(
  {
    base: {
      padding: `${vars.spacing.sm} ${vars.spacing.md}`,
      color: vars.surface.fg,
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: vars.surface.border,
      verticalAlign: 'top',
    },
    variants: {},
  },
  'table-td',
);

export const tableRowRecipe = recipe(
  {
    base: {
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}`,
    },
    variants: {
      interactive: {
        true: {
          ':hover': {
            backgroundColor: vars.surface.bg.next,
          },
        },
        false: {},
      },
    },
    defaultVariants: {
      interactive: false,
    },
  },
  'table-tr',
);

export type TableVariants = RecipeVariants<typeof tableRecipe>;

function cleanTableChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.toArray(children).filter(
    (child) => typeof child !== 'string' || child.trim() !== '',
  );
}

export interface TableProps extends ElementProps<HTMLTableElement> {
  variant?: 'default' | 'bordered';
  children?: React.ReactNode;
}

export function TableRoot({
  variant = 'default',
  className,
  children,
  ref,
  ...props
}: TableProps): React.JSX.Element {
  const classes = tableRecipe({ variant });

  return (
    <table ref={ref} className={cx(classes, className)} {...props}>
      {cleanTableChildren(children)}
    </table>
  );
}

export function TableHeader({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLTableSectionElement>): React.JSX.Element {
  return (
    <thead ref={ref} className={className} {...props}>
      {cleanTableChildren(children)}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLTableSectionElement>): React.JSX.Element {
  return (
    <tbody ref={ref} className={className} {...props}>
      {cleanTableChildren(children)}
    </tbody>
  );
}

export interface TableRowProps extends ElementProps<HTMLTableRowElement> {
  interactive?: boolean;
}

export function TableRow({
  interactive = false,
  className,
  children,
  ref,
  ...props
}: TableRowProps): React.JSX.Element {
  const classes = tableRowRecipe({ interactive });
  return (
    <tr ref={ref} className={cx(classes, className)} {...props}>
      {cleanTableChildren(children)}
    </tr>
  );
}

export function TableHead({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLTableCellElement>): React.JSX.Element {
  const classes = tableHeadCellRecipe();
  return (
    <th ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLTableCellElement>): React.JSX.Element {
  const classes = tableCellRecipe();
  return (
    <td ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </td>
  );
}

export function TableCaption({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLTableCaptionElement>): React.JSX.Element {
  return (
    <caption ref={ref} className={className} {...props}>
      {children}
    </caption>
  );
}

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
});
