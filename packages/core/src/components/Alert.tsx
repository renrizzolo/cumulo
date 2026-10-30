'use client';

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { staticIntentStyles } from '../intents.js';
import { HStack, VStack, type StackProps } from './Stack.js';
import { Heading, type HeadingProps } from './Heading.js';
import { Text, type TextProps } from './Text.js';

const alertRecipe = recipe(
  {
    extend: [staticIntentStyles],
    base: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: vars.spacing.sm,
      width: '100%',
      padding: vars.spacing.md,
      borderRadius: vars.radius.lg,
      borderWidth: 1,
      borderStyle: 'solid',
      boxSizing: 'border-box',
      fontFamily: vars.font.sans,
      fontSize: vars.font.size.sm,
    },
    variants: {},
    compoundVariants: [
      {
        variants: { variant: 'secondary', intent: 'primary' },
        style: {
          backgroundColor: vars.surface.primary.DEFAULT,
          color: vars.surface.primary.fg,
          borderColor: vars.surface.primary.border,
        },
      },
      {
        variants: { variant: 'secondary', intent: 'info' },
        style: {
          borderColor: vars.info.secondary.border,
        },
      },
      {
        variants: { variant: 'secondary', intent: 'success' },
        style: {
          borderColor: vars.success.secondary.border,
        },
      },
      {
        variants: { variant: 'secondary', intent: 'warning' },
        style: {
          borderColor: vars.warning.secondary.border,
        },
      },
      {
        variants: { variant: 'secondary', intent: 'error' },
        style: {
          borderColor: vars.error.secondary.border,
        },
      },
    ],
    defaultVariants: {
      variant: 'secondary',
      intent: 'info',
    },
  },
  'alert',
);

export type AlertVariants = RecipeVariants<typeof alertRecipe>;
export type AlertIntent = NonNullable<AlertVariants['intent']>;
export type AlertVariant = Exclude<NonNullable<AlertVariants['variant']>, 'ghost'>;

export interface AlertContextValue {
  intent: AlertIntent;
  variant: AlertVariant;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export const useAlert = (): AlertContextValue => {
  const context = useContext(AlertContext);
  return context ?? { intent: 'info', variant: 'secondary' };
};

const iconWrapperStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: vars.size['2xs'],
  height: vars.size['2xs'],
  marginTop: '1px',
});

const iconSvgStyle = style({
  width: '100%',
  height: '100%',
  display: 'block',
});

function DefaultIntentIcon({ intent }: { intent: AlertIntent }): React.JSX.Element {
  if (intent === 'success') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={iconSvgStyle.className}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="16 9 10.5 14.5 8 12" />
      </svg>
    );
  }
  if (intent === 'warning') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={iconSvgStyle.className}
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (intent === 'error') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={iconSvgStyle.className}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={iconSvgStyle.className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export interface AlertRootProps extends ElementProps<HTMLDivElement> {
  /**
   * Semantic status intent of the alert.
   * @default 'info'
   */
  intent?: AlertIntent;
  /**
   * Visual surface emphasis of the alert.
   * @default 'secondary'
   */
  variant?: AlertVariant;
  /**
   * Accessible live region role. Defaults to `'alert'` for `error`/`warning` and `'status'` otherwise.
   */
  role?: 'alert' | 'status' | 'region';
  children?: ReactNode;
}

function AlertRoot({
  intent = 'info',
  variant = 'secondary',
  role,
  className,
  children,
  ref,
  ...props
}: AlertRootProps): React.JSX.Element {
  const resolvedRole = role ?? (intent === 'error' || intent === 'warning' ? 'alert' : 'status');
  const classes = alertRecipe({ intent, variant });

  const contextValue = useMemo(
    (): AlertContextValue => ({
      intent,
      variant,
    }),
    [intent, variant],
  );

  return (
    <AlertContext.Provider value={contextValue}>
      <div
        ref={ref}
        role={resolvedRole}
        data-intent={intent}
        className={cx(classes, className)}
        {...props}
      >
        {children}
      </div>
    </AlertContext.Provider>
  );
}

export interface AlertIconProps extends ElementProps<HTMLSpanElement> {
  children?: ReactNode;
}

function AlertIcon({ className, children, ref, ...props }: AlertIconProps): React.JSX.Element {
  const { intent } = useAlert();
  return (
    <span ref={ref} aria-hidden="true" className={cx(iconWrapperStyle, className)} {...props}>
      {children ?? <DefaultIntentIcon intent={intent} />}
    </span>
  );
}

function AlertContent({
  gap = 'sm',
  flex = 1,
  className,
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  return (
    <VStack ref={ref} gap={gap} flex={flex} className={className} {...props}>
      {children}
    </VStack>
  );
}

function AlertTitle({
  as = 'div',
  size = 'sm',
  weight = 'semibold',
  color = 'inherit',
  className,
  children,
  ref,
  ...props
}: HeadingProps): React.JSX.Element {
  return (
    <Heading
      ref={ref}
      as={as}
      size={size}
      weight={weight}
      color={color}
      className={className}
      {...props}
    >
      {children}
    </Heading>
  );
}

function AlertDescription({
  size = 'sm',
  color = 'inherit',
  className,
  children,
  ref,
  ...props
}: TextProps): React.JSX.Element {
  return (
    <Text ref={ref} size={size} color={color} className={className} {...props}>
      {children}
    </Text>
  );
}

function AlertActions({
  gap = 'xs',
  align = 'center',
  className,
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  return (
    <HStack ref={ref} gap={gap} align={align} className={className} {...props}>
      {children}
    </HStack>
  );
}

AlertRoot.displayName = 'Alert.Root';
AlertIcon.displayName = 'Alert.Icon';
AlertContent.displayName = 'Alert.Content';
AlertTitle.displayName = 'Alert.Title';
AlertDescription.displayName = 'Alert.Description';
AlertActions.displayName = 'Alert.Actions';

type AlertContentProps = StackProps;
type AlertTitleProps = HeadingProps;
type AlertDescriptionProps = TextProps;
type AlertActionsProps = StackProps;

export {
  AlertRoot as Root,
  AlertIcon as Icon,
  AlertContent as Content,
  AlertTitle as Title,
  AlertDescription as Description,
  AlertActions as Actions,
};

export type {
  AlertContentProps as ContentProps,
  AlertTitleProps as TitleProps,
  AlertDescriptionProps as DescriptionProps,
  AlertActionsProps as ActionsProps,
};
