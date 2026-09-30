'use client';

import { createThemeContract, cx, recipe, style, type RecipeVariants } from '@cumulo/css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import {
  SidebarContext,
  useSidebar,
  type SidebarContextValue,
  type SidebarPosition,
  type SidebarHoverBehavior,
} from '../hooks/useSidebar.js';
import { Button, type ButtonProps } from './Button.js';

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
        collapsedWidth: vars.size.xl,
      }),
      width: sidebarContract.width,
      overflowX: 'hidden',
      overflowY: 'auto',
      transition: `width ${vars.duration.normal} ${vars.ease.default}, margin ${vars.duration.normal} ${vars.ease.default}, box-shadow ${vars.duration.normal} ${vars.ease.default}`,
      selectors: {
        '&[data-collapsed="true"]': {
          width: sidebarContract.collapsedWidth,
        },
        '&[data-collapsed="true"][data-hover-behavior="expand"]:not([data-hover-suppressed="true"]):hover,&[data-collapsed="true"][data-hover-behavior="expand"]:not([data-hover-suppressed="true"]):focus-within':
          {
            width: sidebarContract.width,
            // boxShadow: vars.shadow['2'],
            zIndex: 40,
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

export type SidebarVariant = 'docked' | 'inset' | 'floating';

export interface SidebarProviderProps {
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
   * Sidebar dock position (`'left'` or `'right'`).
   */
  position?: SidebarPosition;
  /**
   * Strategy for showing items on hover when collapsed:
   * - `tooltip`: Keeps sidebar collapsed and displays floating tooltips adjacent to items.
   * - `none`: No hover tooltips.
   * - `expand`: Expand the sidebar to full width on hover.
   */
  hoverBehaviour: SidebarHoverBehavior;
  children?: React.ReactNode;
}

export function SidebarProvider({
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  position = 'left',
  hoverBehaviour,
  children,
}: SidebarProviderProps): React.JSX.Element {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const [hoverSuppressed, setHoverSuppressed] = useState(false);
  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed;

  const setCollapsed = useCallback(
    (action: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof action === 'function' ? action(isCollapsed) : action;
      if (!isControlled) {
        setUncontrolledCollapsed(next);
      }
      if (next) {
        setHoverSuppressed(true);
      } else {
        setHoverSuppressed(false);
      }
      onCollapsedChange?.(next);
    },
    [isControlled, isCollapsed, onCollapsedChange],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  const contextValue = useMemo(
    (): SidebarContextValue => ({
      collapsed: isCollapsed,
      setCollapsed,
      toggleCollapsed,
      position,
      hoverBehaviour,
      hoverSuppressed,
      setHoverSuppressed,
    }),
    [isCollapsed, setCollapsed, toggleCollapsed, position, hoverBehaviour, hoverSuppressed],
  );

  return <SidebarContext value={contextValue}>{children}</SidebarContext>;
}

SidebarProvider.displayName = 'Sidebar.Provider';

export interface SidebarRootProps extends ElementProps<HTMLDivElement> {
  /**
   * Whether the sidebar displays border divider along its inner edge.
   */
  bordered?: boolean;
  /**
   * Layout presentation variant:
   * - `'docked'`: Standard flush sidebar docked to the edge.
   * - `'inset'`: Sits cleanly inset below a top header or inside frame canvas.
   * - `'floating'`: Floating elevated card with rounded corners and shadow.
   */
  variant?: SidebarVariant;
  /**
   * Custom expanded width override (e.g. `'280px'`).
   */
  width?: string;
  /**
   * Custom collapsed width override (e.g. `'56px'`).
   */
  collapsedWidth?: string;
  /**
   * Override dock position (`'left'` or `'right'`). If omitted, uses position from SidebarProvider.
   */
  position?: SidebarPosition;
  /**
   * Override hover behavior (`'expand'`, `'tooltip'`, or `'none'`). If omitted, uses hoverBehaviour from SidebarProvider.
   */
  hoverBehaviour?: SidebarHoverBehavior;
  children?: React.ReactNode;
}

export function SidebarRoot({
  variant = 'docked',
  position: positionProp,
  bordered = true,
  width,
  collapsedWidth,
  hoverBehaviour: hoverBehaviourProp,
  className,
  children,
  ref,
  style: styleProp,
  ...props
}: SidebarRootProps): React.JSX.Element {
  const context = useSidebar();
  const position = positionProp ?? context.position;
  const hoverBehaviour = hoverBehaviourProp ?? context.hoverBehaviour;
  const isCollapsed = context.collapsed;
  const hoverSuppressed = context.hoverSuppressed ?? false;
  const setHoverSuppressed = context.setHoverSuppressed;

  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs(ref, rootRef);
  const isPointerOverRef = useRef(false);
  const hasLeftPointerRef = useRef(true);
  const isFocusWithinRef = useRef(false);
  const hasLeftFocusRef = useRef(true);

  // When hoverSuppressed becomes active upon collapse, record whether pointer or focus
  // are currently inside the sidebar. If they were already outside, mark hasLeft so the
  // very next enter immediately clears suppression (e.g. external toggle).
  useEffect(() => {
    if (hoverSuppressed) {
      hasLeftPointerRef.current = !isPointerOverRef.current;
      hasLeftFocusRef.current = !isFocusWithinRef.current;
    }
  }, [hoverSuppressed]);

  const classes = sidebarRecipe({
    variant,
    position,
    bordered,
  });

  const customWidths = useMemo((): React.CSSProperties | undefined => {
    if (!width && !collapsedWidth) return undefined;
    return sidebarContract.$set({
      ...(width ? { width } : {}),
      ...(collapsedWidth ? { collapsedWidth } : {}),
    });
  }, [width, collapsedWidth]);

  return (
    <div
      ref={mergedRef}
      data-collapsed={isCollapsed ? 'true' : 'false'}
      data-hover-behavior={hoverBehaviour}
      data-hover-suppressed={hoverSuppressed ? 'true' : undefined}
      data-tooltip-mode={hoverBehaviour === 'tooltip' ? 'true' : undefined}
      data-variant={variant}
      data-position={position}
      style={{
        ...customWidths,
        ...styleProp,
      }}
      className={cx(classes, className)}
      onPointerEnter={(e) => {
        isPointerOverRef.current = true;
        if (hoverSuppressed && hasLeftPointerRef.current) {
          hasLeftPointerRef.current = false;
          setHoverSuppressed?.(false);
        }
        props.onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        isPointerOverRef.current = false;
        hasLeftPointerRef.current = true;
        props.onPointerLeave?.(e);
      }}
      onFocus={(e) => {
        isFocusWithinRef.current = true;
        if (hoverSuppressed && hasLeftFocusRef.current) {
          hasLeftFocusRef.current = false;
          setHoverSuppressed?.(false);
        }
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          isFocusWithinRef.current = false;
          hasLeftFocusRef.current = true;
        }
        props.onBlur?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

SidebarRoot.displayName = 'Sidebar.Root';

export type SidebarProps = SidebarProviderProps & SidebarRootProps;

const toggleIconStyle = style({
  width: '18px',
  height: '18px',
  flexShrink: 0,
});

export interface SidebarToggleProps extends ButtonProps {
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

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        toggleCollapsed();
      }
    },
    [onClick, toggleCollapsed],
  );

  const chevronPath =
    position === 'right'
      ? collapsed
        ? 'm13 9-3 3 3 3'
        : 'm10 9 3 3-3 3'
      : collapsed
        ? 'm11 9 3 3-3 3'
        : 'm14 9-3 3 3 3';

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      onClick={handleClick}
      size="sm"
      width="square"
      className={className}
      icon={
        children || (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={toggleIconStyle.className}
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d={position === 'right' ? 'M15 3v18' : 'M9 3v18'} />
            <path d={chevronPath} />
          </svg>
        )
      }
      {...props}
    />
  );
}

SidebarToggle.displayName = 'Sidebar.Toggle';

const collapsedHeaderSelector =
  '[data-collapsed="true"]:not([data-hover-behavior="expand"]:not([data-hover-suppressed="true"]):hover):not([data-hover-behavior="expand"]:not([data-hover-suppressed="true"]):focus-within) &';

const sidebarHeaderStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  minHeight: vars.size.sm,
  boxSizing: 'border-box',
});

const sidebarHeaderTitleStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  opacity: 1,
  flex: 1,
  minWidth: 0,
  marginRight: vars.spacing.xs,
  paddingBlock: vars.spacing['2xs'],
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, margin-right ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    '& > *': {
      whiteSpace: 'nowrap',
      overflow: 'visible',
      minWidth: 'max-content',
      textOverflow: 'ellipsis',
    },
    [collapsedHeaderSelector]: {
      opacity: 0,
      width: 0,
      flex: 0,
      marginRight: 0,
      pointerEvents: 'none',
    },
  },
});

const sidebarHeaderActionsStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  flexShrink: 0,
  marginLeft: 'auto',
});

export interface SidebarHeaderProps extends ElementProps<HTMLDivElement> {
  title?: React.ReactNode;
  children?: React.ReactNode;
}

export function SidebarHeader({
  title,
  className,
  children,
  ref,
  ...props
}: SidebarHeaderProps): React.JSX.Element {
  return (
    <div ref={ref} className={cx(sidebarHeaderStyle.className, className)} {...props}>
      {title && <span className={sidebarHeaderTitleStyle.className}>{title}</span>}
      {children && <div className={sidebarHeaderActionsStyle.className}>{children}</div>}
    </div>
  );
}

SidebarHeader.displayName = 'Sidebar.Header';

const sidebarFooterStyle = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, max-height ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    [collapsedHeaderSelector]: {
      opacity: 0,
      maxHeight: 0,
      pointerEvents: 'none',
    },
  },
});

export interface SidebarFooterProps extends ElementProps<HTMLDivElement> {
  children?: React.ReactNode;
}

export function SidebarFooter({
  className,
  children,
  ref,
  ...props
}: SidebarFooterProps): React.JSX.Element {
  return (
    <div ref={ref} className={cx(sidebarFooterStyle.className, className)} {...props}>
      {children}
    </div>
  );
}

SidebarFooter.displayName = 'Sidebar.Footer';

export function SidebarCombined({
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  position,
  hoverBehaviour,
  variant,
  bordered,
  width,
  collapsedWidth,
  children,
  ...props
}: SidebarProps): React.JSX.Element {
  return (
    <SidebarProvider
      collapsed={collapsed}
      defaultCollapsed={defaultCollapsed}
      onCollapsedChange={onCollapsedChange}
      position={position}
      hoverBehaviour={hoverBehaviour}
    >
      <SidebarRoot
        variant={variant}
        position={position}
        hoverBehaviour={hoverBehaviour}
        bordered={bordered}
        width={width}
        collapsedWidth={collapsedWidth}
        {...props}
      >
        {children}
      </SidebarRoot>
    </SidebarProvider>
  );
}

SidebarCombined.displayName = 'Sidebar';

export const Sidebar = Object.assign(SidebarCombined, {
  Root: SidebarRoot,
  Provider: SidebarProvider,
  Toggle: SidebarToggle,
  Header: SidebarHeader,
  Footer: SidebarFooter,
});
