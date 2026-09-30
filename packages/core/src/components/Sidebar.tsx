'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { recipe, cx, createThemeContract, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import {
  SidebarContext,
  useSidebar,
  type SidebarVariant,
  type SidebarPosition,
  type SidebarHoverBehavior,
  type SidebarContextValue,
} from '../hooks/useSidebar.js';

export const sidebarContract = createThemeContract(
  {
    width: null,
    collapsedWidth: null,
  },
  'sidebar',
);

export const sidebarRecipe = recipe(
  {
    base: {
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.surface.fg,
      ...sidebarContract.$set({
        width: '270px',
        collapsedWidth: '60px',
      }),
      width: sidebarContract.width,
      overflowX: 'hidden',
      overflowY: 'auto',
      transition: `width ${vars.duration.normal} ${vars.ease.default}, margin ${vars.duration.normal} ${vars.ease.default}, box-shadow ${vars.duration.normal} ${vars.ease.default}`,
      selectors: {
        '&[data-collapsed="true"]': {
          width: sidebarContract.collapsedWidth,
        },
        '&[data-hover-expanded="true"]': {
          width: sidebarContract.width,
          boxShadow: vars.shadow['2'],
          zIndex: 40,
        },
        '&[data-collapsed="true"][data-expand-on-hover="true"]:hover': {
          width: sidebarContract.width,
          boxShadow: vars.shadow['2'],
          zIndex: 40,
        },
        '&[data-collapsed="true"][data-expand-on-hover="true"]:focus-within': {
          width: sidebarContract.width,
          boxShadow: vars.shadow['2'],
          zIndex: 40,
        },
        '&[data-collapsed="true"][data-tooltip-mode="true"]': {
          overflowX: 'visible',
          overflowY: 'visible',
        },
      },
    },
    variants: {
      variant: {
        docked: {
          height: '100%',
        },
        inset: {
          height: '100%',
        },
        floating: {
          height: 'calc(100% - 24px)',
          margin: vars.spacing.sm,
          borderRadius: vars.radius.xl,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
          boxShadow: vars.surface.shadow,
          overflow: 'hidden',
        },
      },
      position: {
        left: {},
        right: {},
      },
      bordered: {
        true: {},
        false: {},
      },
    },
    compoundVariants: [
      {
        variants: { variant: 'docked', position: 'left', bordered: true },
        style: {
          borderRightWidth: 1,
          borderRightStyle: 'solid',
          borderRightColor: vars.surface.border,
        },
      },
      {
        variants: { variant: 'docked', position: 'right', bordered: true },
        style: {
          borderLeftWidth: 1,
          borderLeftStyle: 'solid',
          borderLeftColor: vars.surface.border,
        },
      },
      {
        variants: { variant: 'inset', position: 'left', bordered: true },
        style: {
          borderRightWidth: 1,
          borderRightStyle: 'solid',
          borderRightColor: vars.surface.border,
        },
      },
      {
        variants: { variant: 'inset', position: 'right', bordered: true },
        style: {
          borderLeftWidth: 1,
          borderLeftStyle: 'solid',
          borderLeftColor: vars.surface.border,
        },
      },
    ],
    defaultVariants: {
      variant: 'docked',
      position: 'left',
      bordered: true,
    },
  },
  'sidebar',
);

export type SidebarVariants = RecipeVariants<typeof sidebarRecipe>;

export interface SidebarProps extends ElementProps<HTMLElement> {
  /**
   * Layout presentation variant:
   * - `'docked'`: Standard flush sidebar docked to the edge.
   * - `'inset'`: Sits cleanly inset below a top header or inside frame canvas.
   * - `'floating'`: Floating elevated card with rounded corners and shadow.
   */
  variant?: SidebarVariant;
  /**
   * Dock position (`'left'` or `'right'`).
   */
  position?: SidebarPosition;
  /**
   * Whether the sidebar displays border divider along its inner edge.
   */
  bordered?: boolean;
  /**
   * Controlled collapsed state.
   */
  collapsed?: boolean;
  /**
   * Uncontrolled initial collapsed state.
   */
  defaultCollapsed?: boolean;
  /**
   * Callback fired when collapsed state changes.
   */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Custom expanded width override (e.g. `'280px'`).
   */
  width?: string;
  /**
   * Custom collapsed width override (e.g. `'56px'`).
   */
  collapsedWidth?: string;
  /**
   * Whether the collapsed sidebar temporarily expands to full width on hover/focus.
   * Defaults to `false`.
   */
  expandOnHover?: boolean;
  /**
   * Strategy for showing items on hover when collapsed:
   * - `'expand'`: Expands the whole sidebar on hover with elevation shadow (default when expandOnHover is true).
   * - `'tooltip'`: Keeps sidebar collapsed and displays floating tooltips adjacent to items.
   * - `'none'`: No hover expansion or tooltips.
   */
  collapsedHoverBehavior?: SidebarHoverBehavior;
  children?: React.ReactNode;
}

