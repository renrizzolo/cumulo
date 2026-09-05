'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Button, type ButtonProps } from './Button.js';
import { Heading, type HeadingProps } from './Heading.js';
import { Text, type TextProps } from './Text.js';
import { usePartsRegistry } from '../hooks/usePartsRegistry.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import { useFocus } from '../hooks/useFocus.js';
import { useDismissible } from '../hooks/useDismissible.js';

export type DialogPart = 'title' | 'description' | 'content';

export interface DialogContextValue {
  id: string;
  open: boolean;
  onOpenToggle: () => void;
  setOpen: (open: boolean) => void;
  close: () => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  titleId: string;
  descriptionId: string;
  contentId: string;
  registerPart: (part: DialogPart, id: string) => () => void;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialogContext = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogContext must be used within a Dialog.Root');
  }
  return context;
};

export const useDialog = useDialogContext;

/* -------------------------------------------------------------------------------------------------
 * DialogRoot
 * -----------------------------------------------------------------------------------------------*/

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  id?: string;
}

export function DialogRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  id: providedId,
  children,
}: DialogProps): React.JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const generatedId = useId();
  const id = providedId || generatedId;
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const { registerPart, parts } = usePartsRegistry<DialogPart>();

  const titleId = parts.title || `${id}-title`;
  const descriptionId = parts.description || `${id}-desc`;
  const contentId = parts.content || `${id}-content`;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onOpenToggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      id,
      open,
      onOpenToggle,
      setOpen,
      close,
      dialogRef,
      titleId,
      descriptionId,
      contentId,
      registerPart,
    }),
    [id, open, onOpenToggle, setOpen, close, titleId, descriptionId, contentId, registerPart],
  );

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * DialogTrigger
 * -----------------------------------------------------------------------------------------------*/

export type DialogTriggerProps = ButtonProps;

export function DialogTrigger({
  id: providedId,
  children,
  onClick,
  ref,
  'aria-controls': ariaControls,
  ...props
}: DialogTriggerProps): React.JSX.Element {
  const { onOpenToggle, contentId } = useDialogContext();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        onOpenToggle();
      }
    },
    [onClick, onOpenToggle],
  );

  return (
    <Button
      ref={ref}
      id={providedId}
      type="button"
      aria-haspopup="dialog"
      aria-controls={ariaControls || contentId}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogContent
 * -----------------------------------------------------------------------------------------------*/

export const dialogRecipe = recipe(
  {
    base: {
      margin: 'auto',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      borderRadius: vars.radius.xl,
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.surface.fg,
      boxShadow: vars.shadow['2'],
      padding: vars.spacing.xl,
      boxSizing: 'border-box',
      outline: 'none',
      maxHeight: 'calc(100vh - 4rem)',
      overflowY: 'auto',
      selectors: {
        '&::backdrop': {
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    variants: {
      size: {
        sm: { width: 'min(90vw, 400px)' },
        md: { width: 'min(90vw, 560px)' },
        lg: { width: 'min(90vw, 720px)' },
        xl: { width: 'min(90vw, 900px)' },
        full: { width: 'calc(100vw - 2rem)', height: 'calc(100vh - 2rem)', maxHeight: 'none' },
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
  'dialog-content',
);

export type DialogVariants = RecipeVariants<typeof dialogRecipe>;

export interface DialogContentProps extends ElementProps<HTMLDialogElement> {
  size?: DialogVariants['size'];
  children?: ReactNode;
}

export function DialogContent({
  id: providedId,
  size = 'md',
  className,
  children,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ref,
  ...props
}: DialogContentProps): React.JSX.Element {
  const { open, setOpen, dialogRef, titleId, descriptionId, contentId, registerPart } =
    useDialogContext();
  const id = providedId || contentId;

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const dismissibleRef = useDismissible<HTMLDialogElement>({
    onDismiss: handleClose,
    dismissOnClickOutside: true,
  });

  const focusRef = useFocus<HTMLDialogElement>({
    type: 'modality',
    trap: true,
    focusOnMount: true,
    restoreFocusOnUnmount: true,
  });

  useEffect(() => {
    if (providedId) {
      return registerPart('content', providedId);
    }
  }, [providedId, registerPart]);

  // Handle native HTML5 showModal / close lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open, dialogRef]);

  const classes = dialogRecipe({ size });
  const mergedRef = useMergeRefs(dialogRef, focusRef, dismissibleRef, ref);

  return (
    /* oxlint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <dialog
      ref={mergedRef}
      id={id}
      closedby="any"
      aria-labelledby={ariaLabelledby || titleId}
      aria-describedby={ariaDescribedby || descriptionId}
      // onCancel={handleCancel}
      onClose={handleClose}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </dialog>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogHeader
 * -----------------------------------------------------------------------------------------------*/

const dialogHeaderStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xs'],
  marginBottom: vars.spacing.md,
});

export function DialogHeader({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLDivElement>): React.JSX.Element {
  return (
    <div ref={ref} className={cx(dialogHeaderStyle, className)} {...props}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogTitle
 * -----------------------------------------------------------------------------------------------*/

export function DialogTitle({
  id: providedId,
  className,
  children,
  size = 'xl',
  as = 'h2',
  ...props
}: HeadingProps): React.JSX.Element {
  const { titleId, registerPart } = useDialogContext();
  const id = providedId || titleId;

  useEffect(() => {
    if (providedId) {
      return registerPart('title', providedId);
    }
  }, [providedId, registerPart]);

  return (
    <Heading id={id} as={as} size={size} className={className} {...props}>
      {children}
    </Heading>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogDescription
 * -----------------------------------------------------------------------------------------------*/

export function DialogDescription({
  id: providedId,
  className,
  children,
  color = 'muted',
  ...props
}: TextProps): React.JSX.Element {
  const { descriptionId, registerPart } = useDialogContext();
  const id = providedId || descriptionId;

  useEffect(() => {
    if (providedId) {
      return registerPart('description', providedId);
    }
  }, [providedId, registerPart]);

  return (
    <Text id={id} color={color} className={className} {...props}>
      {children}
    </Text>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogClose
 * -----------------------------------------------------------------------------------------------*/

export function DialogClose({
  onClick,
  children,
  variant = 'secondary',
  ...props
}: ButtonProps): React.JSX.Element {
  const { close } = useDialogContext();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        close();
      }
    },
    [close, onClick],
  );

  return (
    <Button type="button" variant={variant} onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}

DialogRoot.displayName = 'Dialog.Root';
DialogTrigger.displayName = 'Dialog.Trigger';
DialogContent.displayName = 'Dialog.Content';
DialogHeader.displayName = 'Dialog.Header';
DialogTitle.displayName = 'Dialog.Title';
DialogDescription.displayName = 'Dialog.Description';
DialogClose.displayName = 'Dialog.Close';

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});
