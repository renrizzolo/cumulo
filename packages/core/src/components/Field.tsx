'use client';

import React, { createContext, use, useId, useEffect } from 'react';
import { style, cx } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Stack, VStack, type StackProps, type StackVariants } from './Stack.js';
import { Input, type InputProps } from './Input.js';
import { Textarea, type TextareaProps } from './Textarea.js';
import { Checkbox, type CheckboxProps } from './Checkbox.js';
import { Switch, type SwitchProps } from './Switch.js';
import { Label, type LabelProps } from './Label.js';
import { Radio, type RadioProps } from './Radio.js';
import { RadioList, type RadioListProps } from './RadioList.js';

import { usePartsRegistry } from '../hooks/usePartsRegistry.js';

export interface FieldContextValue {
  id: string;
  hasError: boolean;
  registerPart: (part: string, id: string) => () => void;
  getPartId: (part: string) => string | undefined;
  hasPart: (part: string) => boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export const useFieldContext = (): FieldContextValue => {
  const field = use(FieldContext);
  if (!field) {
    throw new Error('useFieldContext must be used within a FieldRoot');
  }
  return field;
};

const fieldIds = {
  description: (id: string) => `${id}-description`,
  error: (id: string) => `${id}-error`,
  label: (id: string) => `${id}-label`,
};

export type FieldGroupVariants = StackVariants;

export interface FieldGroupProps extends StackProps {}

const fieldDescriptionStyle = style({
  fontSize: vars.font.size.xs,
  color: vars.surface.muted,
  margin: 0,
  fontFamily: vars.font.sans,
});

const fieldErrorStyle = style({
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.normal,
  color: vars.error.secondary.fg,
  width: 'max-content',
  margin: 0,
  fontFamily: vars.font.sans,
});

export interface FieldProps extends StackProps {
  children?: React.ReactNode;
  isInvalid?: boolean;
}

export function FieldRoot({
  id: providedId,
  className,
  children,
  isInvalid,
  gap = 'xs',
  ref,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const { registerPart, getPartId, hasPart, parts } = usePartsRegistry();

  const hasError = isInvalid ?? Boolean(parts['error']);

  const contextValue = React.useMemo(
    () => ({
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

export function useFieldItem({
  part = 'input',
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
}: UseFieldItemOptions = {}) {
  const { hasError: fieldHasError, getPartId, id: fieldId, registerPart } = useFieldContext();
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

export function FieldInput({
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
}: InputProps) {
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

export function FieldGroup({
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  ...props
}: FieldGroupProps): React.JSX.Element {
  return <Stack direction={direction} gap={gap} align={align} {...props} />;
}

export function FieldDescription({
  children,
  id: providedId,
  className,
  ...props
}: ElementProps<HTMLParagraphElement>) {
  const { id: fieldId, registerPart } = useFieldContext();
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

export interface FieldErrorProps extends ElementProps<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export function FieldError({ children, id: providedId, className, ...props }: FieldErrorProps) {
  const { id: fieldId, registerPart } = useFieldContext();
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

export function FieldLabel({
  children,
  id: providedId,
  htmlFor: providedHtmlFor,
  ...props
}: LabelProps) {
  const { registerPart, getPartId, id: fieldId } = useFieldContext();
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

export function FieldTextarea({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: TextareaProps) {
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

export function FieldCheckbox({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: CheckboxProps) {
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

export function FieldSwitch({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: SwitchProps) {
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

export function FieldRadio({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: RadioProps) {
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

export function FieldRadioList({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...props
}: RadioListProps) {
  const { id, labelledBy, describedBy } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
  });

  return (
    <RadioList
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      {...props}
    />
  );
}

FieldRoot.displayName = 'Field.Root';
FieldInput.displayName = 'Field.Input';
FieldTextarea.displayName = 'Field.Textarea';
FieldCheckbox.displayName = 'Field.Checkbox';
FieldSwitch.displayName = 'Field.Switch';
FieldRadio.displayName = 'Field.Radio';
FieldRadioList.displayName = 'Field.RadioList';
FieldLabel.displayName = 'Field.Label';
FieldError.displayName = 'Field.Error';
FieldDescription.displayName = 'Field.Description';
FieldGroup.displayName = 'Field.Group';

export const Field = Object.assign(FieldRoot, {
  Root: FieldRoot,
  Input: FieldInput,
  Textarea: FieldTextarea,
  Checkbox: FieldCheckbox,
  Switch: FieldSwitch,
  Radio: FieldRadio,
  RadioList: FieldRadioList,
  Label: FieldLabel,
  Error: FieldError,
  Description: FieldDescription,
  Group: FieldGroup,
});
