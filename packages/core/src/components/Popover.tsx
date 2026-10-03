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
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Button, type ButtonProps } from './Button.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import { useFocus } from '../hooks/useFocus.js';
import { useDismissible } from '../hooks/useDismissible.js';

export interface PopoverContextValue {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  close: () => void;
  popoverRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export const usePopoverContext = (): PopoverContextValue => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopoverContext must be used within a Popover.Root');
  }
  return context;
};

export const usePopover = usePopoverContext;

/* -------------------------------------------------------------------------------------------------
 * PopoverRoot
 * -----------------------------------------------------------------------------------------------*/

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Delay in milliseconds before opening when triggered by hover or focus.
   * @default 0
   */
  delay?: number;
  children?: ReactNode;
  id?: string;
}

export function PopoverRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delay = 0,
  id: providedId,
  children,
}: PopoverProps): React.JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const generatedId = useId();
  const id = providedId || generatedId;
  const popoverRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      clearTimer();
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [clearTimer, isControlled, onOpenChange],
  );

  const show = useCallback(() => {
    clearTimer();
    if (delay > 0) {
      timerRef.current = setTimeout(() => {
        if (!isControlled) {
          setUncontrolledOpen(true);
        }
        onOpenChange?.(true);
      }, delay);
    } else {
      if (!isControlled) {
        setUncontrolledOpen(true);
      }
      onOpenChange?.(true);
    }
  }, [clearTimer, delay, isControlled, onOpenChange]);

  const hide = useCallback(() => {
    clearTimer();
    if (!isControlled) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  }, [clearTimer, isControlled, onOpenChange]);

  const close = useCallback(() => {
    hide();
  }, [hide]);

  const toggle = useCallback(() => {
    clearTimer();
    setOpen(!open);
  }, [clearTimer, open, setOpen]);

  const contextValue = useMemo(
    (): PopoverContextValue => ({
      id,
      open,
      setOpen,
      show,
      hide,
      toggle,
      close,
      popoverRef,
      triggerRef,
    }),
    [id, open, setOpen, show, hide, toggle, close],
  );

  return <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * PopoverTrigger
 * -----------------------------------------------------------------------------------------------*/

