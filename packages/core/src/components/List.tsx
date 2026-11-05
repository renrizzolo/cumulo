'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { recipe, cx, style, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { gapStyles, type GapVariant } from '../layout.js';

/**
 * Shared base styles for inline marker icons (list bullets, description list term icons).
 */
export const markerIconBase: {
  display: 'inline-flex';
  alignItems: 'center';
  justifyContent: 'center';
  flexShrink: number;
  lineHeight: string;
  userSelect: 'none';
} = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  lineHeight: vars.line.height.none,
  userSelect: 'none',
};

/**
 * Shared `size` variant styles for inline marker icons.
 */
export const markerIconSizes = {
  sm: {
    width: vars.size['3xs'],
    height: vars.size['3xs'],
    fontSize: vars.font.size.sm,
  },
  md: {
    width: vars.size['2xs'],
    height: vars.size['2xs'],
    fontSize: vars.font.size.base,
  },
  lg: {
    width: vars.size.xs,
    height: vars.size.xs,
    fontSize: vars.font.size.lg,
  },
};

export type ListVariant = 'plain' | 'bullet' | 'ordered';

interface ListContextValue {
  variant?: ListVariant;
}

const ListContext = createContext<ListContextValue | null>(null);

const useList = (): ListContextValue => {
  const context = useContext(ListContext);
  return context ?? { variant: 'plain' };
};

const listRecipe = recipe(
  {
    extend: [gapStyles],
    base: {
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      listStyle: 'none',
      fontFamily: vars.font.sans,
    },
    variants: {
      variant: {
        plain: {},
        bullet: {},
        ordered: {
          counterReset: 'cumulo-list-counter',
        },
      },
    },
    defaultVariants: {
      gap: 'sm',
      variant: 'plain',
    },
  },
  'list',
);

const listItemRecipe = recipe(
  {
    extend: [gapStyles],
    base: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      minWidth: 0,
    },
    defaultVariants: {
      gap: 'sm',
    },
  },
  'list-item',
);

const listIconRecipe = recipe(
  {
    base: markerIconBase,
    variants: {
      size: markerIconSizes,
    },
    defaultVariants: {
      size: 'md',
    },
  },
  'list-icon',
);

const bulletDotStyle = style({
  display: 'inline-block',
  width: vars.spacing['2xs'],
  height: vars.spacing['2xs'],
  borderRadius: vars.radius.full,
  backgroundColor: 'currentColor',
});

const orderedCounterStyle = style({
  counterIncrement: 'cumulo-list-counter',
  selectors: {
    '&::before': {
      content: 'counter(cumulo-list-counter) "."',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: vars.font.weight.medium,
      color: vars.surface.muted,
      fontSize: vars.font.size.sm,
      lineHeight: vars.line.height.normal,
    },
  },
});

const listContentStyle = style({
  flex: 1,
  minWidth: 0,
});

export type ListVariants = RecipeVariants<typeof listRecipe>;
export type ListItemVariants = RecipeVariants<typeof listItemRecipe>;
export type ListIconVariants = RecipeVariants<typeof listIconRecipe>;

export interface ListRootBaseProps extends ElementProps<HTMLUListElement> {
  /**
   * Vertical gap spacing between list items.
   * @default 'sm'
   */
  gap?: GapVariant;
  /**
   * Additional CSS class name.
   */
  className?: string;
  /**
   * List items or child elements.
   */
  children?: React.ReactNode;
}

export interface ListRootOrderedProps {
  /**
   * Ordered list with automatic numeric counter markers.
   */
  variant: 'ordered';
}

export interface ListRootDefaultProps {
  /**
   * Visual style variant of the list.
   * - `plain`: Clean list without default markers.
   * - `bullet`: Unordered list with styled disc markers.
   * @default 'plain'
   */
  variant?: 'plain' | 'bullet';
}

export type ListRootProps = ListRootBaseProps & (ListRootOrderedProps | ListRootDefaultProps);

