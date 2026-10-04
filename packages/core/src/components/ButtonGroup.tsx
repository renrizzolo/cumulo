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
import { Button, type ButtonProps, type ButtonVariants } from './Button.js';
import { useFocus } from '../hooks/useFocus.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import { Stack, StackProps } from './Stack.js';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';
export type ButtonGroupSize = NonNullable<ButtonVariants['size']>;

export interface ButtonGroupContextValue {
  value?: string;
  setValue: (value: string) => void;
  size?: ButtonGroupSize;
  disabled?: boolean;
  orientation?: ButtonGroupOrientation;
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);

export const useButtonGroupContext = (): ButtonGroupContextValue => {
  const context = useContext(ButtonGroupContext);
  if (!context) {
    throw new Error('useButtonGroupContext must be used within a ButtonGroupRoot');
  }
  return context;
};

export interface ButtonGroupRootProps<T extends string = string> extends Omit<
  StackProps,
  'defaultValue' | 'onChange'
> {
  value?: T;
  defaultValue?: string;
  onValueChange?: (value: T) => void;
  orientation?: ButtonGroupOrientation;
  size?: ButtonGroupSize;
  disabled?: boolean;
  attached?: boolean;
  children?: ReactNode;
}

export function ButtonGroupRoot<T extends string>({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  size = 'sm',
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
}: ButtonGroupRootProps<T>): React.JSX.Element {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue as T);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo<ButtonGroupContextValue>(
    () => ({
      value,
      setValue,
      size,
      disabled,
      orientation,
    }),
    [value, setValue, size, disabled, orientation],
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

  return (
    <ButtonGroupContext.Provider value={contextValue}>
      <Stack
        ref={mergedRef}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="group"
        data-orientation={orientation}
        direction={resolvedDirection}
        gap={resolvedGap}
        align={resolvedAlign}
        justify={justify}
        wrap={wrap}
        inline={inline}
        flex={flex}
        className={className}
        {...props}
      >
        {children}
      </Stack>
    </ButtonGroupContext.Provider>
  );
}

export interface ButtonGroupItemProps extends Omit<ButtonProps, 'value'> {
  value: string;
  active?: boolean;
}

export function ButtonGroupItem({
  value,
  active: propActive,
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

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
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
      variant={isSelected ? 'secondary' : 'ghost'}
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

export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
  Item: ButtonGroupItem,
});
