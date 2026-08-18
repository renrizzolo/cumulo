import {
  FieldRoot,
  FieldInput,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
  FieldContext,
  useFieldContext,
  type FieldProps,
  type FieldErrorProps,
  type FieldContextValue,
} from './Field.js';
import { Label, type LabelProps } from './Label.js';

export const Field = {
  Root: FieldRoot,
  Input: FieldInput,
  Label: FieldLabel,
  Error: FieldError,
  Description: FieldDescription,
  Group: FieldGroup,
};

export {
  FieldRoot,
  FieldInput,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
  FieldContext,
  useFieldContext,
  Label,
  type FieldProps,
  type FieldErrorProps,
  type FieldContextValue,
  type LabelProps,
};
