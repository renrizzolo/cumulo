'use client';

import { createThemeContract, cx, recipe, style, type RecipeVariants } from '@cumulo/css';
import React, { createContext, use, useCallback, useMemo, useRef, useState } from 'react';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import { Button, type ButtonProps } from './Button.js';
import { HStack } from './Stack.js';

export const sidebarContract = createThemeContract(
  {
    width: null,
    collapsedWidth: null,
    floatingMargin: null,
  },
  'sidebar',
);

const defaultFloatingMargin = vars.spacing.sm;

export const sidebarRecipe = recipe(
  {
    base: {
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      flexShrink: 0,
      zIndex: 10,
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.surface.fg,
      ...sidebarContract.$set({
        width: '270px',
        collapsedWidth: vars.size.xl,
        floatingMargin: defaultFloatingMargin,
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
      },
    },
    variants: {
      type: {
        push: {
          position: 'relative',
        },
        overlay: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          zIndex: 40,
        },
      },
      variant: {
        docked: {},
        inset: {
          selectors: {
            '& [data-part="panel"]': {
              paddingInline: 0,
            },
          },
        },
        floating: {
          height: `calc(100% - (${sidebarContract.floatingMargin} * 2))`,
          margin: sidebarContract.floatingMargin,
          borderRadius: vars.radius.xl,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
          boxShadow: vars.surface.shadow,
        },
      },
      position: {
        left: {},
        right: {
          selectors: {
            '&[data-zero-collapsed-width="true"][data-visually-collapsed="true"][data-hover-behavior="expand"]::before':
              {
                left: 'auto',
                right: 0,
              },
          },
        },
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
          borderRightColor: 'transparent',
        },
      },
      {
        variants: { variant: 'inset', position: 'right', bordered: true },
        style: {
          borderLeftWidth: 1,
          borderLeftStyle: 'solid',
          borderLeftColor: 'transparent',
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
export type SidebarType = NonNullable<SidebarVariants['type']>;
export type SidebarVariant = NonNullable<SidebarVariants['variant']>;
export type SidebarPosition = NonNullable<SidebarVariants['position']>;
export type SidebarHoverBehavior = 'expand' | 'tooltip' | 'none';
export type SidebarLevel = 0 | 1 | 2;

export interface SidebarContextValue {
  /**
   * Visual layout variant of the sidebar:
   * - `'docked'`: Standard pinned sidebar with outer border.
   * - `'inset'`: Inset sidebar flush with adjacent canvas, zero inline padding on header/menu/footer.
   * - `'floating'`: Floating sidebar elevated with rounded corners and margin.
   */
  variant: SidebarVariant;
  /**
   * Expansion type of the sidebar:
   * - `'push'`: Expands within document flow, pushing adjacent content.
   * - `'overlay'`: Expands over adjacent content without shifting the layout.
   */
  type: SidebarType;
  /**
   * Whether the sidebar is currently explicitly toggled to collapsed mode.
   */
  collapsed: boolean;
  /**
   * Whether the sidebar is currently visually collapsed (accounting for hover and focus expansion).
   */
  visuallyCollapsed: boolean;
  /**
   * Sets the collapsed state of the sidebar.
   */
  setCollapsed: (collapsed: boolean) => void;
  /**
   * Toggles the collapsed state between expanded and icon-only.
   */
  toggleCollapsed: () => void;
  /**
   * Sidebar dock position (`'left'` or `'right'`).
   */
  position: SidebarPosition;
  /**
   * Strategy for showing items on hover when collapsed:
   * - `'expand'`: Expand the sidebar to full width on hover.
   * - `'tooltip'`: Keeps sidebar collapsed and displays floating tooltips adjacent to items.
   * - `'none'`: No hover tooltips.
   */
  hoverBehaviour: SidebarHoverBehavior;
  /**
   * Whether hover-expand and focus-within expansion behavior is temporarily suppressed (e.g. immediately after collapse toggle).
   */
  hoverSuppressed: boolean;
  /**
   * Sets hover suppression state.
   */
  setHoverSuppressed: (suppressed: boolean) => void;
  /**
   * Sets whether the sidebar root is currently hovered.
   */
  setHovered: (hovered: boolean) => void;
  /**
   * Sets whether sidebar content is currently focused.
   */
  setFocused: (focused: boolean) => void;
  /**
   * Surface elevation level of the sidebar (`0 | 1 | 2`).
   */
  level?: SidebarLevel;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Accesses the active sidebar state and controls.
 */
export function useSidebar(): SidebarContextValue {
  const contextValue = use(SidebarContext);
  if (!contextValue) {
    throw new Error('useSidebar must be used within a SidebarProvider or Sidebar');
  }
  return contextValue;
}

export interface SidebarProviderProps {
  /**
   * Expansion type of the sidebar:
   * - `'push'`: Expands within document flow, pushing adjacent content.
   * - `'overlay'`: Expands over adjacent content without shifting layout.
   * @default 'push'
   */
  type?: SidebarVariants['type'];
  /**
   * Controlled collapsed state.
   */
  collapsed?: boolean;
  /**
   * Uncontrolled initial collapsed state.
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * Callback fired when collapsed state changes.
   */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Sidebar dock position (`'left'` or `'right'`).
   * @default 'left'
   */
  position?: SidebarVariants['position'];
  /**
   * Strategy for showing items on hover when collapsed:
   * - `'expand'`: Expand the sidebar to full width on hover.
   * - `'tooltip'`: Keeps sidebar collapsed and displays floating tooltips adjacent to items.
   * - `'none'`: No hover tooltips.
   * @default 'none'
   */
  hoverBehaviour?: SidebarHoverBehavior;
  /**
   * Visual layout variant of the sidebar:
   * - `'docked'`: Standard pinned sidebar with outer border.
   * - `'inset'`: Inset sidebar flush with adjacent canvas, zero inline padding on header/menu/footer.
   * - `'floating'`: Floating sidebar elevated with rounded corners and margin.
   * @default 'docked'
   */
  variant?: SidebarVariants['variant'];
  /**
   * Surface elevation level of the sidebar (`0 | 1 | 2`).
   * When set, scopes `--surface-bg` and `--surface-bg-next` so the sidebar and
   * child nav items use the corresponding surface background and hover/active colors.
   */
  level?: SidebarLevel;
  children?: React.ReactNode;
}

export function SidebarProvider({
  type = 'push',
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  position = 'left',
  hoverBehaviour = 'none',
  variant = 'docked',
  level,
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
      level,
      variant,
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
      level,
      variant,
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
  type?: SidebarVariants['type'];
  /**
   * Whether the sidebar displays border divider along its inner edge.
   * @default true
   */
  bordered?: SidebarVariants['bordered'];
  /**
   * Layout presentation variant:
   * - `'docked'`: Standard flush sidebar docked to the edge.
   * - `'inset'`: Sits cleanly inset below a top header or inside frame canvas.
   * - `'floating'`: Floating elevated card with rounded corners and shadow.
   * If omitted, uses variant from SidebarProvider.
   * @default 'docked'
   */
  variant?: SidebarVariants['variant'];
  /**
   * Custom margin used for the outer margin of the floating sidebar, and included in the collapsed content spacer for the `overlay` type.
   * @default var(--theme-spacing-sm)
   */
  floatingMargin?: string;
  /**
   * Custom expanded width override (e.g. `'280px'`).
   */
  width?: string;
  /**
   * Custom collapsed width override.
   * @default var(--theme-size-xl)
   */
  collapsedWidth?: '0px' | (string & {});
  /**
   * Override dock position (`'left'` or `'right'`). If omitted, uses position from SidebarProvider.
   * @default 'left'
   */
  position?: SidebarVariants['position'];
  /**
   * Surface elevation level of the sidebar (`0 | 1 | 2`).
   * Defaults to `0` when `variant="inset"`.
   * If omitted, uses level from SidebarProvider.
   */
  level?: SidebarLevel;
  children?: React.ReactNode;
}

export function SidebarRoot({
  type: typeProp,
  variant: variantProp,
  position: positionProp,
  bordered = true,
  width,
  collapsedWidth,
  level: levelProp,
  floatingMargin,
  className,
  children,
  ref,
  style: styleProp,
  ...props
}: SidebarRootProps): React.JSX.Element {
  const {
    type: typeContext,
    variant: variantContext,
    position: positionContext,
    level: levelContext,
    collapsed,
    visuallyCollapsed,
    hoverBehaviour,
    setFocused,
    setHoverSuppressed,
    setHovered,
  } = useSidebar();
  const type = typeProp ?? typeContext ?? 'push';
  const variant = variantProp ?? variantContext ?? 'docked';
  const position = positionProp ?? positionContext ?? 'left';
  const level = levelProp ?? levelContext ?? (variant === 'inset' ? 0 : undefined);
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
      ...(floatingMargin ? { floatingMargin } : {}),
    });
  }, [width, collapsedWidth, floatingMargin]);

  const isZeroCollapsedWidth = collapsedWidth !== undefined && parseFloat(collapsedWidth) === 0;

  return (
    <>
      <div
        ref={mergedRef}
        data-collapsed={collapsed ? 'true' : 'false'}
        data-visually-collapsed={visuallyCollapsed ? 'true' : 'false'}
        data-zero-collapsed-width={isZeroCollapsedWidth ? 'true' : undefined}
        data-hover-behavior={hoverBehaviour}
        style={{
          ...customWidths,
          ...styleProp,
        }}
        className={cx(level !== undefined && `surface-${level}`, classes, className)}
        {...props}
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
      >
        {children}
      </div>
      {/* push the main content so that the collapsed overlay isn't covering it */}
      {type === 'overlay' ? (
        <div
          aria-hidden="true"
          style={{
            width: `calc(${collapsedWidth || vars.size.xl} + ${
              variant === 'floating' ? `(${floatingMargin || defaultFloatingMargin} * 2)` : '0px'
            })`,
          }}
        />
      ) : null}
    </>
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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        toggleCollapsed();
      }
    },
    [onClick, toggleCollapsed],
  );

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
  selectors: {
    '& > *': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
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
  floatingMargin,
  level,
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
      variant={variant}
      level={level}
    >
      <SidebarRoot
        type={type}
        variant={variant}
        position={position}
        bordered={bordered}
        width={width}
        collapsedWidth={collapsedWidth}
        floatingMargin={floatingMargin}
        level={level}
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