export interface PopoverTriggerProps extends ElementProps<HTMLElement> {
  as?: React.ElementType;
  trigger?: 'click' | 'hover';
  variant?: ButtonProps['variant'];
  intent?: ButtonProps['intent'];
  size?: ButtonProps['size'];
  shape?: ButtonProps['shape'];
  width?: ButtonProps['width'];
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup'];
  href?: string;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function PopoverTrigger({
  as: Component = Button,
  trigger = 'click',
  children,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  style,
  ref,
  'aria-haspopup': ariaHasPopupProp,
  'aria-describedby': ariaDescribedByProp,
  ...props
}: PopoverTriggerProps): React.JSX.Element {
  const { id, open, close, toggle, show, hide, popoverRef, triggerRef } = usePopoverContext();

  const anchorName = useMemo(() => `--popover-${id}`, [id]);
  const anchorStyle = useMemo(
    (): React.CSSProperties => ({
      // Link the trigger element to the CSS Anchor Positioning engine
      anchorName,
      ...style,
    }),
    [anchorName, style],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onClick?.(event as MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;

      if (trigger === 'hover') return;

      const el = popoverRef.current;
      // In synthetic environments (like JSDOM / Vitest) where button popoverTarget is not dispatched by browser engine
      if (el && typeof el.togglePopover === 'function') {
        const button = event.currentTarget;
        if (!('popoverTargetElement' in button) && !('popoverTargetAction' in button)) {
          try {
            (el as HTMLElement & { togglePopover: () => void }).togglePopover();
          } catch {
            toggle();
          }
        }
      } else {
        toggle();
      }
    },
    [onClick, popoverRef, toggle, trigger],
  );

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      onPointerEnter?.(event);
      if (trigger === 'hover' && !event.defaultPrevented) {
        show();
      }
    },
    [onPointerEnter, show, trigger],
  );

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      onPointerLeave?.(event);
      if (trigger === 'hover' && !event.defaultPrevented) {
        hide();
      }
    },
    [onPointerLeave, hide, trigger],
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      onFocus?.(event);
      if (trigger === 'hover' && !event.defaultPrevented) {
        show();
      }
    },
    [onFocus, show, trigger],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      onBlur?.(event);
      if (trigger === 'hover' && !event.defaultPrevented) {
        hide();
      }
    },
    [onBlur, hide, trigger],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event as React.KeyboardEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;

      if (event.key === 'Escape' && open) {
        close();
        return;
      }

      // If popover is open and user tabs backwards from the trigger, dismiss the popover
      if (open && event.key === 'Tab' && event.shiftKey) {
        close();
        const el = popoverRef.current;
        if (
          el &&
          typeof (el as HTMLElement & { hidePopover?: () => void }).hidePopover === 'function'
        ) {
          try {
            (el as HTMLElement & { hidePopover: () => void }).hidePopover();
          } catch {
            // Ignore
          }
        }
      }
    },
    [close, onKeyDown, open, popoverRef],
  );

  const mergedRef = useMergeRefs(triggerRef, ref);

  const ariaHasPopup =
    ariaHasPopupProp !== undefined ? ariaHasPopupProp : trigger === 'hover' ? undefined : 'dialog';

  const ariaDescribedBy = ariaDescribedByProp
    ? trigger === 'hover'
      ? `${ariaDescribedByProp} ${id}`
      : ariaDescribedByProp
    : trigger === 'hover'
      ? id
      : undefined;

  if (Component === Button) {
    return (
      <Button
        ref={mergedRef}
        type="button"
        popoverTarget={trigger === 'click' ? id : undefined}
        popoverTargetAction={trigger === 'click' ? 'toggle' : undefined}
        aria-haspopup={ariaHasPopup}
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={ariaDescribedBy}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={anchorStyle}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return React.createElement(
    Component,
    {
      ref: mergedRef,
      popoverTarget: trigger === 'click' ? id : undefined,
      popoverTargetAction: trigger === 'click' ? 'toggle' : undefined,
      'aria-haspopup': ariaHasPopup,
      'aria-expanded': open,
      'aria-controls': id,
      'aria-describedby': ariaDescribedBy,
      onClick: handleClick,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      style: anchorStyle,
      ...props,
    },
    children,
  );
}

/* -------------------------------------------------------------------------------------------------
 * PopoverContent
 * -----------------------------------------------------------------------------------------------*/

export const popoverRecipe = recipe(
  {
    base: {
      position: 'fixed',
      positionArea: 'bottom span-right',
      positionTryFallbacks: 'flip-block, flip-inline, flip-block flip-inline',
      margin: 0,
      inset: 'auto',
      boxSizing: 'border-box',
      outline: 'none',
      selectors: {
        '&::backdrop': {
          backgroundColor: 'transparent',
        },
      },
      '@supports': {
        'not (position-anchor: --a)': {
          inset: 0,
          margin: 'auto',
        },
      },
    },
    variants: {
      variant: {
        popover: {
          width: 'fit-content',
          height: 'fit-content',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
          borderRadius: vars.radius.lg,
          backgroundColor: vars.surface.bg.DEFAULT,
          color: vars.surface.fg,
          boxShadow: vars.shadow['2'],
          padding: vars.spacing.md,
          zIndex: 50,
          maxWidth: 'min(90vw, 360px)',
        },
        tooltip: {
          width: 'max-content',
          height: 'fit-content',
          borderWidth: 0,
          borderStyle: 'none',
          borderRadius: vars.radius.md,
          backgroundColor: vars.surface.fg,
          color: vars.surface.bg.DEFAULT,
          boxShadow: vars.shadow['2'],
          padding: `${vars.spacing['2xs']} ${vars.spacing.xs}`,
          fontSize: vars.font.size.xs,
          fontWeight: vars.font.weight.medium,
          fontFamily: vars.font.sans,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          maxWidth: 'max-content',
          zIndex: 1000,
          transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
        },
      },
      placement: {
        bottom: {
          positionArea: 'bottom center',
          marginBlockStart: vars.spacing.xs,
          marginBlockEnd: 0,
          marginInlineStart: 0,
          marginInlineEnd: 0,
        },
        'bottom-start': {
          positionArea: 'bottom span-right',
          marginBlockStart: vars.spacing.xs,
          marginBlockEnd: 0,
          marginInlineStart: 0,
          marginInlineEnd: 0,
        },
        'bottom-end': {
          positionArea: 'bottom span-left',
          marginBlockStart: vars.spacing.xs,
          marginBlockEnd: 0,
          marginInlineStart: 0,
          marginInlineEnd: 0,
        },
        top: {
          positionArea: 'top center',
          marginBlockStart: 0,
          marginBlockEnd: vars.spacing.xs,
          marginInlineStart: 0,
          marginInlineEnd: 0,
        },
        'top-start': {
          positionArea: 'top span-right',
          marginBlockStart: 0,
          marginBlockEnd: vars.spacing.xs,
          marginInlineStart: 0,
          marginInlineEnd: 0,
        },
        'top-end': {
          positionArea: 'top span-left',
          marginBlockStart: 0,
          marginBlockEnd: vars.spacing.xs,
          marginInlineStart: 0,
          marginInlineEnd: 0,
        },
        left: {
          positionArea: 'left center',
          marginBlockStart: 0,
          marginBlockEnd: 0,
          marginInlineStart: 0,
          marginInlineEnd: vars.spacing.xs,
        },
        right: {
          positionArea: 'right center',
          marginBlockStart: 0,
          marginBlockEnd: 0,
          marginInlineStart: vars.spacing.xs,
          marginInlineEnd: 0,
        },
      },
      size: {
        sm: { width: 'min(90vw, 240px)', padding: vars.spacing.sm },
        md: { width: 'min(90vw, 320px)', padding: vars.spacing.md },
        lg: { width: 'min(90vw, 420px)', padding: vars.spacing.lg },
      },
    },
    defaultVariants: {
      variant: 'popover',
      placement: 'bottom-start',
    },
  },
  'popover-content',
);

export type PopoverVariants = RecipeVariants<typeof popoverRecipe>;

export type PopoverContentProps = Omit<ElementProps<HTMLDivElement>, 'role' | 'popover'> & {
  placement?: PopoverVariants['placement'];
  children?: ReactNode;
} & (PopoverDialogOptions | PopoverTooltipOptions);

export interface PopoverDialogOptions {
  /**
   * The variant styling of the popover content.
   * @default 'popover'
   */
  variant?: 'popover';
  /**
   * Width and padding size presets for the popover dialog.
   * Tooltip variant does not accept size presets.
   * @default 'md'
   */
  size?: PopoverVariants['size'];
  /**
   * The native HTML popover attribute value.
   * In dialog mode, defaults to 'auto' so clicking outside or pressing Escape dismisses the popover.
   * @default 'auto'
   */
  popover?: 'auto' | 'manual';
  /**
   * The ARIA role of the popover content.
   * @default 'dialog'
   */
  role?: 'dialog' | 'alertdialog';
  /**
   * Whether to loop focus inside the popover.
   * If false (default), the popover will close when tabbing out of its contents.
   * @default false
   */
  loopFocus?: boolean;
  /**
   * Whether the popover should automatically close when focus moves outside via Tab navigation.
   * @default true
   */
  closeOnTabOut?: boolean;
}

export interface PopoverTooltipOptions {
  /**
   * Tooltip variant used by `<Tooltip>` under the hood.
   */
  variant: 'tooltip';
  size?: never;
  loopFocus?: never;
  closeOnTabOut?: never;
  popover?: never;
  role?: never;
}

export function PopoverContent({
  id: providedId,
  variant = 'popover',
  popover,
  placement = 'bottom-start',
  size = 'md',
  loopFocus = false,
  closeOnTabOut = true,
  role,
  className,
  style,
  children,
  onToggle,
  ref,
  ...props
}: PopoverContentProps): React.JSX.Element {
  const { id: rootId, open, close, setOpen, popoverRef, triggerRef } = usePopoverContext();
  const id = providedId || rootId;
  const isTooltip = variant === 'tooltip';

  const resolvedPopover = isTooltip ? 'manual' : (popover ?? 'auto');
  const resolvedRole = isTooltip ? 'tooltip' : (role ?? 'dialog');

  const anchorStyle = useMemo(
    (): React.CSSProperties => ({
      positionAnchor: `--popover-${rootId}`,
      ...style,
    }),
    [rootId, style],
  );

  // Sync native popover open/close state via native toggle event
  const handleToggle = useCallback(
    (e: React.ToggleEvent<HTMLDivElement>) => {
      onToggle?.(e);
      if (e.newState) {
        setOpen(e.newState === 'open');
      }
    },
    [onToggle, setOpen],
  );

  const handleTabOut = useCallback(() => {
    close();
    const el = popoverRef.current;
    if (
      el &&
      typeof (el as HTMLElement & { hidePopover?: () => void }).hidePopover === 'function'
    ) {
      try {
        (el as HTMLElement & { hidePopover: () => void }).hidePopover();
      } catch {
        // Ignore
      }
    }
  }, [close, popoverRef]);

  const focusRef = useFocus<HTMLDivElement>({
    type: 'modality',
    trap: !isTooltip && loopFocus,
    onTabOut: !isTooltip && closeOnTabOut ? handleTabOut : undefined,
    onEscape: close,
    focusOnMount: !isTooltip && loopFocus,
    restoreFocusOnUnmount: !isTooltip,
  });

  const dismissibleRef = useDismissible<HTMLDivElement>({
    onDismiss: () => {
      if (isTooltip) return;
      close();
      const el = popoverRef.current;
      if (
        el &&
        typeof (el as HTMLElement & { hidePopover?: () => void }).hidePopover === 'function'
      ) {
        try {
          (el as HTMLElement & { hidePopover: () => void }).hidePopover();
        } catch {
          // Ignore
        }
      }
    },
    dismissOnClickOutside: !isTooltip,
  });

  // Close popover if focus moves completely outside trigger and popover
  useEffect(() => {
    if (!open || !closeOnTabOut || loopFocus || isTooltip) return;

    const handleDocumentFocusIn = (event: FocusEvent) => {
      const popoverEl = popoverRef.current;
      const triggerEl = triggerRef.current;
      const target = event.target as Node | null;

      if (!target) return;

      const isInsidePopover = popoverEl?.contains(target);
      const isInsideTrigger = triggerEl?.contains(target);

      if (!isInsidePopover && !isInsideTrigger) {
        close();
        if (
          popoverEl &&
          typeof (popoverEl as HTMLElement & { hidePopover?: () => void }).hidePopover ===
            'function'
        ) {
          try {
            (popoverEl as HTMLElement & { hidePopover: () => void }).hidePopover();
          } catch {
            // Ignore
          }
        }
      }
    };

    document.addEventListener('focusin', handleDocumentFocusIn);
    return () => {
      document.removeEventListener('focusin', handleDocumentFocusIn);
    };
  }, [close, closeOnTabOut, isTooltip, loopFocus, open, popoverRef, triggerRef]);

  // Controlled open/close with native API if available
  useEffect(() => {
    const el = popoverRef.current;
    if (!el || !('showPopover' in el)) return;

    try {
      const popoverEl = el as HTMLElement & {
        showPopover: () => void;
        hidePopover: () => void;
        matches?: (selector: string) => boolean;
      };
      let isOpen = false;
      try {
        isOpen = popoverEl.matches?.(':popover-open') ?? false;
      } catch {
        isOpen = false;
      }

      if (open) {
        if (!isOpen) {
          popoverEl.showPopover();
        }
      } else {
        popoverEl.hidePopover();
      }
    } catch {
      // Ignore if element is not in document yet or transitions
    }
  }, [open, popoverRef]);

  const classes = popoverRecipe({ variant, placement, size: isTooltip ? undefined : size });
  const mergedRef = useMergeRefs(popoverRef, focusRef, dismissibleRef, ref);

  return (
    /* oxlint-disable jsx-a11y/no-static-element-interactions */
    <div
      ref={mergedRef}
      id={id}
      onToggle={handleToggle}
      data-state={open ? 'open' : 'closed'}
      {...props}
      role={resolvedRole}
      popover={resolvedPopover}
      className={cx(classes, className)}
      style={anchorStyle}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * PopoverClose
 * -----------------------------------------------------------------------------------------------*/

export interface PopoverCloseProps extends ButtonProps {
  /**
   * Accessible label for screen readers.
   * @default 'Close popover'
   */
  'aria-label'?: string;
}

export function PopoverClose({
  onClick,
  children = 'Close',
  variant = 'ghost',
  size = 'sm',
  'aria-label': ariaLabel = 'Close popover',
  ...props
}: PopoverCloseProps): React.JSX.Element {
  const { close, popoverRef, id } = usePopoverContext();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      const el = popoverRef.current;
      if (el && typeof el.hidePopover === 'function') {
        try {
          (el as HTMLElement & { hidePopover: () => void }).hidePopover();
        } catch {
          close();
        }
      } else {
        close();
      }
    },
    [close, onClick, popoverRef],
  );

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={ariaLabel}
      popoverTarget={id}
      popoverTargetAction="hide"
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}

PopoverRoot.displayName = 'Popover.Root';
PopoverTrigger.displayName = 'Popover.Trigger';
PopoverContent.displayName = 'Popover.Content';
PopoverClose.displayName = 'Popover.Close';

export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
});
