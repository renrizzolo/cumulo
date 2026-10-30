'use client';

import React, { createContext, use, useId, useEffect } from 'react';
import { style, cx } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Stack, VStack, type StackProps, type StackVariants } from './Stack.js';
import { Input, type InputProps } from './Input.js';
import { Textarea, type TextareaProps } from './Textarea.js';
import { Select, type SelectProps } from './Select.js';
import { Checkbox, type CheckboxProps } from './Checkbox.js';
import { Switch, type SwitchProps } from './Switch.js';
import { Label, type LabelProps } from './Label.js';
import { Radio, type RadioProps } from './Radio.js';
import { RadioList, type RadioListProps } from './RadioList.js';

import { usePartsRegistry } from '../hooks/usePartsRegistry.js';
import { textBase } from '../typography.js';

export interface FieldContextValue {
  id: string;
  hasError: boolean;
  registerPart: (part: string, id: string) => () => void;
  getPartId: (part: string) => string | undefined;
  hasPart: (part: string) => boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export const useField = (): FieldContextValue => {
  const field = use(FieldContext);
  if (!field) {
    throw new Error('useField must be used within a Field.Root');
  }
  return field;
};

const fieldIds = {
  description: (id: string) => `${id}-description`,
  error: (id: string) => `${id}-error`,
  label: (id: string) => `${id}-label`,
};

type FieldGroupVariants = StackVariants;

interface FieldGroupProps extends StackProps {}

const fieldDescriptionStyle = style({
  ...textBase,
  fontSize: vars.font.size.xs,
  color: vars.surface.muted,
  margin: 0,
  fontFamily: vars.font.sans,
});

const fieldErrorStyle = style({
  ...textBase,
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.normal,
  color: vars.error.secondary.fg,
  width: 'max-content',
  margin: 0,
  fontFamily: vars.font.sans,
});

interface FieldProps extends StackProps {
  children?: React.ReactNode;
  isInvalid?: boolean;
}

function FieldRoot({
  id: providedId,
  className,
  children,
  isInvalid,
  gap = 'sm',
  ref,
  ...props
}: FieldProps): React.JSX.Element {
  const generatedId = useId();
  const id = providedId || generatedId;
  const { registerPart, getPartId, hasPart, parts } = usePartsRegistry();

  const hasError = isInvalid ?? Boolean(parts['error']);

  const contextValue = React.useMemo(
    (): FieldContextValue => ({
      id,
      hasError,
      registerPart,
      getPartId,
      hasPart,
    }),
    [id, hasError, registerPart, getPartId, hasPart],
  );

  return (
    <FieldContext.Provider value={contextValue}>
      <VStack ref={ref} gap={gap} className={className} {...props}>
        {children}
      </VStack>
    </FieldContext.Provider>
  );
}

export interface UseFieldItemOptions {
  part?: string;
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  intent?: 'default' | 'error';
}

interface UseFieldItemReturn {
  id: string;
  labelledBy: string | undefined;
  describedBy: string | undefined;
  hasError: boolean;
  resolvedIntent: 'default' | 'error';
}

function useFieldItem({
  part = 'input',
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
}: UseFieldItemOptions = {}): UseFieldItemReturn {
  const { hasError: fieldHasError, getPartId, id: fieldId, registerPart } = useField();
  const id = providedId || fieldId;

  useEffect(() => {
    return registerPart(part, id);
  }, [registerPart, part, id]);

  const labelId = getPartId('label');
  const descriptionId = getPartId('description');
  const errorId = getPartId('error');

  const labelledBy = ariaLabelledby || labelId;
  const describedByParts = [descriptionId, errorId].filter(Boolean).join(' ');
  const describedBy =
    ariaDescribedby || (describedByParts.length > 0 ? describedByParts : undefined);

  const hasError = fieldHasError || Boolean(errorId);
  const resolvedIntent = hasError ? 'error' : (intent ?? 'default');

  return {
    id,
    labelledBy,
    describedBy,
    hasError,
    resolvedIntent,
  };
}

function FieldInput({
  className,
  type,
  value,
  onChange,
  placeholder,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: InputProps): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent,
  });

  return (
    <Input
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      intent={resolvedIntent}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      {...props}
    />
  );
}

function FieldSelect({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: SelectProps): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent: intent === 'error' ? 'error' : 'default',
  });

  return (
    <Select
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      intent={hasError ? 'error' : (intent ?? resolvedIntent)}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      {...props}
    />
  );
}

function FieldGroup({
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  ...props
}: FieldGroupProps): React.JSX.Element {
  return <Stack direction={direction} gap={gap} align={align} {...props} />;
}

