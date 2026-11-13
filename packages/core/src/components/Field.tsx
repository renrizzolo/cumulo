'use client';

import React, { createContext, use, useId, useEffect } from 'react';
import { style, cx } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Stack, type StackProps, type StackVariants } from './Stack.js';
import { Input, type InputProps } from './Input.js';
import { Textarea, type TextareaProps } from './Textarea.js';
import { Root as Select, type RootProps as SelectProps } from './Select.js';
import { Checkbox, type CheckboxProps } from './Checkbox.js';
import { Switch, type SwitchProps } from './Switch.js';
import { Slider, type SliderProps } from './Slider.js';
import { Label, type LabelProps } from './Label.js';
import { Radio, type RadioProps } from './Radio.js';
import { Root as RadioGroupRoot, type RadioGroupRootProps } from './RadioGroup.js';

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
  lineHeight: vars.line.height.normal,
  color: vars.surface.muted,
  margin: 0,
  fontFamily: vars.font.sans,
});

const fieldErrorStyle = style({
  ...textBase,
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.normal,
  lineHeight: vars.line.height.normal,
  color: vars.error.secondary.fg,
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
  direction = 'column',
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
      <Stack ref={ref} direction={direction} gap={gap} className={className} {...props}>
        {children}
      </Stack>
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

function FieldSelect<T extends string = string>({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: SelectProps<T>): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent: intent === 'error' ? 'error' : 'default',
  });

  return (
    <Select<T>
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
  const { registerPart, getPartId, hasPart, id: fieldId } = useField();
  const id = providedId || fieldIds.label(fieldId);
  const inputId = getPartId('input');
  const htmlFor =
    providedHtmlFor ?? (inputId ? inputId : hasPart('radiogroup') ? undefined : fieldId);

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

function FieldSlider({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: SliderProps): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent: intent === 'error' ? 'error' : 'default',
  });

  return (
    <Slider
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

function FieldRadio<T extends string = string>({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: RadioProps<T>): React.JSX.Element {
  const { hasPart } = useField();
  const isInsideRadioGroupField = hasPart('radiogroup');
  const { id, labelledBy, describedBy, hasError } = useFieldItem({
    part: isInsideRadioGroupField ? 'radio' : 'input',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent,
  });

  return (
    <Radio<T>
      id={isInsideRadioGroupField ? providedId : id}
      aria-labelledby={isInsideRadioGroupField ? ariaLabelledby : labelledBy}
      aria-describedby={isInsideRadioGroupField ? ariaDescribedby : describedBy}
      className={className}
      intent={hasError ? 'error' : intent}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      {...props}
    />
  );
}

function FieldRadioGroup<T extends string = string>({
  className,
  id: providedId,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  intent,
  ...props
}: RadioGroupRootProps<T>): React.JSX.Element {
  const { id, labelledBy, describedBy, hasError, resolvedIntent } = useFieldItem({
    part: 'radiogroup',
    id: providedId,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    intent,
  });

  return (
    <RadioGroupRoot<T>
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
FieldSlider.displayName = 'Field.Slider';
FieldRadio.displayName = 'Field.Radio';
FieldRadioGroup.displayName = 'Field.RadioGroup';
FieldLabel.displayName = 'Field.Label';
FieldError.displayName = 'Field.Error';
FieldDescription.displayName = 'Field.Description';
FieldGroup.displayName = 'Field.Group';

type FieldInputProps = InputProps;
type FieldSelectProps<T extends string = string> = SelectProps<T>;
type FieldTextareaProps = TextareaProps;
type FieldCheckboxProps = CheckboxProps;
type FieldSwitchProps = SwitchProps;
type FieldSliderProps = SliderProps;
type FieldRadioProps<T extends string = string> = RadioProps<T>;
type FieldRadioGroupProps<T extends string = string> = RadioGroupRootProps<T>;
type FieldLabelProps = LabelProps;
type FieldDescriptionProps = ElementProps<HTMLParagraphElement>;

export {
  FieldRoot as Root,
  FieldInput as Input,
  FieldSelect as Select,
  FieldTextarea as Textarea,
  FieldCheckbox as Checkbox,
  FieldSwitch as Switch,
  FieldSlider as Slider,
  FieldRadio as Radio,
  FieldRadioGroup as RadioGroup,
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
  FieldSliderProps as SliderProps,
  FieldRadioProps as RadioProps,
  FieldRadioGroupProps as RadioGroupProps,
  FieldLabelProps as LabelProps,
  FieldErrorProps as ErrorProps,
  FieldDescriptionProps as DescriptionProps,
  FieldGroupProps as GroupProps,
  FieldGroupVariants as GroupVariants,
};
