'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { recipe, cx } from '@cumulo/css';
import { Button, type ButtonProps, type ButtonVariants } from './Button.js';
import { useFocus } from '../hooks/useFocus.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import { Stack, StackProps } from './Stack.js';

type ButtonGroupOrientation = 'horizontal' | 'vertical';
type ButtonGroupSize = NonNullable<ButtonVariants['size']>;
type ButtonGroupVariant = NonNullable<ButtonVariants['variant']>;
type ButtonGroupIntent = NonNullable<ButtonVariants['intent']>;

const buttonGroupRecipe = recipe(
  {
    variants: {
      attached: {
        true: {},
        false: {},
      },
      orientation: {
        horizontal: {},
        vertical: {},
      },
    },
    compoundVariants: [
      {
        variants: { attached: true, orientation: 'horizontal' },
        style: {
          selectors: {
            '& > button:not(:first-child)': {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
            '& > button:not(:last-child)': {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              marginInlineEnd: '-1px',
            },
            '& > button[data-state="active"]': {
              zIndex: 1,
            },
          },
        },
      },
      {
        variants: { attached: true, orientation: 'vertical' },
        style: {
          selectors: {
            '& > button:not(:first-child)': {
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            },
            '& > button:not(:last-child)': {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          },
        },
      },
    ],
    defaultVariants: {
      attached: false,
      orientation: 'horizontal',
    },
  },
  'button-group',
);

export interface ButtonGroupContextValue {
  value?: string;
  setValue: (value: string) => void;
  size?: ButtonGroupSize;
  activeVariant?: ButtonGroupVariant;
  inactiveVariant?: ButtonGroupVariant;
  intent?: ButtonGroupIntent;
  disabled?: boolean;
  orientation?: ButtonGroupOrientation;
}

const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);

export const useButtonGroup = (): ButtonGroupContextValue => {
  const context = useContext(ButtonGroupContext);
  if (!context) {
    throw new Error('useButtonGroup must be used within a ButtonGroup.Root');
  }
  return context;
};

interface ButtonGroupRootProps extends Omit<StackProps, 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: ButtonGroupOrientation;
  size?: ButtonGroupSize;
  /** Button variant applied to the currently selected item (default: 'secondary') */
  activeVariant?: ButtonGroupVariant;
  /** Button variant applied to unselected items (default: 'ghost') */
  inactiveVariant?: ButtonGroupVariant;
  /** Default button intent inherited by items in the group */
  intent?: ButtonGroupIntent;
  disabled?: boolean;
  attached?: boolean;
  children?: ReactNode;
}

function ButtonGroupRoot({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  size = 'sm',
  activeVariant = 'secondary',
  inactiveVariant = 'ghost',
  intent,
  disabled = false,
  attached = false,
  direction,
  gap = '2xs',
  align,
  justify,
  wrap,
  inline = true,
  flex,
  className,
  children,
  ref,
  ...props
}: ButtonGroupRootProps): React.JSX.Element {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: string): void => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo(
    (): ButtonGroupContextValue => ({
      value,
      setValue,
      size,
      activeVariant,
      inactiveVariant,
      intent,
      disabled,
      orientation,
    }),
    [value, setValue, size, activeVariant, inactiveVariant, intent, disabled, orientation],
  );

  const focusRef = useFocus({
    type: 'navigation',
    navigation: orientation === 'vertical' ? 'vertical' : wrap === 'wrap' ? 'both' : 'horizontal',
    itemSelector: 'button:not([disabled])',
  });

  const mergedRef = useMergeRefs(ref, focusRef);
  const resolvedDirection = direction ?? (orientation === 'vertical' ? 'column' : 'row');
  const resolvedGap = attached ? 'none' : (gap ?? '3xs');
  const resolvedAlign = align ?? (orientation === 'vertical' ? 'stretch' : 'center');
  const groupClasses = buttonGroupRecipe({ attached, orientation });

  return (
    <ButtonGroupContext.Provider value={contextValue}>
      <Stack
        ref={mergedRef}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="group"
        data-orientation={orientation}
        data-attached={attached ? 'true' : undefined}
        direction={resolvedDirection}
        gap={resolvedGap}
        align={resolvedAlign}
        justify={justify}
        wrap={wrap}
        inline={inline}
        flex={flex}
        className={cx(groupClasses, className)}
        {...props}
      >
        {children}
      </Stack>
    </ButtonGroupContext.Provider>
  );
}

interface ButtonGroupItemProps extends Omit<ButtonProps, 'value' | 'variant'> {
  value: string;
  active?: boolean;
  /** Override the group's activeVariant for this specific item */
  activeVariant?: ButtonGroupVariant;
  /** Override the group's inactiveVariant for this specific item */
  inactiveVariant?: ButtonGroupVariant;
}

function ButtonGroupItem({
  value,
  active: propActive,
  activeVariant,
  inactiveVariant,
  intent: itemIntent,
  disabled: itemDisabled,
  size: itemSize,
  width = 'auto',
  className,
  children,
  onClick,
  ref,
  ...props
}: ButtonGroupItemProps): React.JSX.Element {
  const context = useContext(ButtonGroupContext);
  const isSelected = propActive ?? (context ? context.value === value : false);
  const isDisabled = itemDisabled ?? context?.disabled ?? false;
  const resolvedSize = itemSize ?? context?.size ?? 'sm';
  const resolvedActiveVariant = activeVariant ?? context?.activeVariant ?? 'secondary';
  const resolvedInactiveVariant = inactiveVariant ?? context?.inactiveVariant ?? 'ghost';
  const resolvedIntent = itemIntent ?? context?.intent;

  const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
    onClick?.(e);
    if (!isDisabled && context) {
      context.setValue(value);
    }
  };

  return (
    <Button
      ref={ref}
      type="button"
      data-state={isSelected ? 'active' : 'inactive'}
      aria-pressed={isSelected}
      variant={isSelected ? resolvedActiveVariant : resolvedInactiveVariant}
      intent={resolvedIntent}
      size={resolvedSize}
      width={width}
      disabled={isDisabled}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

ButtonGroupRoot.displayName = 'ButtonGroup.Root';
ButtonGroupItem.displayName = 'ButtonGroup.Item';

export { ButtonGroupRoot as Root, ButtonGroupItem as Item };

export type {
  ButtonGroupRootProps as RootProps,
  ButtonGroupItemProps as ItemProps,
  ButtonGroupOrientation,
  ButtonGroupSize,
  ButtonGroupVariant,
  ButtonGroupIntent,
};
