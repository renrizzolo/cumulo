'use client';

import React, { type ReactNode } from 'react';
import type { ElementProps } from '../ElementProps.js';
import * as Popover from './Popover.js';
import { usePopover, type PopoverContextValue } from './Popover.js';

export type TooltipContextValue = PopoverContextValue;

export const useTooltip = usePopover;

/* -------------------------------------------------------------------------------------------------
 * TooltipRoot
 * -----------------------------------------------------------------------------------------------*/

interface TooltipProps extends Popover.RootProps {
  /**
   * Whether the tooltip is currently open (controlled).
   */
  open?: boolean;
  /**
   * Whether the tooltip is open by default (uncontrolled).
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Delay in milliseconds before opening the tooltip on hover or focus.
   * @default 0
   */
  delay?: number;
  /**
   * Custom identifier for linking anchor positioning and accessibility attributes.
   */
  id?: string;
  /**
   * Tooltip children, typically containing `<Tooltip.Trigger>` and `<Tooltip.Content>`.
   */
  children?: ReactNode;
}

function TooltipRoot(props: TooltipProps): React.JSX.Element {
  return <Popover.Root {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * TooltipTrigger
 * -----------------------------------------------------------------------------------------------*/

interface TooltipTriggerProps extends Omit<Popover.TriggerProps, 'trigger'> {}

function TooltipTrigger(props: TooltipTriggerProps): React.JSX.Element {
  return <Popover.Trigger trigger="hover" {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * TooltipContent
 * -----------------------------------------------------------------------------------------------*/

type TooltipVariants = {
  placement?: Popover.ContentVariants['placement'];
};

interface TooltipContentProps extends Omit<ElementProps<HTMLDivElement>, 'role' | 'popover'> {
  /**
   * Placement direction of the tooltip relative to its trigger anchor.
   * @default 'top'
   */
  placement?: Popover.ContentVariants['placement'];
  /**
   * Tooltip overlay content.
   */
  children?: ReactNode;
}

function TooltipContent({
  placement = 'top',
  className,
  children,
  ...props
}: TooltipContentProps): React.JSX.Element {
  return (
    <Popover.Content variant="tooltip" placement={placement} className={className} {...props}>
      {children}
    </Popover.Content>
  );
}

TooltipRoot.displayName = 'Tooltip.Root';
TooltipTrigger.displayName = 'Tooltip.Trigger';
TooltipContent.displayName = 'Tooltip.Content';

export { TooltipRoot as Root, TooltipTrigger as Trigger, TooltipContent as Content };

export type {
  TooltipProps as RootProps,
  TooltipTriggerProps as TriggerProps,
  TooltipContentProps as ContentProps,
  TooltipVariants as ContentVariants,
};
