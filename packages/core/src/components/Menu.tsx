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
import { focusRing } from '../intents.js';
import { Button, type ButtonProps } from './Button.js';
import { Divider, type DividerProps } from './Divider.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import { useFocus } from '../hooks/useFocus.js';
import { useDismissible } from '../hooks/useDismissible.js';

function safeHidePopover(el: HTMLElement | null): boolean {
  if (el && 'hidePopover' in el && typeof el.hidePopover === 'function') {
    try {
      el.hidePopover();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function safeTogglePopover(el: HTMLElement | null): boolean {
  if (el && 'togglePopover' in el && typeof el.togglePopover === 'function') {
    try {
      el.togglePopover();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function safeShowPopover(el: HTMLElement | null): void {
  if (!el || !('showPopover' in el) || typeof el.showPopover !== 'function') return;
  try {
    let isOpen = false;
    try {
      isOpen = el.matches?.(':popover-open') ?? false;
    } catch {
      isOpen = false;
    }
    if (!isOpen) {
      el.showPopover();
    }
  } catch {
    // Ignore if element is not in document yet
  }
}

export interface MenuContextValue {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a Menu.Root');
  }
  return context;
};

/* -------------------------------------------------------------------------------------------------
 * MenuRoot
 * -----------------------------------------------------------------------------------------------*/

export interface MenuRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  children?: ReactNode;
}

function MenuRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  id: providedId,
  children,
}: MenuRootProps): React.JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const generatedId = useId();
  const id = providedId || generatedId;
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

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
    const wasFocusedInside = menuRef.current?.contains(document.activeElement);
    setOpen(false);
    safeHidePopover(menuRef.current);
    if (wasFocusedInside) {
      triggerRef.current?.focus();
    }
  }, [setOpen]);

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const contextValue = useMemo(
    (): MenuContextValue => ({
      id,
      open,
      setOpen,
      toggle,
      close,
      menuRef,
      triggerRef,
    }),
    [id, open, setOpen, toggle, close],
  );

  return <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * MenuTrigger
 * -----------------------------------------------------------------------------------------------*/

export type MenuTriggerProps = Omit<ButtonProps, 'aria-haspopup'>;

