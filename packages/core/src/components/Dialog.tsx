'use client';

import {
  createThemeContract,
  recipe,
  style,
  cx,
  type RecipeFunction,
  type RecipeVariants,
  type StyleRule,
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
import { paddingStyles } from '../layout.js';
import { discreteBackdrop, discreteFadeScale, discreteSlide } from '../transitions.js';
import { Button, type ButtonProps } from './Button.js';
import { Flow } from './Flow.js';
import { Heading, type HeadingProps } from './Heading.js';
import { HStack, VStack, type StackProps, type StackVariants } from './Stack.js';
import { getSurfaceClasses, surfaceRecipe, type SurfaceVariants } from './Surface.js';
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

const dialogContract = createThemeContract(
  {
    duration: null,
  },
  'dialog',
);

export type DialogPlacement = 'center' | 'bottom' | 'right' | 'left';
type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const dialogRecipe: RecipeFunction<{
  placement: Record<DialogPlacement, StyleRule>;
  size: Record<DialogSize, StyleRule>;
  bordered: Record<'true' | 'false', StyleRule>;
  radius: Record<'default' | NonNullable<SurfaceVariants['radius']>, StyleRule>;
}> = recipe(
  {
    layer: 'components',
    base: [
      discreteBackdrop({ duration: dialogContract.duration }),
      {
        ...dialogContract.$set({
          duration: vars.duration.normal,
        }),
        borderStyle: 'solid',
        borderColor: vars.surface.border,
        backgroundColor: vars.surface.bg.DEFAULT,
        color: vars.surface.fg,
        boxShadow: vars.shadow['2'],
        padding: 0,
        boxSizing: 'border-box',
        outline: 'none',
        overflow: 'hidden',
        flexDirection: 'column',
        selectors: {
          '&[open]': {
            display: 'flex',
          },
          '&::backdrop': {
            backgroundColor: `color-mix(in oklch, ${vars.fg} 35%, transparent)`,
            backdropFilter: 'blur(4px)',
          },
        },
        '@media': {
          '(prefers-reduced-motion: reduce)': {
            ...dialogContract.$set({
              duration: '0ms',
            }),
          },
        },
      },
    ],
    variants: {
      placement: {
        center: {
          margin: 'auto',
          maxHeight: 'calc(100dvh - 4rem)',
          ...discreteFadeScale({
            openSelector: '&[open]',
            duration: dialogContract.duration,
            scale: 0.97,
          }),
        },
        bottom: {
          margin: 'auto auto 0 auto',
          maxWidth: '100%',
          maxHeight: '85dvh',
          paddingBottom: 'env(safe-area-inset-bottom)',
          ...discreteSlide({
            openSelector: '&[open]',
            from: 'bottom',
            duration: dialogContract.duration,
          }),
        },
        right: {
          margin: '0 0 0 auto',
          height: '100dvh',
          maxHeight: '100dvh',
          maxWidth: '100%',
          ...discreteSlide({
            openSelector: '&[open]',
            from: 'right',
            duration: dialogContract.duration,
          }),
        },
        left: {
          margin: '0 auto 0 0',
          height: '100dvh',
          maxHeight: '100dvh',
          maxWidth: '100%',
          ...discreteSlide({
            openSelector: '&[open]',
            from: 'left',
            duration: dialogContract.duration,
          }),
        },
      },
      size: {
        sm: {},
        md: {},
        lg: {},
        xl: {},
        full: {},
      },
      bordered: {
        true: {},
        false: {},
      },
      radius: {
        default: {},
        none: {},
        control: {},
        md: {},
        lg: {},
        xl: {},
        '2xl': {},
        full: {},
        auto: {},
      },
    },
    compoundVariants: [
      // Placement default borders (only when bordered)
      {
        variants: { placement: 'bottom', bordered: true },
        style: {
          borderTopWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 0,
          borderLeftWidth: 1,
        },
      },
      {
        variants: { placement: 'right', bordered: true },
        style: {
          borderTopWidth: 0,
          borderRightWidth: 0,
          borderBottomWidth: 0,
          borderLeftWidth: 1,
        },
      },
      {
        variants: { placement: 'left', bordered: true },
        style: {
          borderTopWidth: 0,
          borderRightWidth: 1,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
        },
      },
      // Placement default radii (only when consumer has not set radius)
      {
        variants: { placement: 'bottom', radius: 'default' },
        style: {
          borderTopLeftRadius: vars.radius.xl,
          borderTopRightRadius: vars.radius.xl,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
      },
      {
        variants: { placement: 'right', radius: 'default' },
        style: { borderRadius: 0 },
      },
      {
        variants: { placement: 'left', radius: 'default' },
        style: { borderRadius: 0 },
      },
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
      bordered: true,
      radius: 'default',
    },
  },
  'dialog-content',
);

type DialogVariants = Pick<RecipeVariants<typeof dialogRecipe>, 'placement' | 'size'>;

/** Scroll container fitted inside the `<dialog>`. */
const dialogScrollRecipe = recipe(
  {
    layer: 'components',
    extend: [paddingStyles],
    base: {
      minHeight: 0,
      width: '100%',
      overflow: 'auto',
      boxSizing: 'border-box',
      overscrollBehavior: 'contain',
      scrollbarWidth: 'thin',
    },
    defaultVariants: {
      padding: 'xl',
    },
  },
  'dialog-scroll',
);

const DialogPlacementContext = createContext<DialogPlacement>('center');

interface DialogContentProps
  extends
    ElementProps<HTMLDialogElement>,
    Omit<SurfaceVariants, 'padding'>,
    Omit<StackVariants, 'width'> {
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
  /**
   * Padding applied to the inner scrollable content container.
   * @default 'xl'
   */
  padding?: SurfaceVariants['padding'];
  /**
   * Additional class name applied to the inner scrollable content container.
   */
  contentClassName?: string;
  children?: ReactNode;
}

function DialogContent({
  id: providedId,
  size = 'md',
  placement = 'center',
  level,
  variant,
  bordered,
  radius,
  overflow,
  padding = 'xl',
  direction,
  gap = 'md',
  align,
  justify,
  wrap,
  inline,
  flex = 'auto',
  className,
  contentClassName,
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
    open,
    // these are handled by showModal/close
    focusOnMount: false,
    restoreFocusOnUnmount: false,
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

  const classes = dialogRecipe({
    placement,
    size,
    bordered,
    radius: radius ?? 'default',
  });

  const surfaceClasses = surfaceRecipe({
    level,
    variant,
    bordered,
    radius,
    overflow,
  });

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
      className={cx(classes, getSurfaceClasses({ level, variant }), surfaceClasses, className)}
      {...props}
    >
      <VStack
        direction={direction}
        gap={gap}
        align={align}
        justify={justify}
        wrap={wrap}
        inline={inline}
        flex={flex}
        className={cx(dialogScrollRecipe({ padding }), contentClassName)}
      >
        <DialogPlacementContext.Provider value={placement}>
          {children}
        </DialogPlacementContext.Provider>
      </VStack>
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
    marginTop: `calc(var(--parent-padding, ${vars.spacing.xl}) * -1)`,
    marginInline: `calc(var(--parent-padding, ${vars.spacing.xl}) * -1)`,
    paddingTop: vars.spacing.md,
    paddingBottom: vars.spacing.lg,
    paddingInline: vars.spacing.xl,
    ':active': {
      cursor: 'grabbing',
    },
  },
  { prefix: 'dialog-handle', layer: 'components' },
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
  { prefix: 'dialog-handle-bar', layer: 'components' },
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
  { prefix: 'dialog-header', layer: 'components' },
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
  { prefix: 'dialog-body', layer: 'components' },
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
  { prefix: 'dialog-footer', layer: 'components' },
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
