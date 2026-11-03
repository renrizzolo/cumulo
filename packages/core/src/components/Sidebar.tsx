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

const sidebarRecipe = recipe(
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

type SidebarVariants = RecipeVariants<typeof sidebarRecipe>;
type SidebarType = NonNullable<SidebarVariants['type']>;
type SidebarVariant = NonNullable<SidebarVariants['variant']>;
type SidebarPosition = NonNullable<SidebarVariants['position']>;
type SidebarHoverBehavior = 'expand' | 'tooltip' | 'none';
type SidebarLevel = 0 | 1 | 2;

export interface SidebarHoverTargetProps {
  onPointerEnter: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
}

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
  /**
   * Delay in milliseconds before visually collapsing the sidebar after pointer leaves.
   */
  hoverLeaveDelay?: number;
  /**
   * Event handlers to attach to any element that should participate in triggering sidebar hover expansion.
   */
  hoverTargetProps: SidebarHoverTargetProps;
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

interface SidebarProviderProps {
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
  /**
   * Delay in milliseconds before visually collapsing the sidebar after pointer leaves
   * the sidebar and any registered hover targets. Useful for multi-element hover targets
   * and bridging borders/gutters.
   * @default 0
   */
  hoverLeaveDelay?: number;
  children?: React.ReactNode;
}

function SidebarProvider({
  type = 'push',
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  position = 'left',
  hoverBehaviour = 'none',
  variant = 'docked',
  level,
  hoverLeaveDelay = 0,
  children,
}: SidebarProviderProps): React.JSX.Element {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const [hoverSuppressed, setHoverSuppressed] = useState(false);
  const isHoveredRef = useRef(false);
  const [isHovered, setHoveredState] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const setHovered = useCallback(
    (hovered: boolean, options?: { immediate?: boolean; delay?: number }) => {
      clearHoverTimeout();

      if (hovered) {
        isHoveredRef.current = true;
        setHoveredState(true);
      } else {
        const delay = options?.immediate ? 0 : (options?.delay ?? hoverLeaveDelay);
        if (delay <= 0) {
          isHoveredRef.current = false;
          setHoveredState(false);
          setHoverSuppressed(false);
        } else {
          hoverTimeoutRef.current = setTimeout(() => {
            isHoveredRef.current = false;
            setHoveredState(false);
            setHoverSuppressed(false);
            hoverTimeoutRef.current = null;
          }, delay);
        }
      }
    },
    [clearHoverTimeout, hoverLeaveDelay],
  );

  React.useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, [clearHoverTimeout]);

  const isFocusedRef = useRef(false);
  const [isFocused, setFocusedState] = useState(false);
  const setFocused = useCallback((focused: boolean) => {
    isFocusedRef.current = focused;
    setFocusedState(focused);
  }, []);

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
      if (collapsed) {
        clearHoverTimeout();
        if (isHoveredRef.current || isFocusedRef.current) {
          setHoverSuppressed(true);
        }
      } else {
        clearHoverTimeout();
        setHoverSuppressed(false);
      }
      onCollapsedChange?.(collapsed);
    },
    [isControlled, onCollapsedChange, clearHoverTimeout],
  );

  const toggleCollapsed = useCallback(() => {
    if (!visuallyCollapsed) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [setCollapsed, visuallyCollapsed]);

  const hoverTargetProps = useMemo(
    (): SidebarHoverTargetProps => ({
      onPointerEnter: () => {
        setHovered(true);
      },
      onPointerLeave: () => {
        setHovered(false);
      },
    }),
    [setHovered],
  );

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
      hoverLeaveDelay,
      hoverTargetProps,
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
      hoverLeaveDelay,
      hoverTargetProps,
    ],
  );

  return <SidebarContext value={contextValue}>{children}</SidebarContext>;
}

SidebarProvider.displayName = 'Sidebar.Provider';

