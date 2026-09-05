'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { focusRing } from '../intents.js';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsVariant = 'line' | 'pill' | 'bordered';

export interface TabsContextValue {
  id: string;
  value: string;
  setValue: (value: string) => void;
  orientation: TabsOrientation;
  variant: TabsVariant;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabsContext = (): TabsContextValue => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a Tabs.Root');
  }
  return context;
};

export const useTabs = useTabsContext;

/* -------------------------------------------------------------------------------------------------
 * TabsRoot
 * -----------------------------------------------------------------------------------------------*/

export const tabsRootRecipe = recipe(
  {
    base: {
      display: 'flex',
      width: '100%',
    },
    variants: {
      orientation: {
        horizontal: {
          flexDirection: 'column',
        },
        vertical: {
          flexDirection: 'row',
          gap: vars.spacing.md,
        },
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
  'tabs-root',
);

export interface TabsProps extends ElementProps<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  variant?: TabsVariant;
  children?: ReactNode;
}

export function TabsRoot({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  variant = 'line',
  id: providedId,
  className,
  children,
  ref,
  ...props
}: TabsProps): React.JSX.Element {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const generatedId = useId();
  const id = providedId || generatedId;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      id,
      value,
      setValue,
      orientation,
      variant,
    }),
    [id, value, setValue, orientation, variant],
  );

  const classes = tabsRootRecipe({ orientation });

  return (
    <TabsContext.Provider value={contextValue}>
      <div ref={ref} id={id} className={cx(classes, className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TabsList
 * -----------------------------------------------------------------------------------------------*/

export const tabsListRecipe = recipe(
  {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: vars.spacing['3xs'],
      boxSizing: 'border-box',
    },
    variants: {
      variant: {
        line: {
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: vars.surface.border,
        },
        pill: {
          padding: vars.spacing['xs'],
          backgroundColor: vars.surface.secondary.DEFAULT,
          borderRadius: vars.radius.lg,
        },
        bordered: {
          padding: vars.spacing['xs'],
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
          borderRadius: vars.radius.lg,
          backgroundColor: vars.surface.bg.DEFAULT,
        },
      },
      orientation: {
        horizontal: {
          flexDirection: 'row',
        },
        vertical: {
          flexDirection: 'column',
          alignItems: 'stretch',
        },
      },
    },
    defaultVariants: {
      variant: 'line',
      orientation: 'horizontal',
    },
  },
  'tabs-list',
);

export function TabsList({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLDivElement>): React.JSX.Element {
  const { orientation, variant } = useTabsContext();
  const classes = tabsListRecipe({ orientation, variant });

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TabsTrigger (TabsTab)
 * -----------------------------------------------------------------------------------------------*/

export const tabsTriggerRecipe = recipe(
  {
    extend: [focusRing],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: vars.font.sans,
      fontSize: vars.font.size.sm,
      fontWeight: vars.font.weight.medium,
      padding: `${vars.spacing.xs} ${vars.spacing.md}`,
      color: vars.surface.muted,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      userSelect: 'none',
      transition: `all ${vars.duration.fast} ${vars.ease.default}`,
      textDecoration: 'none',
      position: 'relative',
      ':hover': {
        color: vars.surface.fg,
      },
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    variants: {
      variant: {
        line: {
          borderRadius: 0,
          borderBottomWidth: 2,
          borderBottomStyle: 'solid',
          borderBottomColor: 'transparent',
          marginBottom: '-1px',
        },
        pill: {
          borderRadius: vars.radius.md,
        },
        bordered: {
          borderRadius: vars.radius.md,
        },
      },
      selected: {
        true: {
          color: vars.surface.fg,
          fontWeight: vars.font.weight.semibold,
        },
        false: {},
      },
    },
    compoundVariants: [
      {
        variants: { variant: 'line', selected: true },
        style: {
          borderBottomColor: vars.primary.DEFAULT,
          color: vars.primary.DEFAULT,
        },
      },
      {
        variants: { variant: 'pill', selected: true },
        style: {
          backgroundColor: vars.surface.bg.DEFAULT,
          boxShadow: vars.shadow['0'],
        },
      },
      {
        variants: { variant: 'bordered', selected: true },
        style: {
          backgroundColor: vars.surface.secondary.DEFAULT,
          boxShadow: vars.shadow['0'],
        },
      },
    ],
    defaultVariants: {
      variant: 'line',
      selected: false,
    },
  },
  'tabs-trigger',
);

export type TabsTriggerVariants = RecipeVariants<typeof tabsTriggerRecipe>;

export interface TabsTriggerProps extends ElementProps<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

export function TabsTrigger({
  value: tabValue,
  disabled = false,
  className,
  children,
  onClick,
  onKeyDown,
  ref,
  ...props
}: TabsTriggerProps): React.JSX.Element {
  const { id: rootId, value, setValue, variant, orientation } = useTabsContext();
  const isSelected = value === tabValue;

  const tabId = `${rootId}-tab-${tabValue}`;
  const panelId = `${rootId}-panel-${tabValue}`;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) {
        setValue(tabValue);
      }
    },
    [disabled, onClick, setValue, tabValue],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;

      const target = event.currentTarget;
      const tablist = target.closest('[role="tablist"]');
      if (!tablist) return;

      const tabs = Array.from(
        tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
      );
      const currentIndex = tabs.indexOf(target);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      if (orientation === 'horizontal') {
        if (event.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }
      } else {
        if (event.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }
      }

      if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== currentIndex) {
        event.preventDefault();
        const nextTab = tabs[nextIndex];
        nextTab?.focus();
        nextTab?.click();
      }
    },
    [disabled, onKeyDown, orientation],
  );

  const classes = tabsTriggerRecipe({
    variant,
    selected: isSelected,
  });

  return (
    <button
      ref={ref}
      id={tabId}
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TabsContent (TabsPanel)
 * -----------------------------------------------------------------------------------------------*/

const tabsContentStyle = style({
  outline: 'none',
  paddingTop: vars.spacing.md,
});

export interface TabsContentProps extends ElementProps<HTMLDivElement> {
  value: string;
  children?: ReactNode;
}

export function TabsContent({
  value: panelValue,
  className,
  children,
  ref,
  ...props
}: TabsContentProps): React.JSX.Element | null {
  const { id: rootId, value } = useTabsContext();
  const isSelected = value === panelValue;

  const tabId = `${rootId}-tab-${panelValue}`;
  const panelId = `${rootId}-panel-${panelValue}`;

  if (!isSelected) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      className={cx(tabsContentStyle, className)}
      {...props}
    >
      {children}
    </div>
  );
}

TabsRoot.displayName = 'Tabs.Root';
TabsList.displayName = 'Tabs.List';
TabsTrigger.displayName = 'Tabs.Trigger';
TabsContent.displayName = 'Tabs.Content';

export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Tab: TabsTrigger,
  Content: TabsContent,
  Panel: TabsContent,
});
