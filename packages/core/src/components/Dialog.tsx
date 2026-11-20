'use client';

import {
  createThemeContract,
  keyframes,
  recipe,
  style,
  cx,
  type RecipeVariants,
} from '@cumulo/css';
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

import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { useDismissible } from '../hooks/useDismissible.js';
import { useFocus } from '../hooks/useFocus.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import { usePartsRegistry } from '../hooks/usePartsRegistry.js';
import { useSwipeDismiss, type SwipeDirection } from '../hooks/useSwipeDismiss.js';
import { Button, type ButtonProps } from './Button.js';
import { Flow } from './Flow.js';
import { Heading, type HeadingProps } from './Heading.js';
import { HStack, type StackProps } from './Stack.js';
import { Text, type TextProps } from './Text.js';

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
  getPartId: (part: DialogPart) => string | undefined;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a Dialog.Root');
  }
  return context;
};

/* -------------------------------------------------------------------------------------------------
 * DialogRoot
 * -----------------------------------------------------------------------------------------------*/

interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  id?: string;
}

function DialogRoot({
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
  const { registerPart, getPartId, parts } = usePartsRegistry<DialogPart>();

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

  const contextValue = useMemo(
    (): DialogContextValue => ({
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
      getPartId,
    }),
    [
      id,
      open,
      onOpenToggle,
      setOpen,
      close,
      titleId,
      descriptionId,
      contentId,
      registerPart,
      getPartId,
    ],
  );

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * DialogTrigger
 * -----------------------------------------------------------------------------------------------*/

type DialogTriggerProps = ButtonProps;

function DialogTrigger({
  id: providedId,
  children,
  onClick,
  ref,
  'aria-controls': ariaControls,
  ...props
}: DialogTriggerProps): React.JSX.Element {
  const { onOpenToggle, contentId } = useDialog();

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

const dialogFadeIn = keyframes(
  {
    from: { opacity: 0, transform: 'scale(0.97)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  'dialog-fade-in',
);

const dialogSlideFromBottom = keyframes(
  {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' },
  },
  'dialog-slide-bottom',
);

const dialogSlideFromRight = keyframes(
  {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' },
  },
  'dialog-slide-right',
);

const dialogSlideFromLeft = keyframes(
  {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
  },
  'dialog-slide-left',
);

const backdropFadeIn = keyframes(
  {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  'dialog-backdrop-fade-in',
);

const dialogContract = createThemeContract(
  {
    duration: null,
  },
  'dialog',
);

const dialogRecipe = recipe(
  {
    base: {
      ...dialogContract.$set({
        duration: vars.duration.normal,
      }),
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.surface.fg,
      boxShadow: vars.shadow['2'],
      padding: vars.spacing.xl,
      boxSizing: 'border-box',
      outline: 'none',
      overflowY: 'auto',
      gap: vars.spacing.md,
      selectors: {
        '&[open]': {
          display: 'flex',
          flexDirection: 'column',
        },
        '&::backdrop': {
          backgroundColor: `color-mix(in oklch, ${vars.fg} 35%, transparent)`,
          backdropFilter: 'blur(4px)',
        },
        '&[open]::backdrop': {
          animation: `${backdropFadeIn.name} ${dialogContract.duration} ${vars.ease.default}`,
        },
      },
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          ...dialogContract.$set({
            duration: '0ms',
          }),
          animation: 'none',
        },
      },
    },
    variants: {
      placement: {
        center: {
          margin: 'auto',
          borderWidth: 1,
          borderRadius: vars.radius.xl,
          maxHeight: 'calc(100dvh - 4rem)',
          animation: `${dialogFadeIn.name} ${dialogContract.duration} ${vars.ease.default}`,
        },
        bottom: {
          margin: 'auto auto 0 auto',
          maxWidth: '100%',
          maxHeight: '85dvh',
          borderTopWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 0,
          borderLeftWidth: 1,
          borderTopLeftRadius: vars.radius.xl,
          borderTopRightRadius: vars.radius.xl,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingBottom: `max(${vars.spacing.xl}, env(safe-area-inset-bottom))`,
          animation: `${dialogSlideFromBottom.name} ${dialogContract.duration} ${vars.ease.default}`,
        },
        right: {
          margin: '0 0 0 auto',
          height: '100dvh',
          maxHeight: '100dvh',
          maxWidth: '100%',
          borderTopWidth: 0,
          borderRightWidth: 0,
          borderBottomWidth: 0,
          borderLeftWidth: 1,
          borderRadius: 0,
          animation: `${dialogSlideFromRight.name} ${dialogContract.duration} ${vars.ease.default}`,
        },
        left: {
          margin: '0 auto 0 0',
          height: '100dvh',
          maxHeight: '100dvh',
          maxWidth: '100%',
          borderTopWidth: 0,
          borderRightWidth: 1,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
          borderRadius: 0,
          animation: `${dialogSlideFromLeft.name} ${dialogContract.duration} ${vars.ease.default}`,
        },
      },
      size: {
        sm: {},
        md: {},
        lg: {},
        xl: {},
        full: {},
      },
    },
    compoundVariants: [
      // Center modal sizes
      { variants: { placement: 'center', size: 'sm' }, style: { width: 'min(90vw, 400px)' } },
      { variants: { placement: 'center', size: 'md' }, style: { width: 'min(90vw, 560px)' } },
      { variants: { placement: 'center', size: 'lg' }, style: { width: 'min(90vw, 720px)' } },
      { variants: { placement: 'center', size: 'xl' }, style: { width: 'min(90vw, 900px)' } },
      {
        variants: { placement: 'center', size: 'full' },
        style: { width: 'calc(100% - 2rem)', height: 'calc(100dvh - 2rem)', maxHeight: 'none' },
      },
      // Bottom sheet sizes (centered realistic widths; 100% on narrow mobile viewports)
      { variants: { placement: 'bottom', size: 'sm' }, style: { width: 'min(100%, 400px)' } },
      { variants: { placement: 'bottom', size: 'md' }, style: { width: 'min(100%, 560px)' } },
      { variants: { placement: 'bottom', size: 'lg' }, style: { width: 'min(100%, 720px)' } },
      { variants: { placement: 'bottom', size: 'xl' }, style: { width: 'min(100%, 900px)' } },
      {
        variants: { placement: 'bottom', size: 'full' },
        style: {
          width: '100%',
          height: '100dvh',
          maxHeight: '100dvh',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderWidth: 0,
        },
      },
      // Right side sheet sizes
      { variants: { placement: 'right', size: 'sm' }, style: { width: 'min(100%, 320px)' } },
      { variants: { placement: 'right', size: 'md' }, style: { width: 'min(100%, 440px)' } },
      { variants: { placement: 'right', size: 'lg' }, style: { width: 'min(100%, 640px)' } },
      { variants: { placement: 'right', size: 'xl' }, style: { width: 'min(100%, 800px)' } },
      {
        variants: { placement: 'right', size: 'full' },
        style: { width: '100%', borderLeftWidth: 0 },
      },
      // Left side sheet sizes
      { variants: { placement: 'left', size: 'sm' }, style: { width: 'min(100%, 320px)' } },
      { variants: { placement: 'left', size: 'md' }, style: { width: 'min(100%, 440px)' } },
      { variants: { placement: 'left', size: 'lg' }, style: { width: 'min(100%, 640px)' } },
      { variants: { placement: 'left', size: 'xl' }, style: { width: 'min(100%, 800px)' } },
      {
        variants: { placement: 'left', size: 'full' },
        style: { width: '100%', borderRightWidth: 0 },
      },
    ],
    defaultVariants: {
      placement: 'center',
      size: 'md',
    },
  },
  'dialog-content',
);

type DialogVariants = RecipeVariants<typeof dialogRecipe>;
export type DialogPlacement = NonNullable<DialogVariants['placement']>;

const DialogPlacementContext = createContext<DialogPlacement>('center');

interface DialogContentProps extends ElementProps<HTMLDialogElement> {
  /**
   * Controls the width of the dialog across all placements (or full viewport when `'full'`).
   * @default 'md'
   */
  size?: DialogVariants['size'];
  /**
   * Where the dialog is anchored within the viewport.
   * Use `'bottom'` for a bottom sheet or `'left'` / `'right'` for a side sheet (drawer).
   * @default 'center'
   */
  placement?: DialogPlacement;
  children?: ReactNode;
}

function DialogContent({
  id: providedId,
  size = 'md',
  placement = 'center',
  className,
  children,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ref,
  ...props
}: DialogContentProps): React.JSX.Element {
  const { open, setOpen, dialogRef, contentId, registerPart, getPartId } = useDialog();
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
    return registerPart('content', id);
  }, [id, registerPart]);

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

  const classes = dialogRecipe({ placement, size });
  const mergedRef = useMergeRefs(dialogRef, focusRef, dismissibleRef, ref);
  const resolvedLabelledBy = ariaLabelledby || getPartId('title');
  const resolvedDescribedBy = ariaDescribedby || getPartId('description');

  return (
    /* oxlint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <dialog
      ref={mergedRef}
      id={id}
      closedby="any"
      data-placement={placement}
      data-state={open ? 'open' : 'closed'}
      aria-labelledby={resolvedLabelledBy}
      aria-describedby={resolvedDescribedBy}
      onClose={handleClose}
      className={cx(classes, className)}
      {...props}
    >
      <DialogPlacementContext.Provider value={placement}>
        {children}
      </DialogPlacementContext.Provider>
    </dialog>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogHandle
 * -----------------------------------------------------------------------------------------------*/

const dialogHandleStyles = style(
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'stretch',
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'grab',
    // Extend hit area flush to the top and side edges of the dialog padding box for touch devices
    marginTop: `calc(${vars.spacing.xl} * -1)`,
    marginInline: `calc(${vars.spacing.xl} * -1)`,
    paddingTop: vars.spacing.md,
    paddingBottom: vars.spacing.lg,
    paddingInline: vars.spacing.xl,
    ':active': {
      cursor: 'grabbing',
    },
  },
  'dialog-handle',
);

const dialogHandleBarStyles = style(
  {
    width: '2.5rem',
    height: '0.25rem',
    borderRadius: vars.radius.full,
    backgroundColor: vars.surface.border,
    transition: `background-color ${vars.duration.fast} ${vars.ease.default}`,
    selectors: {
      '[data-dragging="true"] &': {
        backgroundColor: vars.subtle,
      },
    },
  },
  'dialog-handle-bar',
);

interface DialogHandleProps extends ElementProps<HTMLDivElement> {
  /**
   * Overrides the inferred swipe direction for dismissing the sheet.
   * By default, `'bottom'` swipes `'down'`, `'left'` swipes `'left'`, and `'right'` swipes `'right'`.
   */
  direction?: SwipeDirection;
  /**
   * Distance in pixels required to dismiss the sheet on release.
   * @default 80
   */
  threshold?: number;
  /**
   * Disables swipe-to-dismiss interaction on the handle.
   * @default false
   */
  disabled?: boolean;
  children?: ReactNode;
}

function getDefaultSwipeDirection(placement: DialogPlacement): SwipeDirection | null {
  switch (placement) {
    case 'bottom':
      return 'down';
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    case 'center':
      return null;
  }
}

function DialogHandle({
  direction: providedDirection,
  threshold,
  disabled = false,
  className,
  children,
  ref,
  ...props
}: DialogHandleProps): React.JSX.Element {
  const { open, close, dialogRef } = useDialog();
  const placement = useContext(DialogPlacementContext);
  const inferredDirection = getDefaultSwipeDirection(placement);
  const resolvedDirection = providedDirection ?? inferredDirection ?? 'down';
  const isDisabled = !open || disabled || (!providedDirection && inferredDirection === null);

  const { ref: swipeRef, isDragging } = useSwipeDismiss({
    direction: resolvedDirection,
    targetRef: dialogRef,
    onDismiss: close,
    threshold,
    disabled: isDisabled,
  });

  const mergedRef = useMergeRefs(swipeRef, ref);

  return (
    <div
      ref={mergedRef}
      data-dragging={isDragging ? 'true' : undefined}
      data-swipe-direction={resolvedDirection}
      className={cx(dialogHandleStyles, className)}
      {...props}
    >
      {children ?? <div aria-hidden="true" className={dialogHandleBarStyles.className} />}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogHeader
 * -----------------------------------------------------------------------------------------------*/

const dialogHeaderStyles = style(
  {
    flexShrink: 0,
  },
  'dialog-header',
);

function DialogHeader({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLDivElement>): React.JSX.Element {
  return (
    <Flow ref={ref} className={cx(dialogHeaderStyles, className)} {...props}>
      {children}
    </Flow>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogBody
 * -----------------------------------------------------------------------------------------------*/

const dialogBodyStyles = style(
  {
    flex: '1 1 auto',
  },
  'dialog-body',
);

function DialogBody({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLDivElement>): React.JSX.Element {
  return (
    <Flow ref={ref} className={cx(dialogBodyStyles, className)} {...props}>
      {children}
    </Flow>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogFooter
 * -----------------------------------------------------------------------------------------------*/

const dialogFooterStyles = style(
  {
    flexShrink: 0,
  },
  'dialog-footer',
);

function DialogFooter({
  gap = 'xs',
  justify = 'end',
  align = 'center',
  className,
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  return (
    <HStack
      ref={ref}
      gap={gap}
      justify={justify}
      align={align}
      className={cx(dialogFooterStyles, className)}
      {...props}
    >
      {children}
    </HStack>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogTitle
 * -----------------------------------------------------------------------------------------------*/

function DialogTitle({
  id: providedId,
  className,
  children,
  size = 'xl',
  as = 'h2',
  ...props
}: HeadingProps): React.JSX.Element {
  const { titleId, registerPart } = useDialog();
  const id = providedId || titleId;

  useEffect(() => {
    return registerPart('title', id);
  }, [id, registerPart]);

  return (
    <Heading id={id} as={as} size={size} className={className} {...props}>
      {children}
    </Heading>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogDescription
 * -----------------------------------------------------------------------------------------------*/

function DialogDescription({
  id: providedId,
  className,
  children,
  color = 'default',
  ...props
}: TextProps): React.JSX.Element {
  const { descriptionId, registerPart } = useDialog();
  const id = providedId || descriptionId;

  useEffect(() => {
    return registerPart('description', id);
  }, [id, registerPart]);

  return (
    <Text id={id} color={color} className={className} {...props}>
      {children}
    </Text>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogClose
 * -----------------------------------------------------------------------------------------------*/

function DialogClose({
  onClick,
  children,
  variant = 'secondary',
  ...props
}: ButtonProps): React.JSX.Element {
  const { close } = useDialog();

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
DialogHandle.displayName = 'Dialog.Handle';
DialogHeader.displayName = 'Dialog.Header';
DialogBody.displayName = 'Dialog.Body';
DialogFooter.displayName = 'Dialog.Footer';
DialogTitle.displayName = 'Dialog.Title';
DialogDescription.displayName = 'Dialog.Description';
DialogClose.displayName = 'Dialog.Close';

type DialogHeaderProps = ElementProps<HTMLDivElement>;
type DialogBodyProps = ElementProps<HTMLDivElement>;
type DialogFooterProps = StackProps;
type DialogTitleProps = HeadingProps;
type DialogDescriptionProps = TextProps;
type DialogCloseProps = ButtonProps;

export {
  DialogRoot as Root,
  DialogTrigger as Trigger,
  DialogContent as Content,
  DialogHandle as Handle,
  DialogHeader as Header,
  DialogBody as Body,
  DialogFooter as Footer,
  DialogTitle as Title,
  DialogDescription as Description,
  DialogClose as Close,
};

export type {
  DialogProps as RootProps,
  DialogTriggerProps as TriggerProps,
  DialogContentProps as ContentProps,
  DialogHandleProps as HandleProps,
  DialogHeaderProps as HeaderProps,
  DialogBodyProps as BodyProps,
  DialogFooterProps as FooterProps,
  DialogTitleProps as TitleProps,
  DialogDescriptionProps as DescriptionProps,
  DialogCloseProps as CloseProps,
  DialogVariants as ContentVariants,
};
