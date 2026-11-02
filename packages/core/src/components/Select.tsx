'use client';

import React, { useCallback } from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { fieldIntentStyles, sizes } from '../intents.js';
import {
  useValueGroup,
  notifyStringValue,
  createTypedCompound,
  type ValueGroupProps,
  type ValueItemProps,
  type TypedGroup,
} from '../hooks/useValueGroup.js';

export const selectRecipe = recipe(
  {
    extend: [fieldIntentStyles, sizes],
    base: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      appearance: 'none',
      fontFamily: vars.font.sans,
      color: vars.surface.fg,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      borderRadius: vars.radius.control,
      outline: 'none',
      boxSizing: 'border-box',
      cursor: 'pointer',
      transition: `all ${vars.duration.fast} ${vars.ease.default}`,
      ':focus-visible': {
        borderColor: vars.primary.DEFAULT,
        boxShadow: `0 0 0 3px ${vars.primary.subtle}`,
      },
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      selectors: {
        '&, &::picker(select)': {
          appearance: 'base-select',
        },
        '&::picker-icon': {
          display: 'none',
        },
        '&::picker(select)': {
          minWidth: 'anchor-size(self-inline)',
          marginBlock: vars.spacing['2xs'],
          padding: vars.spacing['2xs'],
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
          borderRadius: vars.radius.lg,
          backgroundColor: vars.surface.bg.DEFAULT,
          color: vars.surface.fg,
          boxShadow: vars.shadow['2'],
          fontFamily: vars.font.sans,
          outline: 'none',
        },
        '& option': {
          marginBlock: vars.spacing['2xs'],
          display: 'flex',
          alignItems: 'center',
          gap: vars.spacing.xs,
          padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
          borderRadius: vars.radius.md,
          color: vars.surface.fg,
          backgroundColor: 'transparent',
          fontFamily: vars.font.sans,
          fontSize: vars.font.size.sm,
          fontWeight: vars.font.weight.normal,
          cursor: 'pointer',
          transition: `background-color ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}`,
        },
        '& > option:first-child': {
          marginBlockStart: 0,
        },
        '& > option:last-child, & > optgroup:last-child > option:last-child': {
          marginBlockEnd: 0,
        },
        '& option:hover, & option:focus-visible': {
          backgroundColor: vars.surface.secondary.hover,
          color: vars.surface.fg,
          outline: 'none',
        },
        '& option:checked': {
          backgroundColor: vars.surface.secondary.DEFAULT,
          color: vars.surface.fg,
          fontWeight: vars.font.weight.semibold,
        },
        '& option:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
        '& option::checkmark': {
          color: vars.primary.DEFAULT,
          fontWeight: vars.font.weight.bold,
        },
        '& optgroup': {
          fontFamily: vars.font.sans,
          fontSize: vars.font.size.xs,
          fontWeight: vars.font.weight.semibold,
          color: vars.surface.muted,
          padding: 0,
        },
        '& optgroup::before, & optgroup legend': {
          display: 'block',
          padding: `${vars.spacing['2xs']} ${vars.spacing.xs}`,
        },
      },
    },
    variants: {
      variant: {
        field: {},
        outline: {
          backgroundColor: 'transparent',
          borderColor: vars.surface.border,
        },
        filled: {
          backgroundColor: vars.surface.secondary.DEFAULT,
          borderColor: 'transparent',
        },
        ghost: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          ':hover': {
            backgroundColor: vars.surface.secondary.DEFAULT,
          },
        },
      },
      intent: {
        default: {},
        error: {},
        success: {
          borderColor: vars.success.bg,
          ':focus-visible': {
            borderColor: vars.success.bg,
          },
        },
      },
      size: {
        '2xs': {
          height: vars.size['2xs'],
          paddingLeft: vars.spacing['2xs'],
          paddingRight: vars.size['2xs'],
          fontSize: vars.font.size['2xs'],
        },
        xs: {
          height: vars.size.xs,
          paddingLeft: vars.spacing.xs,
          paddingRight: vars.size.xs,
          fontSize: vars.font.size.xs,
        },
        sm: {
          height: vars.size.sm,
          paddingLeft: vars.spacing.sm,
          paddingRight: vars.size.sm,
          fontSize: vars.font.size.sm,
        },
        md: {
          height: vars.size.md,
          paddingLeft: vars.spacing.md,
          paddingRight: vars.size.md,
          fontSize: vars.font.size.sm,
        },
        lg: {
          height: vars.size.lg,
          paddingLeft: vars.spacing.lg,
          paddingRight: vars.size.lg,
          fontSize: vars.font.size.base,
        },
        xl: {
          height: vars.size.xl,
          paddingLeft: vars.spacing.xl,
          paddingRight: vars.size.xl,
          fontSize: vars.font.size.lg,
        },
        inherit: {
          height: 'auto',
          paddingRight: vars.size.sm,
        },
      },
    },
    defaultVariants: {
      variant: 'field',
      intent: 'default',
      size: 'md',
    },
  },
  'select',
);

const selectWrapperStyle = style(
  {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
  },
  'select-wrapper',
);

