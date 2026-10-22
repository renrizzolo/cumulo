import React from 'react';
import { recipe, cx, type RecipeVariants, style } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

/* -------------------------------------------------------------------------------------------------
 * AppFrame
 * -----------------------------------------------------------------------------------------------*/

export const appFrameRecipe = recipe(
  {
    base: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.surface.fg,
    },
    variants: {
      height: {
        screen: {
          height: '100dvh',
          overflow: 'hidden',
        },
        full: {
          height: '100%',
          overflow: 'hidden',
        },
        auto: {
          minHeight: '100dvh',
        },
      },
    },
    defaultVariants: {
      height: 'screen',
    },
  },
  'app-frame',
);

export type AppFrameVariants = RecipeVariants<typeof appFrameRecipe>;

export interface AppFrameProps extends ElementProps<HTMLDivElement> {
  /**
   * How the frame is sized vertically:
   * - `'screen'`: Locks the frame to the viewport (`100dvh`). Children scroll independently.
   * - `'full'`: Fills the parent's height (`100%`). Use when embedding the frame in a sized container.
   * - `'auto'`: Grows with content (minimum `100dvh`) so the document itself scrolls.
   * @default 'screen'
   */
  height?: AppFrameVariants['height'];
  children?: React.ReactNode;
}

/**
 * Top-level application shell. Lays out a `Sidebar` (or any panel) next to `AppFrame.Main`
 * in a horizontal row. Visual sidebar styles (`docked`, `inset`, `floating`) are configured
 * on `Sidebar` itself.
 */
export function AppFrameRoot({
  height,
  className,
  children,
  ref,
  ...props
}: AppFrameProps): React.JSX.Element {
  return (
    <div ref={ref} className={cx(appFrameRecipe({ height }), className)} {...props}>
      {children}
    </div>
  );
}

AppFrameRoot.displayName = 'AppFrame';

/* -------------------------------------------------------------------------------------------------
 * AppFrameMain
 * -----------------------------------------------------------------------------------------------*/

export const appFrameMainStyle = style(
  {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    position: 'relative',
  },
  'app-frame-main',
);

export interface AppFrameMainProps extends ElementProps<HTMLElement> {
  /**
   * Element to render. Defaults to `main`; use `div` when a descendant already provides the
   * page's `<main>` landmark.
   * @default 'main'
   */
  as?: 'main' | 'div' | 'section';
  children?: React.ReactNode;
}

/**
 * Flexible content column that fills the space beside the sidebar. Stack a header `Panel`
 * and a scrollable `Panel` inside it.
 */
export function AppFrameMain({
  as: Component = 'main',
  className,
  children,
  ref,
  ...props
}: AppFrameMainProps): React.JSX.Element {
  return React.createElement(
    Component,
    {
      ref,
      className: cx(appFrameMainStyle, className),
      ...props,
    },
    children,
  );
}

AppFrameMain.displayName = 'AppFrame.Main';

export const AppFrame = Object.assign(AppFrameRoot, {
  Root: AppFrameRoot,
  Main: AppFrameMain,
});