export interface ListItemBaseProps extends ElementProps<HTMLLIElement> {
  /**
   * Gap spacing between the marker/icon and the item content.
   * @default 'sm'
   */
  gap?: GapVariant;
  className?: string;
  children?: React.ReactNode;
}

export interface ListIconItemProps {
  /**
   * Item variant with a custom icon or emoji marker.
   */
  variant?: 'icon';
  /**
   * Icon or emoji marker displayed before the item content.
   */
  icon: React.ReactNode;
  /**
   * Size of the icon marker.
   * @default 'md'
   */
  iconSize?: ListIconVariants['size'];
}

export interface ListDefaultItemProps {
  /**
   * Item variant for standard, bullet, or ordered items.
   * Passing custom `icon` is not permitted when using standard variants.
   */
  variant?: 'plain' | 'bullet' | 'ordered';
  /**
   * Passing `icon` is not permitted when variant is not 'icon'.
   */
  icon?: never;
  /**
   * Passing `iconSize` is not permitted when variant is not 'icon'.
   */
  iconSize?: never;
}

export type ListItemProps = ListItemBaseProps & (ListIconItemProps | ListDefaultItemProps);

export interface ListIconProps extends ElementProps<HTMLSpanElement> {
  /**
   * Size of the icon marker.
   * @default 'md'
   */
  size?: ListIconVariants['size'];
  className?: string;
  children?: React.ReactNode;
}

export interface ListContentProps extends ElementProps<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

function ListRoot({
  gap = 'sm',
  variant = 'plain',
  className,
  children,
  ref,
  ...props
}: ListRootProps): React.JSX.Element {
  const contextValue = useMemo(
    (): ListContextValue => ({
      variant,
    }),
    [variant],
  );

  const defaultTag = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <ListContext.Provider value={contextValue}>
      {React.createElement(
        defaultTag,
        {
          ref,
          role: 'list',
          className: cx(listRecipe({ gap, variant }), className),
          ...props,
        },
        children,
      )}
    </ListContext.Provider>
  );
}

function ListIcon({
  size = 'md',
  className,
  children,
  ref,
  ...props
}: ListIconProps): React.JSX.Element {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx(listIconRecipe({ size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

function ListContent({ className, children, ref, ...props }: ListContentProps): React.JSX.Element {
  return (
    <div ref={ref} className={cx(listContentStyle, className)} {...props}>
      {children}
    </div>
  );
}

function ListItem({
  variant: _variant,
  icon,
  iconSize = 'md',
  gap = 'sm',
  className,
  children,
  ref,
  ...props
}: ListItemProps): React.JSX.Element {
  const { variant } = useList();

  let marker: React.ReactNode = null;
  if (icon !== undefined) {
    marker = <ListIcon size={iconSize}>{icon}</ListIcon>;
  } else if (variant === 'bullet') {
    marker = (
      <ListIcon size={iconSize}>
        <span className={cx(bulletDotStyle)} />
      </ListIcon>
    );
  } else if (variant === 'ordered') {
    marker = <ListIcon size={iconSize} className={cx(orderedCounterStyle)} />;
  }

  return React.createElement(
    'li',
    {
      ref,
      className: cx(listItemRecipe({ gap }), className),
      ...props,
    },
    marker !== null ? (
      <>
        {marker}
        <ListContent>{children}</ListContent>
      </>
    ) : (
      children
    ),
  );
}

ListRoot.displayName = 'List.Root';
ListItem.displayName = 'List.Item';
ListIcon.displayName = 'List.Icon';
ListContent.displayName = 'List.Content';

export {
  ListRoot as Root,
  ListItem as Item,
  ListIcon as Icon,
  ListContent as Content,
  ListRoot,
  ListItem,
  ListIcon,
  ListContent,
};

export type {
  ListRootProps as RootProps,
  ListItemProps as ItemProps,
  ListIconProps as IconProps,
  ListContentProps as ContentProps,
  ListVariants as RootVariants,
  ListItemVariants as ItemVariants,
  ListIconVariants as IconVariants,
};
