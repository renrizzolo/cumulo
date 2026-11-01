'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useId,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Stack } from './Stack.js';
import { focusRing } from '../intents.js';
import { Panel } from './Panel.js';
import {
  useValueGroup,
  createTypedCompound,
  type ValueGroupProps,
  type ValueItemProps,
  type ValueGroupContextBase,
} from '../hooks/useValueGroup.js';

type TabsOrientation = 'horizontal' | 'vertical';
type TabsVariant = 'line' | 'pill' | 'bordered';

export interface TabsContextValue<T extends string = string> extends ValueGroupContextBase<T> {
  id: string;
  orientation: TabsOrientation;
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabs = (): TabsContextValue => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs.Root');
  }
  return context;
};

/* -------------------------------------------------------------------------------------------------
 * TabsRoot
 * -----------------------------------------------------------------------------------------------*/

interface TabsProps<T extends string = string>
  extends Omit<ElementProps<HTMLDivElement>, 'defaultValue' | 'onChange'>, ValueGroupProps<T> {
  orientation?: TabsOrientation;
  variant?: TabsVariant;
  children?: ReactNode;
}

function TabsRoot<T extends string = string>({
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  variant = 'line',
  id: providedId,
  className,
  children,
  ref,
  ...props
}: TabsProps<T>): React.JSX.Element {
  const { value, setValue } = useValueGroup<T>({
    value: controlledValue,
    defaultValue,
    onValueChange,
  });

  const generatedId = useId();
  const id = providedId || generatedId;

  const contextValue = useMemo(
    (): TabsContextValue<T> => ({
      id,
      value,
      setValue,
      orientation,
      variant,
    }),
    [id, value, setValue, orientation, variant],
  );

  const isVertical = orientation === 'vertical';

  return (
    <TabsContext.Provider value={contextValue}>
      <Stack
        ref={ref}
        id={id}
        data-orientation={orientation}
        direction={isVertical ? 'row' : 'column'}
        gap={isVertical ? 'md' : 'none'}
        align={isVertical ? 'start' : 'stretch'}
        className={className}
        {...props}
      >
        {children}
      </Stack>
    </TabsContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TabsList
 * -----------------------------------------------------------------------------------------------*/

const tabsListRecipe = recipe(
  {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: vars.spacing['3xs'],
      boxSizing: 'border-box',
    },
    variants: {
      variant: {
        line: {},
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
          alignItems: 'start',
        },
      },
    },
    compoundVariants: [
      {
        variants: { variant: 'line', orientation: 'horizontal' },
        style: {
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: vars.surface.border,
        },
      },
      {
        variants: { variant: 'line', orientation: 'vertical' },
        style: {
          borderLeftWidth: 1,
          borderLeftStyle: 'solid',
          borderLeftColor: vars.surface.border,
        },
      },
    ],
    defaultVariants: {
      variant: 'line',
      orientation: 'horizontal',
    },
  },
  'tabs-list',
);

function TabsList({
  className,
  children,
  ref,
  ...props
}: ElementProps<HTMLDivElement>): React.JSX.Element {
  const { orientation, variant } = useTabs();
  const classes = tabsListRecipe({ orientation, variant });

  return (
    <Panel
      scrollbar="thin"
      overflow={orientation === 'vertical' ? 'y' : 'x'}
      direction={orientation === 'vertical' ? 'column' : 'row'}
      ref={ref}
      role="tablist"
      divider={false}
      aria-orientation={orientation}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </Panel>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TabsTrigger (TabsTab)
 * -----------------------------------------------------------------------------------------------*/

const tabsTriggerRecipe = recipe(
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
        },
        pill: {
          borderRadius: vars.radius.md,
        },
        bordered: {
          borderRadius: vars.radius.md,
        },
      },
      orientation: {
        horizontal: {},
        vertical: {
          width: '100%',
        },
      },
      selected: {
        true: {
          fontWeight: vars.font.weight.semibold,
        },
        false: {},
      },
    },
    compoundVariants: [
      {
        variants: { variant: 'line', orientation: 'horizontal' },
        style: {
          borderBottomWidth: 2,
          borderBottomStyle: 'solid',
          borderBottomColor: 'transparent',
        },
      },
      {
        variants: { variant: 'line', orientation: 'horizontal', selected: true },
        style: {
          borderBottomColor: vars.primary.DEFAULT,
          color: vars.primary.DEFAULT,
        },
      },
      {
        variants: { variant: 'line', orientation: 'vertical' },
        style: {
          width: '100%',
          justifyContent: 'flex-start',
          borderLeftWidth: 2,
          borderLeftStyle: 'solid',
          borderLeftColor: 'transparent',
        },
      },
      {
        variants: { variant: 'line', orientation: 'vertical', selected: true },
        style: {
          borderLeftColor: vars.primary.DEFAULT,
          color: vars.primary.DEFAULT,
        },
      },

      {
        variants: { variant: 'pill', selected: true },
        style: {
          color: vars.surface.fg,
          backgroundColor: vars.surface.bg.DEFAULT,
          boxShadow: vars.shadow['0'],
        },
      },
      {
        variants: { variant: 'bordered', selected: true },
        style: {
          color: vars.surface.fg,
          backgroundColor: vars.surface.secondary.DEFAULT,
          boxShadow: vars.shadow['0'],
        },
      },
      {
        variants: { variant: 'pill', orientation: 'vertical' },
        style: {
          width: '100%',
        },
      },
    ],
    defaultVariants: {
      variant: 'line',
      orientation: 'horizontal',
      selected: false,
    },
  },
  'tabs-trigger',
);

