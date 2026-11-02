'use client';

import type React from 'react';
import { useState, useCallback, useMemo } from 'react';

export interface ValueGroupProps<T extends string = string> {
  /** Controlled selected value. */
  value?: T;
  /** Initial selected value when uncontrolled. */
  defaultValue?: T;
  /** Callback fired when the selected value changes. */
  onValueChange?: (value: T) => void;
}

export interface ValueItemProps<T extends string = string> {
  /** Unique value identifying this item within the group. */
  value: T;
}

export interface ValueGroupContextBase<T extends string = string> {
  value?: T;
  setValue(value: T): void;
}

export interface UseValueGroupReturn<T extends string = string> extends ValueGroupContextBase<T> {
  value: T | undefined;
  setValue: (nextValue: T) => void;
}

/**
 * Shared controlled/uncontrolled single-value state hook for value-based
 * group components (ButtonGroup, RadioGroup, Tabs, Select).
 */
export function useValueGroup<T extends string = string>({
  value: controlledValue,
  defaultValue,
  onValueChange,
}: ValueGroupProps<T>): UseValueGroupReturn<T> {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T): void => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  return useMemo(
    (): UseValueGroupReturn<T> => ({
      value,
      setValue,
    }),
    [value, setValue],
  );
}

/**
 * Dispatches a raw DOM string value to a typed value group controller
 * without requiring unsafe type assertions.
 */
export function notifyStringValue(
  controller: ValueGroupContextBase<string>,
  nextValue: string,
): void {
  controller.setValue(nextValue);
}

export interface TypedGroup<RootProps, ItemProps> {
  Root: (props: RootProps) => React.JSX.Element;
  Item: (props: ItemProps) => React.JSX.Element;
}

/**
 * Generic identity helper that binds a compound component dictionary
 * to a specific narrowed prop interface map.
 */
export function createTypedCompound<Parts extends object>(parts: Parts): Parts {
  return parts;
}

/**
 * Generic factory helper for `{ Root, Item }` value group components.
 */
export function createTypedGroup<RootProps, ItemProps>(
  Root: (props: RootProps) => React.JSX.Element,
  Item: (props: ItemProps) => React.JSX.Element,
): TypedGroup<RootProps, ItemProps> {
  return createTypedCompound({ Root, Item });
}