function MenuTrigger({
  children,
  onClick,
  onKeyDown,
  style: styleProp,
  ref,
  ...props
}: MenuTriggerProps): React.JSX.Element {
  const { id, open, setOpen, toggle, close, menuRef, triggerRef } = useMenu();
  const mergedRef = useMergeRefs(triggerRef, ref);

  const anchorStyle = useMemo(
    (): React.CSSProperties => ({
      anchorName: `--menu-${id}`,
      ...styleProp,
    }),
    [id, styleProp],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      const el = menuRef.current;
      // In synthetic environments (like JSDOM / Vitest) where button popoverTarget is not dispatched by browser engine
      if (el && 'togglePopover' in el && typeof el.togglePopover === 'function') {
        const button = event.currentTarget;
        if (!('popoverTargetElement' in button) && !('popoverTargetAction' in button)) {
          if (!safeTogglePopover(el)) {
            toggle();
          }
        }
      } else {
        toggle();
      }
    },
    [menuRef, onClick, toggle],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => {
          const items = menuRef.current?.querySelectorAll<HTMLElement>(
            '[role="menuitem"]:not([disabled])',
          );
          if (items && items.length > 0) {
            const targetItem = event.key === 'ArrowUp' ? items[items.length - 1] : items[0];
            targetItem?.focus();
          }
        });
      } else if (event.key === 'Escape' && open) {
        event.preventDefault();
        close();
      }
    },
    [close, menuRef, onKeyDown, open, setOpen],
  );

  return (
    <Button
      ref={mergedRef}
      type="button"
      popoverTarget={id}
      popoverTargetAction="toggle"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={anchorStyle}
      {...props}
    >
      {children}
    </Button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * MenuContent
 * -----------------------------------------------------------------------------------------------*/

export const menuContentRecipe = recipe(
  {
    base: {
      position: 'fixed',
      positionArea: 'block-end span-inline-end',
      positionTryFallbacks: 'flip-block, flip-inline',
      margin: 0,
      inset: 'auto',
      boxSizing: 'border-box',
      outline: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: '180px',
      maxWidth: 'min(90vw, 320px)',
      padding: vars.spacing['2xs'],
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      borderRadius: vars.radius.lg,
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.surface.fg,
      boxShadow: vars.shadow['2'],
      zIndex: 50,
      selectors: {
        '&:not(:popover-open):not([data-state="open"])': {
          display: 'none',
        },
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
      placement: {
        'bottom-start': {
          positionArea: 'block-end span-inline-end',
          marginBlockStart: vars.spacing['2xs'],
        },
        bottom: {
          positionArea: 'block-end center',
          marginBlockStart: vars.spacing['2xs'],
        },
        'bottom-end': {
          positionArea: 'block-end span-inline-start',
          marginBlockStart: vars.spacing['2xs'],
        },
        'top-start': {
          positionArea: 'block-start span-inline-end',
          marginBlockEnd: vars.spacing['2xs'],
        },
        top: {
          positionArea: 'block-start center',
          marginBlockEnd: vars.spacing['2xs'],
        },
        'top-end': {
          positionArea: 'block-start span-inline-start',
          marginBlockEnd: vars.spacing['2xs'],
        },
        left: {
          positionArea: 'inline-start center',
          marginInlineEnd: vars.spacing['2xs'],
        },
        right: {
          positionArea: 'inline-end center',
          marginInlineStart: vars.spacing['2xs'],
        },
      },
    },
    defaultVariants: {
      placement: 'bottom-start',
    },
  },
  'menu-content',
);

export type MenuContentVariants = RecipeVariants<typeof menuContentRecipe>;

export interface MenuContentProps extends Omit<ElementProps<HTMLDivElement>, 'role' | 'popover'> {
  placement?: MenuContentVariants['placement'];
  children?: ReactNode;
}

function MenuContent({
  id: providedId,
  placement = 'bottom-start',
  className,
  style: styleProp,
  onToggle,
  children,
  ref,
  ...props
}: MenuContentProps): React.JSX.Element {
  const { id: rootId, open, setOpen, close, menuRef, triggerRef } = useMenu();
  const id = providedId || rootId;

  const anchorStyle = useMemo(
    (): React.CSSProperties => ({
      positionAnchor: `--menu-${rootId}`,
      ...styleProp,
    }),
    [rootId, styleProp],
  );

  const handleToggle = useCallback(
    (e: React.ToggleEvent<HTMLDivElement>) => {
      onToggle?.(e);
      if (e.newState) {
        setOpen(e.newState === 'open');
      }
    },
    [onToggle, setOpen],
  );

  const focusRef = useFocus<HTMLDivElement>({
    type: 'navigation',
    navigation: 'vertical',
    itemSelector: '[role="menuitem"]:not([disabled])',
    rovingTabIndex: true,
    focusOnMount: true,
    restoreFocusOnUnmount: true,
    onEscape: close,
  });

  const ignoreRefs = useMemo(() => [triggerRef], [triggerRef]);

  const dismissibleRef = useDismissible<HTMLDivElement>({
    onDismiss: close,
    dismissOnClickOutside: true,
    ignoreRefs,
  });

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (open) {
      safeShowPopover(el);
      requestAnimationFrame(() => {
        if (!el.contains(document.activeElement)) {
          const firstItem = el.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
          firstItem?.focus();
        }
      });
    } else {
      safeHidePopover(el);
    }
  }, [open, menuRef]);

  const classes = menuContentRecipe({ placement });
  const mergedRef = useMergeRefs(menuRef, focusRef, dismissibleRef, ref);

  return (
    <div
      ref={mergedRef}
      id={id}
      role="menu"
      popover="auto"
      data-state={open ? 'open' : 'closed'}
      onToggle={handleToggle}
      style={anchorStyle}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * MenuItem
 * -----------------------------------------------------------------------------------------------*/

export const menuItemRecipe = recipe(
  {
    extend: [focusRing],
    base: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: vars.spacing.sm,
      width: '100%',
      minHeight: vars.size.sm,
      paddingInline: vars.spacing.xs,
      paddingBlock: vars.spacing['2xs'],
      borderRadius: vars.radius.md,
      border: 'none',
      backgroundColor: 'transparent',
      fontFamily: vars.font.sans,
      fontSize: vars.font.size.sm,
      fontWeight: vars.font.weight.normal,
      color: vars.surface.fg,
      textAlign: 'left',
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box',
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}`,
      ':hover': {
        backgroundColor: vars.surface.bg.next,
      },
      ':focus-visible': {
        backgroundColor: vars.surface.bg.next,
      },
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
    variants: {
      intent: {
        default: {},
        error: {
          color: vars.error.secondary.fg,
          ':hover': {
            backgroundColor: vars.error.secondary.bg.DEFAULT,
            color: vars.error.secondary.fg,
          },
          ':focus-visible': {
            backgroundColor: vars.error.secondary.bg.DEFAULT,
            color: vars.error.secondary.fg,
          },
        },
      },
    },
    defaultVariants: {
      intent: 'default',
    },
  },
  'menu-item',
);

const itemMainStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  minWidth: 0,
  flex: 1,
});

const itemIconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: vars.size['3xs'],
  height: vars.size['3xs'],
  color: 'currentColor',
});

const itemShortcutStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  marginLeft: 'auto',
  fontSize: vars.font.size.xs,
  color: vars.surface.subtle,
  fontFamily: vars.font.mono,
});

export type MenuItemVariants = RecipeVariants<typeof menuItemRecipe>;

export interface MenuItemProps extends Omit<ElementProps<HTMLButtonElement>, 'role'> {
  intent?: MenuItemVariants['intent'];
  icon?: ReactNode;
  shortcut?: ReactNode;
  /**
   * Whether clicking the item automatically closes the menu.
   * @default true
   */
  closeOnSelect?: boolean;
  onSelect?: () => void;
  children?: ReactNode;
}

function MenuItem({
  intent = 'default',
  icon,
  shortcut,
  closeOnSelect = true,
  disabled = false,
  onClick,
  onSelect,
  className,
  children,
  ref,
  ...props
}: MenuItemProps): React.JSX.Element {
  const { close } = useMenu();
  const classes = menuItemRecipe({ intent });

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(event);
      onSelect?.();
      if (!event.defaultPrevented && closeOnSelect) {
        close();
      }
    },
    [close, closeOnSelect, disabled, onClick, onSelect],
  );

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cx(classes, className)}
      {...props}
    >
      <span className={itemMainStyle.className}>
        {icon ? (
          <span aria-hidden="true" className={itemIconStyle.className}>
            {icon}
          </span>
        ) : null}
        <span>{children}</span>
      </span>
      {shortcut ? <span className={itemShortcutStyle.className}>{shortcut}</span> : null}
    </button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * MenuGroup, MenuLabel, MenuSeparator
 * -----------------------------------------------------------------------------------------------*/

const menuGroupStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

const menuLabelStyle = style({
  paddingInline: vars.spacing.xs,
  paddingBlock: vars.spacing['3xs'],
  fontSize: vars.font.size['2xs'],
  fontWeight: vars.font.weight.semibold,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.surface.subtle,
  fontFamily: vars.font.sans,
  userSelect: 'none',
});

export interface MenuGroupProps extends Omit<ElementProps<HTMLDivElement>, 'role'> {
  children?: ReactNode;
}

function MenuGroup({ className, children, ref, ...props }: MenuGroupProps): React.JSX.Element {
  return (
    <div
      ref={ref}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      className={cx(menuGroupStyle, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MenuLabelProps extends ElementProps<HTMLDivElement> {
  children?: ReactNode;
}

function MenuLabel({ className, children, ref, ...props }: MenuLabelProps): React.JSX.Element {
  return (
    <div ref={ref} className={cx(menuLabelStyle, className)} {...props}>
      {children}
    </div>
  );
}

export type MenuSeparatorProps = Omit<DividerProps, 'orientation'>;

function MenuSeparator({ spacing = 'xs', ...props }: MenuSeparatorProps): React.JSX.Element {
  return <Divider orientation="horizontal" spacing={spacing} {...props} />;
}

MenuRoot.displayName = 'Menu.Root';
MenuTrigger.displayName = 'Menu.Trigger';
MenuContent.displayName = 'Menu.Content';
MenuItem.displayName = 'Menu.Item';
MenuGroup.displayName = 'Menu.Group';
MenuLabel.displayName = 'Menu.Label';
MenuSeparator.displayName = 'Menu.Separator';

export {
  MenuRoot as Root,
  MenuTrigger as Trigger,
  MenuContent as Content,
  MenuItem as Item,
  MenuGroup as Group,
  MenuLabel as Label,
  MenuSeparator as Separator,
};
