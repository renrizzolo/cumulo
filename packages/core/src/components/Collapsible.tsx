'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  useMemo,
  useEffect,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { recipe, style, cx } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Button, type ButtonProps } from './Button.js';
import { usePartsRegistry } from '../hooks/usePartsRegistry.js';

export type CollapsiblePart = 'trigger' | 'content';

export interface CollapsibleContextValue {
  id: string;
  open: boolean;
  onOpenToggle: () => void;
  disabled: boolean;
  contentId: string;
  triggerId: string;
  registerPart: (part: CollapsiblePart, id: string) => () => void;
}

export const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export const useCollapsibleContext = (): CollapsibleContextValue => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsibleContext must be used within a Collapsible.Root');
  }
  return context;
};

export const useCollapsible = useCollapsibleContext;

/* -------------------------------------------------------------------------------------------------
 * CollapsibleRoot
 * -----------------------------------------------------------------------------------------------*/

export interface CollapsibleProps extends ElementProps<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
}

const collapsibleRootStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

export function CollapsibleRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  id: providedId,
  className,
  children,
  ref,
  ...props
}: CollapsibleProps): React.JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const generatedId = useId();
  const id = providedId || generatedId;
  const { registerPart, parts } = usePartsRegistry<CollapsiblePart>();

  const triggerId = parts.trigger || `${id}-trigger`;
  const contentId = parts.content || `${id}-content`;

  const onOpenToggle = useCallback(() => {
    if (disabled) return;
    const nextOpen = !open;
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }, [disabled, isControlled, onOpenChange, open]);

  const contextValue = useMemo<CollapsibleContextValue>(
    () => ({
      id,
      open,
      onOpenToggle,
      disabled,
      contentId,
      triggerId,
      registerPart,
    }),
    [id, open, onOpenToggle, disabled, contentId, triggerId, registerPart],
  );

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <div
        ref={ref}
        id={id}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        className={cx(collapsibleRootStyle, className)}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CollapsibleTrigger
 * -----------------------------------------------------------------------------------------------*/

export type CollapsibleTriggerProps = ButtonProps;

export function CollapsibleTrigger({
  id: providedId,
  children,
  onClick,
  className,
  ref,
  variant = 'ghost',
  'aria-controls': ariaControls,
  ...props
}: CollapsibleTriggerProps): React.JSX.Element {
  const { open, onOpenToggle, disabled, contentId, triggerId, registerPart } =
    useCollapsibleContext();
  const id = providedId || triggerId;

  useEffect(() => {
    if (providedId) {
      return registerPart('trigger', providedId);
    }
  }, [providedId, registerPart]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        onOpenToggle();
      }
    },
    [onClick, onOpenToggle],
  );

  return (
    <Button
      ref={ref}
      id={id}
      type="button"
      variant={variant}
      aria-expanded={open}
      aria-controls={ariaControls || contentId}
      aria-disabled={disabled || undefined}
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CollapsibleContent
 * -----------------------------------------------------------------------------------------------*/

export interface CollapsibleContentProps extends ElementProps<HTMLElement> {
  children?: ReactNode;
  innerClassName?: string;
}

export const collapsibleContentRecipe = recipe(
  {
    base: {
      display: 'grid',
      gridTemplateRows: '0fr',
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
  'collapsible-content',
);

const collapsibleInnerStyle = style({
  minHeight: 0,
  overflow: 'hidden',
});

export function CollapsibleContent({
  id: providedId,
  children,
  className,
  innerClassName,
  ref,
  'aria-labelledby': ariaLabelledby,
  ...props
}: CollapsibleContentProps): React.JSX.Element {
  const { open, contentId, triggerId, registerPart } = useCollapsibleContext();
  const id = providedId || contentId;

  useEffect(() => {
    if (providedId) {
      return registerPart('content', providedId);
    }
  }, [providedId, registerPart]);

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={ariaLabelledby || triggerId}
      data-state={open ? 'open' : 'closed'}
      className={cx(collapsibleContentRecipe({ open }), className)}
      {...props}
    >
      <div className={cx(collapsibleInnerStyle, innerClassName)}>{children}</div>
    </section>
  );
}

CollapsibleRoot.displayName = 'Collapsible.Root';
CollapsibleTrigger.displayName = 'Collapsible.Trigger';
CollapsibleContent.displayName = 'Collapsible.Content';

export const Collapsible = Object.assign(CollapsibleRoot, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
});
