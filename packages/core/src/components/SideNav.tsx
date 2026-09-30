'use client';

import React, { useState, useCallback, useId } from 'react';
import { recipe, style, cx, createThemeContract, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { useSidebar } from '../hooks/useSidebar.js';

export const sideNavContract = createThemeContract(
  {
    itemPadding: null,
    itemRadius: null,
  },
  'sidenav',
);

export const sideNavRecipe = recipe(
  {
    base: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      gap: vars.spacing['2xs'],
      boxSizing: 'border-box',
    },
  },
  'sidenav',
);

export type SideNavVariants = RecipeVariants<typeof sideNavRecipe>;

export interface SideNavProps extends ElementProps<HTMLElement> {
  'aria-label'?: string;
  children?: React.ReactNode;
}

export function SideNavRoot({
  'aria-label': ariaLabel = 'Sidebar navigation',
  className,
  children,
  ref,
  ...props
}: SideNavProps): React.JSX.Element {
  return (
    <nav ref={ref} aria-label={ariaLabel} className={cx(sideNavRecipe(), className)} {...props}>
      {children}
    </nav>
  );
}

SideNavRoot.displayName = 'SideNav';

/* -------------------------------------------------------------------------------------------------
 * SideNavItem
 * -----------------------------------------------------------------------------------------------*/

export const sideNavItemRecipe = recipe(
  {
    base: {
      display: 'flex',
      alignItems: 'center',
      gap: vars.spacing.xs,
      width: '100%',
      boxSizing: 'border-box',
      ...sideNavContract.$set({
        itemPadding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        itemRadius: vars.radius.md,
      }),
      padding: sideNavContract.itemPadding,
      borderRadius: sideNavContract.itemRadius,
      fontSize: vars.font.size.sm,
      fontWeight: vars.font.weight.normal,
      fontFamily: vars.font.sans,
      color: vars.surface.fg,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      textDecoration: 'none',
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}`,
      position: 'relative',
      ':hover': {
        backgroundColor: vars.surface.bg.next,
        color: vars.surface.fg,
      },
      ':focus-visible': {
        outline: `2px solid ${vars.primary.focus}`,
        outlineOffset: '2px',
      },
      selectors: {
        '&[data-active="true"]': {
          backgroundColor: vars.surface.bg.next,
          color: vars.primary.DEFAULT,
          fontWeight: vars.font.weight.semibold,
        },
        '&[data-disabled="true"]': {
          opacity: 0.5,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
        '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
          {
            justifyContent: 'center',
            ...sideNavContract.$set({
              itemPadding: vars.spacing.xs,
            }),
          },
      },
    },
  },
  'sidenav-item',
);

const itemIconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: '20px',
  height: '20px',
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        margin: 0,
      },
  },
});

const itemLabelStyle = style({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  opacity: 1,
  transform: 'translateX(0)',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, transform ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        opacity: 0,
        transform: 'translateX(-8px)',
        pointerEvents: 'none',
        flex: '0 0 0px',
        width: 0,
      },
  },
});

const itemBadgeStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  opacity: 1,
  transform: 'scale(1)',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, transform ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        opacity: 0,
        transform: 'scale(0.8)',
        pointerEvents: 'none',
        width: 0,
        overflow: 'hidden',
      },
  },
});

const itemFallbackDotStyle = style({
  width: '6px',
  height: '6px',
  borderRadius: vars.radius.full,
  backgroundColor: 'currentColor',
  opacity: 0,
  transform: 'scale(0)',
  flexShrink: 0,
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, transform ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        opacity: 0.6,
        transform: 'scale(1)',
      },
  },
});

const itemTooltipStyle = style({
  position: 'absolute',
  left: 'calc(100% + 10px)',
  top: '50%',
  transform: 'translateY(-50%) translateX(-4px)',
  display: 'inline-flex',
  alignItems: 'center',
  padding: `${vars.spacing['2xs']} ${vars.spacing.xs}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.surface.fg,
  color: vars.surface.bg.DEFAULT,
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.medium,
  fontFamily: vars.font.sans,
  boxShadow: vars.shadow['2'],
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  zIndex: 1000,
  opacity: 0,
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, transform ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"] :hover > &': {
      opacity: 1,
      transform: 'translateY(-50%) translateX(0)',
    },
    '[data-collapsed="true"] :focus-visible > &': {
      opacity: 1,
      transform: 'translateY(-50%) translateX(0)',
    },
    '[data-position="right"] &': {
      left: 'auto',
      right: 'calc(100% + 10px)',
      transform: 'translateY(-50%) translateX(4px)',
    },
    '[data-position="right"][data-collapsed="true"] :hover > &': {
      transform: 'translateY(-50%) translateX(0)',
    },
    '[data-position="right"][data-collapsed="true"] :focus-visible > &': {
      transform: 'translateY(-50%) translateX(0)',
    },
    '[data-expand-on-hover="true"]:hover &': {
      display: 'none',
    },
  },
});

