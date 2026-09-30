'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  useMemo,
  type ReactNode,
} from 'react';
import { Stack, type StackProps } from './Stack.js';

export type RadioListOrientation = 'horizontal' | 'vertical';

export interface RadioListContextValue {
  name: string;
  value?: string;
  setValue: (value: string) => void;
  disabled?: boolean;
  orientation?: RadioListOrientation;
}

export const RadioListContext = createContext<RadioListContextValue | null>(null);

export const useRadioListContext = (): RadioListContextValue | null => {
  return useContext(RadioListContext);
};

export interface RadioListProps extends Omit<StackProps, 'defaultValue' | 'onChange'> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: RadioListOrientation;
  disabled?: boolean;
  children?: ReactNode;
}

export function RadioList({
  name: providedName,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'vertical',
  disabled = false,
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
}: RadioListProps): React.JSX.Element {
  const generatedName = useId();
  const name = providedName ?? generatedName;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo(
    (): RadioListContextValue => ({
      name,
      value,
      setValue,
      disabled,
      orientation,
    }),
    [name, value, setValue, disabled, orientation],
  );

  const resolvedDirection = direction ?? (orientation === 'horizontal' ? 'row' : 'column');
  const resolvedGap = gap ?? (orientation === 'horizontal' ? 'md' : 'sm');
  const resolvedAlign = align ?? (orientation === 'horizontal' ? 'center' : 'start');

  return (
    <RadioListContext.Provider value={contextValue}>
      <Stack
        ref={ref}
        role="radiogroup"
        aria-orientation={orientation}
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
    </RadioListContext.Provider>
  );
}

RadioList.displayName = 'RadioList';