function FieldDescription({
  children,
  id: providedId,
  className,
  ...props
}: ElementProps<HTMLParagraphElement>): React.JSX.Element {
  const { id: fieldId, registerPart } = useField();
  const id = providedId || fieldIds.description(fieldId);

  useEffect(() => {
    return registerPart('description', id);
  }, [registerPart, id]);

  return (
    <p id={id} className={cx(fieldDescriptionStyle, className)} {...props}>
      {children}
    </p>
  );
}

interface FieldErrorProps extends ElementProps<HTMLParagraphElement> {
  children?: React.ReactNode;
}

function FieldError({
  children,
  id: providedId,
  className,
  ...props
}: FieldErrorProps): React.JSX.Element {
  const { id: fieldId, registerPart } = useField();
  const id = providedId || fieldIds.error(fieldId);

  useEffect(() => {
    return registerPart('error', id);
  }, [registerPart, id]);

  return (
    <p id={id} className={cx(fieldErrorStyle, className)} {...props}>
      {children}
    </p>
  );
}

function FieldLabel({
  children,
  id: providedId,
  htmlFor: providedHtmlFor,
  ...props
}: LabelProps): React.JSX.Element {
  const { registerPart, getPartId, id: fieldId } = useField();
  const id = providedId || fieldIds.label(fieldId);
  const htmlFor = providedHtmlFor || getPartId('input') || fieldId;

  useEffect(() => {
    return registerPart('label', id);
  }, [registerPart, id]);

  return (
    <Label id={id} htmlFor={htmlFor} {...props}>
      {children}
    </Label>
  );
}

function FieldTextarea({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: TextareaProps): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent,
  });

  return (
    <Textarea
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      intent={resolvedIntent}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      {...props}
    />
  );
}

function FieldCheckbox({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: CheckboxProps): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent,
  });

  return (
    <Checkbox
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      intent={resolvedIntent}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      {...props}
    />
  );
}

function FieldSwitch({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: SwitchProps): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent,
  });

  return (
    <Switch
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      intent={resolvedIntent}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      {...props}
    />
  );
}

function FieldRadio({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: RadioProps): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent,
  });

  return (
    <Radio
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      intent={resolvedIntent}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      {...props}
    />
  );
}

function FieldRadioList({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: RadioListProps): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent,
  });

  return (
    <RadioList
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      intent={resolvedIntent}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      className={className}
      {...props}
    />
  );
}

FieldRoot.displayName = 'Field.Root';
FieldInput.displayName = 'Field.Input';
FieldSelect.displayName = 'Field.Select';
FieldTextarea.displayName = 'Field.Textarea';
FieldCheckbox.displayName = 'Field.Checkbox';
FieldSwitch.displayName = 'Field.Switch';
FieldRadio.displayName = 'Field.Radio';
FieldRadioList.displayName = 'Field.RadioList';
FieldLabel.displayName = 'Field.Label';
FieldError.displayName = 'Field.Error';
FieldDescription.displayName = 'Field.Description';
FieldGroup.displayName = 'Field.Group';

type FieldInputProps = InputProps;
type FieldSelectProps = SelectProps;
type FieldTextareaProps = TextareaProps;
type FieldCheckboxProps = CheckboxProps;
type FieldSwitchProps = SwitchProps;
type FieldRadioProps = RadioProps;
type FieldRadioListProps = RadioListProps;
type FieldLabelProps = LabelProps;
type FieldDescriptionProps = ElementProps<HTMLParagraphElement>;

export {
  FieldRoot as Root,
  FieldInput as Input,
  FieldSelect as Select,
  FieldTextarea as Textarea,
  FieldCheckbox as Checkbox,
  FieldSwitch as Switch,
  FieldRadio as Radio,
  FieldRadioList as RadioList,
  FieldLabel as Label,
  FieldError as Error,
  FieldDescription as Description,
  FieldGroup as Group,
};

export type {
  FieldProps as RootProps,
  FieldInputProps as InputProps,
  FieldSelectProps as SelectProps,
  FieldTextareaProps as TextareaProps,
  FieldCheckboxProps as CheckboxProps,
  FieldSwitchProps as SwitchProps,
  FieldRadioProps as RadioProps,
  FieldRadioListProps as RadioListProps,
  FieldLabelProps as LabelProps,
  FieldErrorProps as ErrorProps,
  FieldDescriptionProps as DescriptionProps,
  FieldGroupProps as GroupProps,
  FieldGroupVariants as GroupVariants,
};