export interface SideNavItemProps extends ElementProps<HTMLElement> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  title?: string;
  badge?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  to?: string;
  as?: React.ElementType;
  /**
   * Tooltip display when the sidebar is collapsed:
   * - `true`: displays the item's label (or title) as a floating tooltip when collapsed.
   * - `false`: suppresses tooltip when collapsed.
   * - `React.ReactNode`: custom tooltip content.
   * If not specified, tooltips are automatically displayed when the sidebar has `collapsedHoverBehavior="tooltip"`.
   */
  tooltip?: boolean | React.ReactNode;
  children?: React.ReactNode;
}

export function SideNavItem({
  icon,
  label,
  badge,
  active = false,
  disabled = false,
  href,
  to,
  as: CustomComponent,
  className,
  children,
  title,
  tooltip,
  ref,
  ...props
}: SideNavItemProps): React.JSX.Element {
  const { collapsed, collapsedHoverBehavior } = useSidebar();

  const showTooltip =
    tooltip !== undefined ? Boolean(tooltip) : collapsedHoverBehavior === 'tooltip' && collapsed;

  const tooltipContent =
    typeof tooltip === 'boolean' || tooltip === undefined ? label || title : tooltip;

  const resolvedTitle = showTooltip
    ? undefined
    : title || (collapsed && typeof label === 'string' ? label : undefined);

  const content = children || (
    <>
      {icon ? (
        <span className={itemIconStyle.className}>{icon}</span>
      ) : (
        <span className={itemFallbackDotStyle.className} />
      )}
      {label && (
        <span data-part="label" className={itemLabelStyle.className}>
          {label}
        </span>
      )}
      {badge && (
        <span data-part="badge" className={itemBadgeStyle.className}>
          {badge}
        </span>
      )}
      {showTooltip && tooltipContent && (
        <span role="tooltip" className={itemTooltipStyle.className}>
          {tooltipContent}
        </span>
      )}
    </>
  );

  const Component = CustomComponent || (href || to ? 'a' : 'button');

  return React.createElement(
    Component,
    {
      ref,
      href: href || to,
      to,
      type: Component === 'button' ? 'button' : undefined,
      'data-active': active ? 'true' : 'false',
      'data-disabled': disabled ? 'true' : undefined,
      'aria-current': active ? 'page' : undefined,
      'aria-disabled': disabled || undefined,
      title: resolvedTitle,
      className: cx(sideNavItemRecipe(), className),
      ...props,
    },
    content,
  );
}

SideNavItem.displayName = 'SideNav.Item';

/* -------------------------------------------------------------------------------------------------
 * SideNavGroup
 * -----------------------------------------------------------------------------------------------*/

const groupRootStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['3xs'],
  width: '100%',
});

const groupHeaderStyle = style({
  fontSize: '11px',
  fontWeight: vars.font.weight.semibold,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: vars.surface.muted,
  padding: `${vars.spacing['2xs']} ${vars.spacing.xs}`,
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  maxHeight: '32px',
  opacity: 1,
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, max-height ${vars.duration.normal} ${vars.ease.default}, padding ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        opacity: 0,
        maxHeight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        pointerEvents: 'none',
      },
  },
});

const groupTriggerStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: `${vars.spacing['2xs']} ${vars.spacing.xs}`,
  borderRadius: vars.radius.md,
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.semibold,
  fontFamily: vars.font.sans,
  color: vars.surface.fg,
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  maxHeight: '36px',
  opacity: 1,
  transition: `background-color ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}, opacity ${vars.duration.fast} ${vars.ease.default}, max-height ${vars.duration.normal} ${vars.ease.default}, padding ${vars.duration.normal} ${vars.ease.default}`,
  ':hover': {
    backgroundColor: vars.surface.bg.next,
  },
  ':focus-visible': {
    outline: `2px solid ${vars.primary.focus}`,
    outlineOffset: '2px',
  },
  selectors: {
    '[data-collapsed="true"]:not([data-expand-on-hover="true"]:hover):not([data-expand-on-hover="true"]:focus-within) &':
      {
        opacity: 0,
        maxHeight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        pointerEvents: 'none',
      },
  },
});

const chevronStyle = style({
  width: '14px',
  height: '14px',
  flexShrink: 0,
  transition: `transform ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(90deg)',
    },
  },
});

const groupTriggerLabelStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
});

const groupContentRecipe = recipe(
  {
    base: {
      display: 'grid',
      gridTemplateRows: '0fr',
      width: '100%',
      boxSizing: 'border-box',
      transition: `grid-template-rows ${vars.duration.normal} ${vars.ease.default}, opacity ${vars.duration.fast} ${vars.ease.default}`,
      opacity: 0,
    },
    variants: {
      open: {
        true: {
          gridTemplateRows: '1fr',
          opacity: 1,
        },
        false: {
          gridTemplateRows: '0fr',
          opacity: 0,
        },
      },
    },
    defaultVariants: {
      open: false,
    },
  },
  'sidenav-group-content',
);

const groupInnerStyle = style({
  minHeight: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box',
  gap: vars.spacing['3xs'],
});

const groupCollapsibleInnerStyle = style({
  minHeight: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box',
  gap: vars.spacing['3xs'],
  paddingLeft: vars.spacing.sm,
  marginLeft: vars.spacing.xs,
  borderLeftWidth: 1,
  borderLeftStyle: 'solid',
  borderLeftColor: vars.surface.border,
  transition: `padding-left ${vars.duration.normal} ${vars.ease.default}, margin-left ${vars.duration.normal} ${vars.ease.default}, border-color ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    '[data-collapsed="true"]:not([data-hover-expanded="true"]) &': {
      paddingLeft: 0,
      marginLeft: 0,
      borderLeftColor: 'transparent',
    },
  },
});

export interface SideNavGroupProps extends ElementProps<HTMLDivElement> {
  title?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export function SideNavGroup({
  title,
  collapsible = false,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  badge,
  className,
  children,
  ref,
  ...props
}: SideNavGroupProps): React.JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const contentId = useId();

  const handleToggle = useCallback(() => {
    const next = !isOpen;
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }, [isOpen, isControlled, onOpenChange]);

  if (!collapsible) {
    return (
      <div ref={ref} className={cx(groupRootStyle.className, className)} {...props}>
        {title && <div className={groupHeaderStyle.className}>{title}</div>}
        <div className={groupInnerStyle.className}>{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cx(groupRootStyle.className, className)} {...props}>
      {title && (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          data-state={isOpen ? 'open' : 'closed'}
          onClick={handleToggle}
          className={groupTriggerStyle.className}
        >
          <span className={groupTriggerLabelStyle.className}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={chevronStyle.className}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>{title}</span>
          </span>
          {badge}
        </button>
      )}
      <div
        id={contentId}
        data-state={isOpen ? 'open' : 'closed'}
        className={groupContentRecipe({ open: isOpen })}
      >
        <div className={groupCollapsibleInnerStyle.className}>{children}</div>
      </div>
    </div>
  );
}

SideNavGroup.displayName = 'SideNav.Group';

export const SideNav = Object.assign(SideNavRoot, {
  Root: SideNavRoot,
  Item: SideNavItem,
  Group: SideNavGroup,
});
