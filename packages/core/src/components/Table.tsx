import React from 'react';
import { recipe, cx, type RecipeVariants, style, createThemeContract } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const tableContract = createThemeContract(
  {
    bg: null,
  },
  'table',
);

export const tableRecipe = recipe(
  {
    base: {
      width: '100%',
      borderCollapse: 'separate',
      overflow: 'hidden',
      textAlign: 'left',
      fontSize: vars.font.size.sm,
      fontFamily: vars.font.sans,
      color: vars.surface.fg,
      borderSpacing: 0,
      borderRadius: vars.radius.control,
    },
    variants: {
      variant: {
        default: {},
        bordered: {
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
          ...tableContract.$set({
            bg: vars.surface.bg.next,
          }),
          selectors: {
            '& tbody tr:last-child td': {
              borderBottom: 'none',
            },
            '& > tr:last-child td': {
              borderBottom: 'none',
            },
          },
        },
      },
      interactive: {
        true: {
          selectors: {
            '& tbody tr, & > tr': {
              transition: `background-color ${vars.duration.fast} ${vars.ease.default}`,
            },
            '& tbody tr:hover, & > tr:hover': {
              backgroundColor: vars.surface.bg.next,
            },
          },
        },
        false: {},
      },
    },
    defaultVariants: {
      variant: 'default',
      interactive: false,
    },
  },
  'table',
);

const tableWrapper = style({
  overflowX: 'auto',
});

export const tableHeadCellRecipe = recipe(
  {
    base: {
      padding: `${vars.spacing.sm} ${vars.spacing.md}`,
      fontWeight: vars.font.weight.semibold,
      color: vars.surface.fg,
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: vars.surface.border,
      backgroundColor: tableContract.bg,
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

export const tableRowRecipe = recipe({}, 'table-tr');

export type TableVariants = RecipeVariants<typeof tableRecipe>;
export type TableRowVariants = RecipeVariants<typeof tableRowRecipe>;

function cleanTableChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.toArray(children).filter(
    (child) => typeof child !== 'string' || child.trim() !== '',
  );
}

export interface TableProps extends ElementProps<HTMLTableElement> {
  variant?: TableVariants['variant'];
  interactive?: TableVariants['interactive'];
  children?: React.ReactNode;
}

export function TableRoot({
  variant = 'default',
  interactive = false,
  className,
  children,
  ref,
  ...props
}: TableProps): React.JSX.Element {
  const classes = tableRecipe({ variant, interactive });

  return (
    <div className={tableWrapper.className}>
      <table ref={ref} className={cx(classes, className)} {...props}>
        {children}
      </table>
    </div>
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

export type TableRowProps = ElementProps<HTMLTableRowElement>;

export function TableRow({ className, children, ref, ...props }: TableRowProps): React.JSX.Element {
  return (
    <tr ref={ref} className={className} {...props}>
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

TableRoot.displayName = 'Table';
TableHeader.displayName = 'Table.Header';
TableBody.displayName = 'Table.Body';
TableRow.displayName = 'Table.Row';
TableHead.displayName = 'Table.Head';
TableCell.displayName = 'Table.Cell';
TableCaption.displayName = 'Table.Caption';