const chevronContainerStyle = style(
  {
    position: 'absolute',
    insetInlineEnd: vars.spacing.xs,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    color: vars.surface.subtle,
    transition: `color ${vars.duration.fast} ${vars.ease.default}, transform ${vars.duration.fast} ${vars.ease.default}`,
    selectors: {
      '[data-select-wrapper="true"]:focus-within &': {
        color: vars.surface.fg,
      },
      '[data-select-wrapper="true"]:has(select:open) &': {
        transform: 'rotate(180deg)',
        color: vars.surface.fg,
      },
      '[data-select-wrapper="true"][data-disabled="true"] &': {
        opacity: 0.5,
      },
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  'select-chevron',
);

const chevronSvgStyle = style({
  width: vars.size['3xs'],
  height: vars.size['3xs'],
  display: 'block',
  flexShrink: 0,
});

export type SelectVariants = RecipeVariants<typeof selectRecipe>;

export interface SelectProps<T extends string = string>
  extends
    Omit<ElementProps<HTMLSelectElement>, 'size' | 'value' | 'defaultValue'>,
    Omit<ValueGroupProps<T>, 'defaultValue'> {
  /**
   * Initial selected value when uncontrolled (use `""` to select the placeholder option).
   */
  defaultValue?: T | '';
  /**
   * Visual surface variant of the select control.
   * @default 'field'
   */
  variant?: SelectVariants['variant'];
  /**
   * Visual validation intent of the select control.
   * @default 'default'
   */
  intent?: SelectVariants['intent'];
  /**
   * Height and typography scale of the select control.
   * @default 'md'
   */
  size?: SelectVariants['size'];
  /**
   * Optional placeholder text rendered as a disabled initial `<option value="">`.
   */
  placeholder?: string;
  children?: React.ReactNode;
}

function SelectRoot<T extends string = string>({
  value: controlledValue,
  defaultValue,
  onValueChange,
  onChange,
  variant = 'field',
  intent = 'default',
  size = 'md',
  placeholder,
  disabled,
  className,
  children,
  ref,
  ...props
}: SelectProps<T>): React.JSX.Element {
  const valueController = useValueGroup<T>({
    value: controlledValue,
    defaultValue: defaultValue && defaultValue !== '' ? defaultValue : undefined,
    onValueChange,
  });

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      onChange?.(event);
      if (!event.defaultPrevented) {
        notifyStringValue(valueController, event.currentTarget.value);
      }
    },
    [onChange, valueController],
  );

  const classes = selectRecipe({
    variant,
    intent,
    size: size === 'inherit' ? 'inherit' : size,
  });

  const resolvedDefaultValue =
    controlledValue === undefined
      ? (defaultValue ?? (placeholder !== undefined ? '' : undefined))
      : undefined;

  return (
    <div
      data-select-wrapper="true"
      data-disabled={disabled ? 'true' : undefined}
      className={selectWrapperStyle.className}
    >
      <select
        ref={ref}
        value={controlledValue}
        defaultValue={resolvedDefaultValue}
        disabled={disabled}
        onChange={handleChange}
        aria-invalid={props['aria-invalid'] ?? (intent === 'error' ? true : undefined)}
        className={cx(classes, className)}
        {...props}
      >
        {placeholder !== undefined ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <span className={chevronContainerStyle.className} aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={chevronSvgStyle.className}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  );
}

export interface SelectOptionProps<T extends string = string>
  extends Omit<ElementProps<HTMLOptionElement>, 'value' | 'defaultValue'>, ValueItemProps<T> {
  children?: React.ReactNode;
}

function SelectOption<T extends string = string>({
  value,
  children,
  ref,
  ...props
}: SelectOptionProps<T>): React.JSX.Element {
  return (
    <option ref={ref} value={value} {...props}>
      {children}
    </option>
  );
}

export interface SelectOptGroupProps extends ElementProps<HTMLOptGroupElement> {
  children?: React.ReactNode;
}

function SelectOptGroup({ children, ref, ...props }: SelectOptGroupProps): React.JSX.Element {
  return (
    <optgroup ref={ref} {...props}>
      {children}
    </optgroup>
  );
}

SelectRoot.displayName = 'Select';
SelectOption.displayName = 'Select.Option';
SelectOptGroup.displayName = 'Select.OptGroup';

export interface TypedSelect<T extends string> extends TypedGroup<
  SelectProps<T>,
  SelectOptionProps<T>
> {
  Option: (props: SelectOptionProps<T>) => React.JSX.Element;
  OptGroup: (props: SelectOptGroupProps) => React.JSX.Element;
  Group: (props: SelectOptGroupProps) => React.JSX.Element;
}

/**
 * Creates a strictly typed `Select` (`{ Root, Item, Option, Group, OptGroup }`) constrained to value union `T`.
 */
export function createSelect<T extends string>(): TypedSelect<T> {
  return createTypedCompound({
    Root: SelectRoot,
    Item: SelectOption,
    Option: SelectOption,
    Group: SelectOptGroup,
    OptGroup: SelectOptGroup,
  });
}

export const Select = Object.assign(SelectRoot, {
  Root: SelectRoot,
  Item: SelectOption,
  Option: SelectOption,
  Group: SelectOptGroup,
  OptGroup: SelectOptGroup,
  create: createSelect,
});

export {
  SelectRoot as Root,
  SelectOption as Item,
  SelectOption as Option,
  SelectOptGroup as Group,
  SelectOptGroup as OptGroup,
  createSelect as create,
};

export type {
  SelectProps as RootProps,
  SelectOptionProps as ItemProps,
  SelectOptionProps as OptionProps,
  SelectOptGroupProps as GroupProps,
  SelectOptGroupProps as OptGroupProps,
};
