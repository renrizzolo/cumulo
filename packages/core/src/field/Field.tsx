import React, { createContext, useContext, useState, useCallback, useId, useEffect } from 'react';
import { style, cx } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Input, type InputProps } from '../components/Input.js';
import { Label, type LabelProps } from './Label.js';

export interface FieldContextValue {
  id: string;
  hasError: boolean;
  registerPart: (part: string, id: string) => () => void;
  getPartId: (part: string) => string | undefined;
  hasPart: (part: string) => boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export const useFieldContext = (): FieldContextValue => {
  const field = useContext(FieldContext);
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

const fieldRootStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
});

const fieldGroupStyle = style({
  display: 'flex',
  gap: vars.spacing.xs,
});

const fieldDescriptionStyle = style({
  fontSize: vars.font.size.xs,
  color: vars.surface.muted,
  margin: 0,
  fontFamily: vars.font.sans,
});

const fieldErrorStyle = style({
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.medium,
  color: vars.error.secondary.fg,
  backgroundColor: vars.error.secondary.bg.DEFAULT,
  padding: `${vars.spacing['3xs']} ${vars.spacing.xs}`,
  borderRadius: vars.radius.md,
  width: 'max-content',
  margin: 0,
  fontFamily: vars.font.sans,
});

export interface FieldProps extends ElementProps<HTMLDivElement> {
  children?: React.ReactNode;
  isInvalid?: boolean;
}

export function FieldRoot({
  id: providedId,
  className,
  children,
  isInvalid,
  ref,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const [parts, setParts] = useState<Record<string, string>>({});

  const registerPart = useCallback((part: string, partId: string) => {
    setParts((prev) => ({
      ...prev,
      [part]: partId,
    }));
    return () => {
      setParts((prev) => {
        const { [part]: _, ...rest } = prev;
        return rest;
      });
    };
  }, []);

  const getPartId = useCallback((part: string) => parts[part], [parts]);
  const hasPart = useCallback((part: string) => Boolean(parts[part]), [parts]);

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
      <div ref={ref} className={cx(fieldRootStyle, className)} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  );
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
  ...props
}: InputProps) {
  const { hasError: fieldHasError, getPartId, id, registerPart } = useFieldContext();
  const inputId = providedId || id;

  useEffect(() => {
    return registerPart('input', inputId);
  }, [registerPart, inputId]);

  const labelId = getPartId('label');
  const descriptionId = getPartId('description');
  const errorId = getPartId('error');

  const labelledBy = ariaLabelledby || labelId;
  const describedByParts = [descriptionId, errorId].filter(Boolean).join(' ');
  const describedBy =
    ariaDescribedby || (describedByParts.length > 0 ? describedByParts : undefined);

  const hasError = fieldHasError || Boolean(errorId);

  return (
    <Input
      id={inputId}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      intent={hasError ? 'error' : 'default'}
      aria-invalid={props['aria-invalid'] ?? (hasError ? true : undefined)}
      {...props}
    />
  );
}

export function FieldGroup({ children, className, ...props }: FieldProps) {
  return (
    <div className={cx(fieldGroupStyle, className)} {...props}>
      {children}
    </div>
  );
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
    <p
      id={id}
      className={cx(fieldDescriptionStyle, className)}
      {...props}
    >
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
