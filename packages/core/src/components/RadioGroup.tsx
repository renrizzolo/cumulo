'use client';

import React, { useContext, useId, useMemo, type ReactNode } from 'react';
import { Stack, type StackProps } from './Stack.js';
import {
  Radio,
  RadioGroupContext,
  type RadioProps,
  type RadioVariants,
  type RadioGroupContextValue,
  type RadioGroupOrientation,
} from './Radio.js';
import {
  useValueGroup,
  createTypedGroup,
  type ValueGroupProps,
  type ValueItemProps,
  type TypedGroup,
} from '../hooks/useValueGroup.js';

export const useRadioGroup = (): RadioGroupContextValue | null => {
  return useContext(RadioGroupContext);
};

export interface RadioGroupRootProps<T extends string = string>
  extends Omit<StackProps, 'defaultValue' | 'onChange' | 'value'>, ValueGroupProps<T> {
  name?: string;
  orientation?: RadioGroupOrientation;
  disabled?: boolean;
  intent?: 'default' | 'error';
  size?: RadioVariants['size'];
  children?: ReactNode;
}

function RadioGroupRoot<T extends string = string>({
  name: providedName,
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  disabled = false,
  intent,
  size,
  direction,
  gap,
  align,
  justify,
  wrap,
  inline,
  flex,
  className,
  children,
  ref,
  ...props
}: RadioGroupRootProps<T>): React.JSX.Element {
  const generatedName = useId();
  const name = providedName ?? generatedName;

  const { value, setValue } = useValueGroup<T>({
    value: controlledValue,
    defaultValue,
    onValueChange,
  });

  const contextValue = useMemo(
    (): RadioGroupContextValue<T> => ({
      name,
      value,
      setValue,
      disabled,
      orientation,
      intent,
      size,
    }),
    [name, value, setValue, disabled, orientation, intent, size],
  );

  const resolvedDirection = direction ?? (orientation === 'horizontal' ? 'row' : 'column');
  const resolvedGap = gap ?? (orientation === 'horizontal' ? 'md' : 'sm');
  const resolvedAlign = align ?? (orientation === 'horizontal' ? 'center' : 'start');

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <Stack
        ref={ref}
        role="radiogroup"
        aria-orientation={orientation}
        aria-invalid={props['aria-invalid'] ?? (intent === 'error' ? true : undefined)}
        data-invalid={intent === 'error' ? 'true' : undefined}
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
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps<T extends string = string>
  extends Omit<RadioProps<T>, 'value'>, ValueItemProps<T> {}

function RadioGroupItem<T extends string = string>(
  props: RadioGroupItemProps<T>,
): React.JSX.Element {
  return <Radio<T> {...props} />;
}

RadioGroupRoot.displayName = 'RadioGroup.Root';
RadioGroupItem.displayName = 'RadioGroup.Item';

export type TypedRadioGroup<T extends string> = TypedGroup<
  RadioGroupRootProps<T>,
  RadioGroupItemProps<T>
>;

/**
 * Creates a strictly typed `RadioGroup` (`{ Root, Item }`) constrained to value union `T`.
 */
export function createRadioGroup<T extends string>(): TypedRadioGroup<T> {
  return createTypedGroup<RadioGroupRootProps<T>, RadioGroupItemProps<T>>(
    RadioGroupRoot,
    RadioGroupItem,
  );
}

export { RadioGroupRoot as Root, RadioGroupItem as Item, createRadioGroup as create };

export type {
  RadioGroupRootProps as RootProps,
  RadioGroupItemProps as ItemProps,
  RadioGroupOrientation,
  RadioGroupContextValue,
};
