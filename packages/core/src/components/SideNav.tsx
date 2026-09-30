'use client';

import React, { useEffect } from 'react';
import { recipe, style, cx, createThemeContract, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { useSidebar } from '../hooks/useSidebar.js';
import { focusRing, focusRingStyles } from '../intents.js';
import { CollapsibleRoot, CollapsibleContent, useCollapsibleContext } from './Collapsible.js';
import { TooltipRoot, TooltipTrigger, TooltipContent } from './Tooltip.js';

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

const collapsedSelector =
  '[data-collapsed="true"]:not([data-hover-behavior="expand"]:not([data-hover-suppressed="true"]):hover):not([data-hover-behavior="expand"]:not([data-hover-suppressed="true"]):focus-within) &';

export const sideNavItemRecipe = recipe(
  {
    extend: [focusRing],
    base: {
      display: 'flex',
      alignItems: 'center',
      gap: vars.spacing.xs,
      width: '100%',
      height: vars.size.sm,
      minWidth: vars.size.sm,
      boxSizing: 'border-box',
      ...sideNavContract.$set({
        itemPadding: vars.spacing.xs,
        itemRadius: vars.radius.md,
      }),
      paddingInline: sideNavContract.itemPadding,
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
        [collapsedSelector]: {
          width: 'max-content',
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
    [collapsedSelector]: {
      opacity: 0,
      transform: 'translateX(-8px)',
      pointerEvents: 'none',
      width: 0,
      flex: '0 0 0px',
    },
  },
});

const itemBadgeStyle = style({
  marginLeft: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  opacity: 1,
  transform: 'scale(1)',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, transform ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    [collapsedSelector]: {
      opacity: 0,
      transform: 'scale(0.8)',
      pointerEvents: 'none',
      width: 0,
      overflow: 'hidden',
      flex: '0 0 0px',
    },
  },
});

const itemFallbackDotStyle = style({
  width: '6px',
  height: '6px',
  borderRadius: vars.radius.full,
  backgroundColor: 'currentColor',
  opacity: 0.6,
  flexShrink: 0,
});

const itemFallbackContainerStyle = style({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%,-50%)',
  // width: '20px',
  // height: '20px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  opacity: 0,
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    [collapsedSelector]: {
      opacity: 1,
      transitionDelay: vars.duration.snappy,
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
   * If not specified, tooltips are automatically displayed when the sidebar has `hoverBehaviour="tooltip"`.
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
  const { collapsed, hoverBehaviour, position } = useSidebar();

  const showTooltip =
    tooltip !== undefined ? Boolean(tooltip) : hoverBehaviour === 'tooltip' && collapsed;

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
        <span className={itemFallbackContainerStyle.className}>
          <span className={itemFallbackDotStyle.className} />
        </span>
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
    </>
  );

  const Component = CustomComponent || (href || to ? 'a' : 'button');

  if (showTooltip && tooltipContent) {
    return (
      <TooltipRoot>
        <TooltipTrigger
          as={Component}
          ref={ref}
          href={href || to}
          to={to}
          type={Component === 'button' ? 'button' : undefined}
          data-active={active ? 'true' : 'false'}
          data-disabled={disabled ? 'true' : undefined}
          aria-current={active ? 'page' : undefined}
          aria-disabled={disabled || undefined}
          title={resolvedTitle}
          className={cx(sideNavItemRecipe(), className)}
          {...props}
        >
          {content}
        </TooltipTrigger>
        <TooltipContent placement={position === 'right' ? 'left' : 'right'}>
          {tooltipContent}
        </TooltipContent>
      </TooltipRoot>
    );
  }

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
  padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  minHeight: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box',
  position: 'relative',
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    [collapsedSelector]: {
      color: 'transparent',
      userSelect: 'none',
    },
    [`${collapsedSelector}::after`]: {
      content: '""',
      display: 'block',
      width: '20px',
      height: '1px',
      backgroundColor: vars.surface.border,
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
});

const groupTriggerStyle = style({
  ...focusRingStyles,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: `${vars.spacing.xs} ${vars.spacing.xs}`,
  borderRadius: vars.radius.md,
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.semibold,
  fontFamily: vars.font.sans,
  color: vars.surface.fg,
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  height: vars.size.sm,
  boxSizing: 'border-box',
  transition: `background-color ${vars.duration.fast} ${vars.ease.default}, color ${vars.duration.fast} ${vars.ease.default}`,
  ':hover': {
    backgroundColor: vars.surface.bg.next,
  },
  ':active': {
    transform: 'scale(0.98)',
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

const groupChevronContainerStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: '20px',
  height: '20px',
});

const groupTriggerTitleStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  opacity: 1,
  transform: 'translateX(0)',
  minWidth: 0,
  flex: 1,
  marginRight: vars.spacing.xs,
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}, transform ${vars.duration.fast} ${vars.ease.default}, margin-right ${vars.duration.normal} ${vars.ease.default}`,
  selectors: {
    [collapsedSelector]: {
      opacity: 0,
      transform: 'translateX(-8px)',
      pointerEvents: 'none',
      width: 0,
      flex: '0 0 0px',
      marginRight: 0,
    },
  },
});

const groupTriggerRightStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  marginLeft: 'auto',
  flexShrink: 0,
  opacity: 1,
  transition: `opacity ${vars.duration.fast} ${vars.ease.default}`,
  selectors: {
    [collapsedSelector]: {
      marginLeft: 0,
      gap: 0,
    },
  },
});

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
    [collapsedSelector]: {
      paddingLeft: 0,
      marginLeft: 0,
      borderLeftWidth: 0,
      borderLeftColor: 'transparent',
    },
  },
});

export interface SideNavGroupTriggerProps extends ElementProps<HTMLButtonElement> {
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export function SideNavGroupTrigger({
  id: providedId,
  badge,
  className,
  children,
  onClick,
  ref,
  ...props
}: SideNavGroupTriggerProps): React.JSX.Element {
  const { open, onOpenToggle, disabled, contentId, triggerId, registerPart } =
    useCollapsibleContext();
  const { collapsed, hoverBehaviour, position } = useSidebar();
  const id = providedId || triggerId;

  useEffect(() => {
    if (providedId) {
      return registerPart('trigger', providedId);
    }
  }, [providedId, registerPart]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      onOpenToggle();
    }
  };

  const showTooltip = hoverBehaviour === 'tooltip' && collapsed;

  const triggerContent = (
    <>
      <span className={groupTriggerTitleStyle.className}>{children}</span>
      <span className={groupTriggerRightStyle.className}>
        {badge && <span className={itemBadgeStyle.className}>{badge}</span>}
        <span className={groupChevronContainerStyle.className}>
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
        </span>
      </span>
    </>
  );

  if (showTooltip && typeof children === 'string') {
    return (
      <TooltipRoot>
        <TooltipTrigger
          as="button"
          ref={ref}
          id={id}
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          data-state={open ? 'open' : 'closed'}
          onClick={handleClick}
          className={cx(groupTriggerStyle.className, className)}
          {...props}
        >
          {triggerContent}
        </TooltipTrigger>
        <TooltipContent placement={position === 'right' ? 'left' : 'right'}>
          {children}
        </TooltipContent>
      </TooltipRoot>
    );
  }

  return (
    <button
      ref={ref}
      id={id}
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      data-state={open ? 'open' : 'closed'}
      onClick={handleClick}
      className={cx(groupTriggerStyle.className, className)}
      {...props}
    >
      {triggerContent}
    </button>
  );
}

SideNavGroupTrigger.displayName = 'SideNav.GroupTrigger';

export interface SideNavGroupContentProps extends ElementProps<HTMLElement> {
  children?: React.ReactNode;
}

export function SideNavGroupContent({
  className,
  children,
  ref,
  ...props
}: SideNavGroupContentProps): React.JSX.Element {
  return (
    <CollapsibleContent
      ref={ref}
      className={className}
      innerClassName={groupCollapsibleInnerStyle.className}
      {...props}
    >
      {children}
    </CollapsibleContent>
  );
}

SideNavGroupContent.displayName = 'SideNav.GroupContent';

export interface SideNavGroupProps extends ElementProps<HTMLDivElement> {
  title?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export function SideNavGroup({
  title,
  collapsible = false,
  defaultOpen = true,
  open,
  onOpenChange,
  disabled,
  badge,
  className,
  children,
  ref,
  ...props
}: SideNavGroupProps): React.JSX.Element {
  if (!collapsible) {
    return (
      <div ref={ref} className={cx(groupRootStyle.className, className)} {...props}>
        {title && <div className={groupHeaderStyle.className}>{title}</div>}
        <div className={groupInnerStyle.className}>{children}</div>
      </div>
    );
  }

  return (
    <CollapsibleRoot
      ref={ref}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      className={cx(groupRootStyle.className, className)}
      {...props}
    >
      {title ? (
        <>
          <SideNavGroupTrigger badge={badge}>{title}</SideNavGroupTrigger>
          <SideNavGroupContent>{children}</SideNavGroupContent>
        </>
      ) : (
        children
      )}
    </CollapsibleRoot>
  );
}

SideNavGroup.displayName = 'SideNav.Group';

export const SideNav = Object.assign(SideNavRoot, {
  Root: SideNavRoot,
  Item: SideNavItem,
  Group: Object.assign(SideNavGroup, {
    Trigger: SideNavGroupTrigger,
    Content: SideNavGroupContent,
  }),
  GroupTrigger: SideNavGroupTrigger,
  GroupContent: SideNavGroupContent,
});
