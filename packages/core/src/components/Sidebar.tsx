'use client';

import { createThemeContract, cx, recipe, style, type RecipeVariants } from '@cumulo/css';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ExtractThemeVarByType, vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import {
  SidebarContext,
  useSidebar,
  type SidebarContextValue,
  type SidebarPosition,
  type SidebarHoverBehavior,
  type SidebarType,
} from '../hooks/useSidebar.js';
import { Button, type ButtonProps } from './Button.js';
import { HStack } from './Stack.js';

export type { SidebarType };

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
        '&[data-visually-collapsed="true"]': {
          width: sidebarContract.collapsedWidth,
        },
        '&[data-collapsed="true"]:not([data-visually-collapsed="true"])': {
          width: sidebarContract.width,
          zIndex: 40,
        },
        '&[data-visually-collapsed="true"][data-zero-collapsed-width="true"]': {
          borderRightColor: 'transparent',
          borderLeftColor: 'transparent',
        },
        '&[data-zero-collapsed-width="true"][data-visually-collapsed="true"][data-hover-behavior="expand"]::before':
          {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '16px',
            left: 0,
            cursor: 'pointer',
            zIndex: 50,
          },
        '&[data-position="right"][data-zero-collapsed-width="true"][data-visually-collapsed="true"][data-hover-behavior="expand"]::before':
          {
            left: 'auto',
            right: 0,
          },
      },
    },
    variants: {
      type: {
        push: {},
        overlay: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          zIndex: 40,
          selectors: {
            '&:not([data-visually-collapsed="true"])': {
              boxShadow: vars.surface.shadow,
            },
          },
        },
      },
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
        variants: { type: 'overlay', position: 'left' },
        style: {
          left: 0,
        },
      },
      {
        variants: { type: 'overlay', position: 'right' },
        style: {
          right: 0,
        },
      },
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
      type: 'push',
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
   * Expansion type of the sidebar:
   * - `'push'`: Expands within document flow, pushing adjacent content.
   * - `'overlay'`: Expands over adjacent content without shifting layout.
   * @default 'push'
   */
  type?: SidebarType;
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
  type = 'push',
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  position = 'left',
  hoverBehaviour,
  children,
}: SidebarProviderProps): React.JSX.Element {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const [hoverSuppressed, setHoverSuppressed] = useState(false);
  const isHoveredRef = useRef(false);
  const [isHovered, setHoveredState] = useState(false);
  const setHovered = useCallback((hovered: boolean) => {
    isHoveredRef.current = hovered;
    setHoveredState(hovered);
  }, []);
  const [isFocused, setFocused] = useState(false);

  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed;

  const isVisuallyExpanded =
    !isCollapsed || (hoverBehaviour === 'expand' && !hoverSuppressed && (isHovered || isFocused));
  const visuallyCollapsed = !isVisuallyExpanded;

  const setCollapsed = useCallback(
    (collapsed: boolean) => {
      if (!isControlled) {
        setUncontrolledCollapsed(collapsed);
      }
      if (collapsed && isHoveredRef.current) {
        setHoverSuppressed(true);
      } else {
        setHoverSuppressed(false);
      }
      onCollapsedChange?.(collapsed);
    },
    [isControlled, onCollapsedChange],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!isCollapsed);
  }, [setCollapsed, isCollapsed]);

  const contextValue = useMemo(
    (): SidebarContextValue => ({
      type,
      collapsed: isCollapsed,
      visuallyCollapsed,
      setCollapsed,
      toggleCollapsed,
      position,
      hoverBehaviour,
      hoverSuppressed,
      setHoverSuppressed,
      setHovered,
      setFocused,
    }),
    [
      type,
      isCollapsed,
      visuallyCollapsed,
      setCollapsed,
      toggleCollapsed,
      position,
      hoverBehaviour,
      hoverSuppressed,
      setHoverSuppressed,
      setHovered,
      setFocused,
    ],
  );

  return <SidebarContext value={contextValue}>{children}</SidebarContext>;
}

SidebarProvider.displayName = 'Sidebar.Provider';

export interface SidebarRootProps extends ElementProps<HTMLDivElement> {
  /**
   * Override expansion type (`'push'` or `'overlay'`). If omitted, uses type from SidebarProvider.
   * @default 'push'
   */
  type?: SidebarType;
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
  width?: ExtractThemeVarByType<'size'>[keyof ExtractThemeVarByType<'size'>] | (string & {});
  /**
   * Custom collapsed width override.
   * @default var(--theme-size-xl)
   */
  collapsedWidth?: '0px' | (string & {});
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
  type: typeProp,
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
  const {
    type: typeContext,
    collapsed,
    hoverBehaviour: hoverBehaviourContext,
    position: positionContext,
    visuallyCollapsed,
    hoverSuppressed,
    setFocused,
    setHoverSuppressed,
    setHovered,
  } = useSidebar();
  const type = typeProp ?? typeContext ?? 'push';
  const position = positionProp ?? positionContext;
  const hoverBehaviour = hoverBehaviourProp ?? hoverBehaviourContext;
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs(ref, rootRef);