export function SidebarRoot({
  variant = 'docked',
  position = 'left',
  bordered = true,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  width,
  collapsedWidth,
  expandOnHover = false,
  collapsedHoverBehavior,
  className,
  style: userStyle,
  children,
  ref,
  ...props
}: SidebarProps): React.JSX.Element {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed;

  const effectiveHoverBehavior: SidebarHoverBehavior =
    collapsedHoverBehavior ?? (expandOnHover ? 'expand' : 'none');
  const effectiveExpandOnHover = effectiveHoverBehavior === 'expand';

  const setCollapsed = useCallback(
    (action: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof action === 'function' ? action(isCollapsed) : action;
      if (!isControlled) {
        setUncontrolledCollapsed(next);
      }
      onCollapsedChange?.(next);
    },
    [isControlled, isCollapsed, onCollapsedChange],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!isCollapsed);
  }, [isCollapsed, setCollapsed]);

  const contextValue = useMemo<SidebarContextValue>(
    () => ({
      collapsed: isCollapsed,
      setCollapsed,
      toggleCollapsed,
      variant,
      position,
      expandOnHover: effectiveExpandOnHover,
      collapsedHoverBehavior: effectiveHoverBehavior,
    }),
    [
      isCollapsed,
      setCollapsed,
      toggleCollapsed,
      variant,
      position,
      effectiveExpandOnHover,
      effectiveHoverBehavior,
    ],
  );

  const classes = sidebarRecipe({
    variant,
    position,
    bordered,
  });

  const customVars = sidebarContract.$set({
    ...(width ? { width } : {}),
    ...(collapsedWidth ? { collapsedWidth } : {}),
  });

  const mergedStyle: React.CSSProperties = {
    ...customVars,
    ...userStyle,
  };

  return (
    <SidebarContext value={contextValue}>
      <aside
        ref={ref}
        data-collapsed={isCollapsed ? 'true' : 'false'}
        data-expand-on-hover={effectiveExpandOnHover ? 'true' : undefined}
        data-tooltip-mode={effectiveHoverBehavior === 'tooltip' ? 'true' : undefined}
        data-variant={variant}
        data-position={position}
        className={cx(classes, className)}
        style={mergedStyle}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext>
  );
}

SidebarRoot.displayName = 'Sidebar';

const toggleButtonRecipe = recipe(
  {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: vars.size.md,
      height: vars.size.md,
      padding: vars.spacing['3xs'],
      borderRadius: vars.radius.md,
      backgroundColor: 'transparent',
      color: vars.surface.fg,
      border: 'none',
      cursor: 'pointer',
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}`,
      ':hover': {
        backgroundColor: vars.surface.bg.next,
      },
      ':focus-visible': {
        outline: `2px solid ${vars.primary.focus}`,
        outlineOffset: '2px',
      },
    },
  },
  'sidebar-toggle',
);

const toggleIconRecipe = recipe(
  {
    base: {
      width: '18px',
      height: '18px',
      transition: `transform ${vars.duration.fast} ${vars.ease.default}`,
    },
    variants: {
      flipped: {
        true: {
          transform: 'rotate(180deg)',
        },
        false: {
          transform: 'none',
        },
      },
    },
    defaultVariants: {
      flipped: false,
    },
  },
  'sidebar-toggle-icon',
);

export interface SidebarToggleProps extends ElementProps<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function SidebarToggle({
  className,
  children,
  onClick,
  ref,
  ...props
}: SidebarToggleProps): React.JSX.Element {
  const { collapsed, toggleCollapsed, position } = useSidebar();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      toggleCollapsed();
    }
  };

  const isFlipped = position === 'right' ? !collapsed : collapsed;

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      onClick={handleClick}
      className={cx(toggleButtonRecipe(), className)}
      {...props}
    >
      {children || (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={toggleIconRecipe({ flipped: isFlipped })}
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
          <path d="m14 9-3 3 3 3" />
        </svg>
      )}
    </button>
  );
}

SidebarToggle.displayName = 'Sidebar.Toggle';

export const Sidebar = Object.assign(SidebarRoot, {
  Root: SidebarRoot,
  Toggle: SidebarToggle,
  Trigger: SidebarToggle,
});