type TabsTriggerVariants = RecipeVariants<typeof tabsTriggerRecipe>;

interface TabsTriggerProps<T extends string = string>
  extends Omit<ElementProps<HTMLButtonElement>, 'value' | 'defaultValue'>, ValueItemProps<T> {
  disabled?: boolean;
  children?: ReactNode;
}

function TabsTrigger<T extends string = string>({
  value: tabValue,
  disabled = false,
  className,
  children,
  onClick,
  onKeyDown,
  ref,
  ...props
}: TabsTriggerProps<T>): React.JSX.Element {
  const { id: rootId, value, setValue, variant, orientation } = useTabs();
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
    orientation,
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

const tabsContentRecipe = recipe(
  {
    base: {
      outline: 'none',
    },
    variants: {
      orientation: {
        horizontal: {
          paddingTop: vars.spacing.md,
        },
        vertical: {
          paddingTop: 0,
          flex: 1,
        },
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
  'tabs-content',
);

type TabsContentVariants = RecipeVariants<typeof tabsContentRecipe>;

interface TabsContentProps<T extends string = string>
  extends Omit<ElementProps<HTMLDivElement>, 'defaultValue'>, ValueItemProps<T> {
  /**
   * Whether to keep the tab panel mounted in the DOM when inactive (using `hidden`).
   * @default false
   */
  keepMounted?: boolean;
  children?: ReactNode;
}

function TabsContent<T extends string = string>({
  value: panelValue,
  keepMounted = false,
  className,
  children,
  ref,
  ...props
}: TabsContentProps<T>): React.JSX.Element | null {
  const { id: rootId, value, orientation } = useTabs();
  const isSelected = value === panelValue;

  const tabId = `${rootId}-tab-${panelValue}`;
  const panelId = `${rootId}-panel-${panelValue}`;

  if (!isSelected && !keepMounted) {
    return null;
  }

  const classes = tabsContentRecipe({ orientation });

  return (
    <div
      ref={ref}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={isSelected ? 0 : -1}
      hidden={!isSelected ? true : undefined}
      className={cx(classes, className)}
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

type TabsListProps = ElementProps<HTMLDivElement>;

export interface TypedTabs<T extends string> {
  Root: (props: TabsProps<T>) => React.JSX.Element;
  List: (props: TabsListProps) => React.JSX.Element;
  Trigger: (props: TabsTriggerProps<T>) => React.JSX.Element;
  Content: (props: TabsContentProps<T>) => React.JSX.Element | null;
}

/**
 * Creates a strictly typed `Tabs` (`{ Root, List, Trigger, Content }`) constrained to value union `T`.
 */
export function createTabs<T extends string>(): TypedTabs<T> {
  return createTypedCompound({
    Root: TabsRoot,
    List: TabsList,
    Trigger: TabsTrigger,
    Content: TabsContent,
  });
}

export {
  TabsRoot as Root,
  TabsList as List,
  TabsTrigger as Trigger,
  TabsContent as Content,
  createTabs as create,
};

export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  TabsProps as RootProps,
  TabsListProps as ListProps,
  TabsTriggerProps as TriggerProps,
  TabsContentProps as ContentProps,
  TabsTriggerVariants as TriggerVariants,
  TabsContentVariants as ContentVariants,
  TabsOrientation,
  TabsVariant,
};
