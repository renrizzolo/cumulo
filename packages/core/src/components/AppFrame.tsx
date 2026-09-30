import React from 'react';
import { recipe, cx, createThemeContract, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const frameContract = createThemeContract(
  {
    sidebarWidth: null,
    sidebarCollapsedWidth: null,
  },
  'frame',
);

export const appFrameRecipe = recipe(
  {
    base: {
      display: 'flex',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.surface.fg,
    },
    variants: {
      variant: {
        docked: {
          flexDirection: 'row',
          overflow: 'hidden',
        },
        inset: {
          flexDirection: 'column',
          backgroundColor: vars.surface.bg.next,
        },
        floating: {
          flexDirection: 'row',
          backgroundColor: vars.surface.bg.next,
          overflow: 'hidden',
        },
      },
      height: {
        screen: {
          height: '100vh',
        },
        full: {
          height: '100%',
        },
        auto: {
          minHeight: '100vh',
        },
      },
    },
    defaultVariants: {
      variant: 'docked',
      height: 'screen',
    },
  },
  'app-frame',
);

export type AppFrameVariants = RecipeVariants<typeof appFrameRecipe>;

export interface AppFrameProps extends ElementProps<HTMLDivElement> {
  variant?: AppFrameVariants['variant'];
  height?: AppFrameVariants['height'];
  children?: React.ReactNode;
}

export function AppFrameRoot({
  variant = 'docked',
  height = 'screen',
  className,
  children,
  ref,
  ...props
}: AppFrameProps): React.JSX.Element {
  return (
    <div
      ref={ref}
      data-variant={variant}
      className={cx(appFrameRecipe({ variant, height }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

AppFrameRoot.displayName = 'AppFrame';

/* -------------------------------------------------------------------------------------------------
 * AppFrameMain
 * -----------------------------------------------------------------------------------------------*/

export const appFrameMainRecipe = recipe(
  {
    base: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      height: '100%',
      position: 'relative',
      boxSizing: 'border-box',
    },
  },
  'app-frame-main',
);

export interface AppFrameMainProps extends ElementProps<HTMLElement> {
  as?: 'main' | 'div' | 'section';
  children?: React.ReactNode;
}

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
      className: cx(appFrameMainRecipe(), className),
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