  const classes = sidebarRecipe({
    type,
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

  const isZeroCollapsedWidth = collapsedWidth !== undefined && parseFloat(collapsedWidth) === 0;

  return (
    <div
      ref={mergedRef}
      data-sidebar-type={type}
      data-collapsed={collapsed ? 'true' : 'false'}
      data-visually-collapsed={visuallyCollapsed ? 'true' : 'false'}
      data-zero-collapsed-width={isZeroCollapsedWidth ? 'true' : undefined}
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
        setHoverSuppressed?.(false);
        setHovered?.(true);
        props.onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setHovered?.(false);
        setHoverSuppressed?.(false);
        setFocused?.(false);
        props.onPointerLeave?.(e);
      }}
      onFocus={(e) => {
        setHoverSuppressed?.(false);
        if (e.target instanceof HTMLElement && e.target.hasAttribute('data-sidebar-toggle')) {
          setFocused?.(false);
        } else {
          setFocused?.(true);
        }
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        const nextTarget = e.relatedTarget;
        if (!(nextTarget instanceof Node) || !e.currentTarget.contains(nextTarget)) {
          setFocused?.(false);
        } else if (
          nextTarget instanceof HTMLElement &&
          nextTarget.hasAttribute('data-sidebar-toggle')
        ) {
          setFocused?.(false);
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
      data-sidebar-toggle="true"
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

const collapsedHeaderSelector = '[data-visually-collapsed="true"] &';

const sidebarHeaderStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  minHeight: vars.size.sm,
  boxSizing: 'border-box',
});

const sidebarHeaderTitleStyle = style({
  display: 'flex',
  alignItems: 'center',
  opacity: 1,
  flex: 1,
  minWidth: 0,
  marginRight: vars.spacing.xs,
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, margin-right ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    [collapsedHeaderSelector]: {
      opacity: 0,
      width: 0,
      flex: 0,
      marginRight: 0,
      pointerEvents: 'none',
      textOverflow: 'clip',
      // Delay layout collapse until after opacity fade completes
      transition: `opacity ${vars.duration.fast} ${vars.ease.default}, width 0s linear ${vars.duration.fast}, flex 0s linear ${vars.duration.fast}, margin-right 0s linear ${vars.duration.fast}`,
    },
  },
});

const sidebarHeaderTitleCollapsedStyle = style({
  display: 'none',
  alignItems: 'center',
  minWidth: 0,
  selectors: {
    [collapsedHeaderSelector]: {
      display: 'inline-flex',
    },
  },
});

const sidebarHeaderActionsStyle = style({
  flexShrink: 0,
  marginLeft: 'auto',
});

export interface SidebarHeaderProps extends ElementProps<HTMLDivElement> {
  /**
   * Title content displayed when the sidebar is expanded.
   */
  title?: React.ReactNode;
  /**
   * Title content displayed when the sidebar is collapsed.
   */
  titleCollapsed?: React.ReactNode;
  /**
   * Action items or toggle buttons rendered on the trailing side of the header.
   */
  children?: React.ReactNode;
}

export function SidebarHeader({
  title,
  titleCollapsed,
  className,
  children,
  ref,
  ...props
}: SidebarHeaderProps): React.JSX.Element {
  return (
    <div ref={ref} className={cx(sidebarHeaderStyle.className, className)} {...props}>
      {title && <span className={sidebarHeaderTitleStyle.className}>{title}</span>}
      {titleCollapsed && (
        <span className={sidebarHeaderTitleCollapsedStyle.className}>{titleCollapsed}</span>
      )}
      {children && (
        <HStack inline align="center" gap="xs" className={sidebarHeaderActionsStyle.className}>
          {children}
        </HStack>
      )}
    </div>
  );
}

SidebarHeader.displayName = 'Sidebar.Header';

const sidebarFooterStyle = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, max-height ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    [collapsedHeaderSelector]: {
      opacity: 0,
      maxHeight: 0,
      pointerEvents: 'none',
      transition: `opacity ${vars.duration.fast} ${vars.ease.default}, max-height 0s linear ${vars.duration.fast}`,
    },
  },
});

const sidebarFooterContentStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'inherit',
  width: '100%',
  flex: 1,
  minWidth: 0,
  gap: vars.spacing.xs,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  opacity: 1,
  // Fade in on expand
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '& > *': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    [collapsedHeaderSelector]: {
      opacity: 0,
      pointerEvents: 'none',
      width: 0,
      flex: '0 0 0px',
      // Fade out quickly (fast), then snap layout away after fade
      transition: `opacity ${vars.duration.fast} ${vars.ease.default}, width 0s linear ${vars.duration.fast}, flex 0s linear ${vars.duration.fast}`,
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
      {children && <div className={sidebarFooterContentStyle.className}>{children}</div>}
    </div>
  );
}

SidebarFooter.displayName = 'Sidebar.Footer';

export function SidebarCombined({
  type,
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
      type={type}
      collapsed={collapsed}
      defaultCollapsed={defaultCollapsed}
      onCollapsedChange={onCollapsedChange}
      position={position}
      hoverBehaviour={hoverBehaviour}
    >
      <SidebarRoot
        type={type}
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
