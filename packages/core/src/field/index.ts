import {
  FieldRoot,
  FieldInput,
  FieldTextarea,
  FieldCheckbox,
  FieldSwitch,
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

export const Field = Object.assign(FieldRoot, {
  Root: FieldRoot,
  Input: FieldInput,
  Textarea: FieldTextarea,
  Checkbox: FieldCheckbox,
  Switch: FieldSwitch,
  Label: FieldLabel,
  Error: FieldError,
  Description: FieldDescription,
  Group: FieldGroup,
});

export {
  FieldRoot,
  FieldInput,
  FieldTextarea,
  FieldCheckbox,
  FieldSwitch,
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
