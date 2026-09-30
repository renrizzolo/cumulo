'use client';

import React, { type ReactNode } from 'react';
import type { ElementProps } from '../ElementProps.js';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  usePopoverContext,
  usePopover,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverVariants,
  type PopoverContextValue,
} from './Popover.js';

export type TooltipContextValue = PopoverContextValue;

export const useTooltipContext = usePopoverContext;
export const useTooltip = usePopover;

/* -------------------------------------------------------------------------------------------------
 * TooltipRoot
 * -----------------------------------------------------------------------------------------------*/

export interface TooltipProps extends PopoverProps {
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

export function TooltipRoot(props: TooltipProps): React.JSX.Element {
  return <PopoverRoot {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * TooltipTrigger
 * -----------------------------------------------------------------------------------------------*/

export interface TooltipTriggerProps extends Omit<PopoverTriggerProps, 'trigger'> {}

export function TooltipTrigger(props: TooltipTriggerProps): React.JSX.Element {
  return <PopoverTrigger trigger="hover" {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * TooltipContent
 * -----------------------------------------------------------------------------------------------*/

export type TooltipVariants = {
  placement?: PopoverVariants['placement'];
};

export interface TooltipContentProps extends Omit<
  ElementProps<HTMLDivElement>,
  'role' | 'popover'
> {
  /**
   * Placement direction of the tooltip relative to its trigger anchor.
   * @default 'top'
   */
  placement?: PopoverVariants['placement'];
  /**
   * Tooltip overlay content.
   */
  children?: ReactNode;
}

export function TooltipContent({
  placement = 'top',
  className,
  children,
  ...props
}: TooltipContentProps): React.JSX.Element {
  return (
    <PopoverContent variant="tooltip" placement={placement} className={className} {...props}>
      {children}
    </PopoverContent>
  );
}

TooltipRoot.displayName = 'Tooltip.Root';
TooltipTrigger.displayName = 'Tooltip.Trigger';
TooltipContent.displayName = 'Tooltip.Content';

export const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});