interface SidebarRootProps extends ElementProps<HTMLDivElement> {
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

function SidebarRoot({
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
          setHovered?.(true);
          props.onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          setHovered?.(false);
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

type SidebarProps = SidebarProviderProps & SidebarRootProps;

const toggleIconStyle = style({
  width: '18px',
  height: '18px',
  flexShrink: 0,
});

interface SidebarToggleProps extends ButtonProps {
  children?: React.ReactNode;
}

function SidebarToggle({
  className,
  children,
  onClick,
  ref,
  ...props
}: SidebarToggleProps): React.JSX.Element {
  const { visuallyCollapsed, toggleCollapsed, position } = useSidebar();

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
      aria-expanded={!visuallyCollapsed}
      aria-label={visuallyCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
  whiteSpace: 'nowrap',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, margin-right ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    '& > *': {
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
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

interface SidebarHeaderProps extends ElementProps<HTMLDivElement> {
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

function SidebarHeader({
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

interface SidebarFooterProps extends ElementProps<HTMLDivElement> {
  children?: React.ReactNode;
}

function SidebarFooter({
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

const sidebarContentRecipe = recipe(
  {
    base: {
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      minWidth: 0,
    },
    variants: {
      flex: {
        true: {
          flex: 1,
          minHeight: 0,
        },
      },
      collapseBehavior: {
        none: {},
        clip: {
          whiteSpace: 'nowrap',
          selectors: {
            '& > *': {
              flexShrink: 0,
              whiteSpace: 'nowrap',
            },
          },
        },
        fade: {
          whiteSpace: 'nowrap',
          transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
          selectors: {
            '& > *': {
              flexShrink: 0,
              whiteSpace: 'nowrap',
            },
            [collapsedHeaderSelector]: {
              opacity: 0,
              pointerEvents: 'none',
            },
          },
        },
        collapse: {
          whiteSpace: 'nowrap',
          transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
          selectors: {
            '& > *': {
              flexShrink: 0,
              whiteSpace: 'nowrap',
            },
            [collapsedHeaderSelector]: {
              opacity: 0,
              pointerEvents: 'none',
              maxHeight: 0,
              transition: `opacity ${vars.duration.fast} ${vars.ease.default}, max-height 0s linear ${vars.duration.fast}`,
            },
          },
        },
      },
    },
    defaultVariants: {
      collapseBehavior: 'clip',
    },
  },
  'sidebar-content',
);

type SidebarContentVariants = RecipeVariants<typeof sidebarContentRecipe>;

interface SidebarContentProps extends ElementProps<HTMLDivElement> {
  /**
   * Whether the content wrapper expands to fill available vertical space (`flex: 1`).
   */
  flex?: SidebarContentVariants['flex'];
  /**
   * Strategy for handling content when the sidebar is visually collapsed:
   * - `'clip'`: Content maintains its natural layout width without wrapping or shrinking, clipped cleanly by the sidebar boundary.
   * - `'fade'`: Content smoothly fades out when the sidebar collapses.
   * - `'collapse'`: Content smoothly fades out and collapses its height when the sidebar collapses.
   * - `'none'`: Default layout flow without collapse constraints.
   * @default 'clip'
   */
  collapseBehavior?: SidebarContentVariants['collapseBehavior'];
  children?: React.ReactNode;
}

function SidebarContent({
  flex,
  collapseBehavior = 'clip',
  className,
  children,
  ref,
  ...props
}: SidebarContentProps): React.JSX.Element {
  const classes = sidebarContentRecipe({ flex, collapseBehavior });
  return (
    <div ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </div>
  );
}

SidebarContent.displayName = 'Sidebar.Content';

const sidebarHoverZoneRecipe = recipe(
  {
    base: {
      boxSizing: 'border-box',
      zIndex: 35,
    },
    variants: {
      variant: {
        edge: {
          position: 'fixed',
          top: 0,
          bottom: 0,
        },
        gutter: {
          height: '100%',
        },
        inline: {},
      },
      position: {
        left: {
          left: 0,
        },
        right: {
          right: 0,
        },
      },
    },
    defaultVariants: {
      variant: 'edge',
      position: 'left',
    },
  },
  'sidebar-hover-zone',
);

type SidebarHoverZoneVariants = RecipeVariants<typeof sidebarHoverZoneRecipe>;

export interface SidebarHoverZoneProps extends ElementProps<HTMLDivElement> {
  /**
   * Layout presentation variant:
   * - `'edge'`: Fixed to the screen or frame edge matching position.
   * - `'gutter'`: Normal block element that fills height.
   * - `'inline'`: Zero-styling trigger wrapper.
   * @default 'edge'
   */
  variant?: SidebarHoverZoneVariants['variant'];
  /**
   * Dock position override (`'left'` or `'right'`).
   * If omitted, inherits from SidebarProvider.
   * @default 'left'
   */
  position?: SidebarVariants['position'];
  /**
   * Custom width override (e.g. `'16px'`, `'240px'`).
   */
  width?: string;
  children?: React.ReactNode;
}

/**
 * A hover zone for expanding the sidebar on hover.
 */
function SidebarHoverZone({
  variant = 'edge',
  position: positionProp,
  width,
  className,
  style: styleProp,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  ...props
}: SidebarHoverZoneProps): React.JSX.Element {
  const {
    position: positionContext,
    hoverBehaviour,
    visuallyCollapsed,
    hoverTargetProps,
  } = useSidebar();
  const position = positionProp ?? positionContext ?? 'left';

  const classes = sidebarHoverZoneRecipe({
    variant,
    position,
  });

  const customStyle = useMemo((): React.CSSProperties | undefined => {
    if (!width && !styleProp) return undefined;
    return {
      ...(width ? { width } : {}),
      ...styleProp,
    };
  }, [width, styleProp]);

  const isEnabled = hoverBehaviour === 'expand';

  return (
    <div
      ref={ref}
      data-sidebar-hover-zone="true"
      data-visually-collapsed={visuallyCollapsed ? 'true' : 'false'}
      style={customStyle}
      className={cx(classes, className)}
      {...props}
      onPointerEnter={(e) => {
        if (isEnabled) {
          hoverTargetProps.onPointerEnter(e);
        }
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        if (isEnabled) {
          hoverTargetProps.onPointerLeave(e);
        }
        onPointerLeave?.(e);
      }}
    >
      {children}
    </div>
  );
}

SidebarHoverZone.displayName = 'Sidebar.HoverZone';

function SidebarCombined({
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
  hoverLeaveDelay,
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
      hoverLeaveDelay={hoverLeaveDelay}
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

function SidebarSmartRoot(props: SidebarProps): React.JSX.Element {
  const context = use(SidebarContext);
  const hasProviderProps =
    props.collapsed !== undefined ||
    props.defaultCollapsed !== undefined ||
    props.onCollapsedChange !== undefined ||
    props.hoverBehaviour !== undefined ||
    props.hoverLeaveDelay !== undefined;

  if (context && !hasProviderProps) {
    return <SidebarRoot {...props} />;
  }
  return <SidebarCombined {...props} />;
}
SidebarSmartRoot.displayName = 'Sidebar.Root';

export {
  SidebarSmartRoot as Root,
  SidebarProvider as Provider,
  SidebarToggle as Toggle,
  SidebarHeader as Header,
  SidebarContent as Content,
  SidebarFooter as Footer,
  SidebarHoverZone as HoverZone,
};

export type {
  SidebarProps as RootProps,
  SidebarProviderProps as ProviderProps,
  SidebarToggleProps as ToggleProps,
  SidebarHeaderProps as HeaderProps,
  SidebarContentProps as ContentProps,
  SidebarFooterProps as FooterProps,
  SidebarHoverZoneProps as HoverZoneProps,
  SidebarHoverZoneVariants as HoverZoneVariants,
  SidebarContentVariants,
  SidebarVariants as RootVariants,
  SidebarVariants as ContentVariants,
  SidebarType,
  SidebarVariant,
  SidebarPosition,
  SidebarHoverBehavior,
  SidebarLevel,
};
