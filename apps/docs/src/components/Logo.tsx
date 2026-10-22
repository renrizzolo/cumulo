import React from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars, type ElementProps } from '@cumulo/core';

export const logoRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    userSelect: 'none',
    lineHeight: 1,
    minWidth: 0,
  },
  variants: {
    size: {
      sm: {
        gap: vars.spacing['2xs'],
      },
      md: {
        gap: vars.spacing.xs,
      },
      lg: {
        gap: vars.spacing.sm,
      },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export const logoTextRecipe = recipe({
  base: {
    fontFamily: vars.font.sans,
    fontWeight: vars.font.weight.bold,
    letterSpacing: '-0.02em',
    color: vars.fg,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  variants: {
    size: {
      sm: {
        fontSize: vars.font.size.sm,
      },
      md: {
        fontSize: vars.font.size.base,
      },
      lg: {
        fontSize: vars.font.size.lg,
      },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export const logoAccentStyle = style({
  fontWeight: vars.font.weight.semibold,
  color: vars.primary.DEFAULT,
});

export type LogoVariants = RecipeVariants<typeof logoRecipe>;

export interface LogoMarkProps {
  size?: LogoVariants['size'];
  className?: string;
}

export function LogoMark({ size = 'sm', className }: LogoMarkProps): React.JSX.Element {
  const sizeValue = MARK_SIZES[size];

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.2447 9.21763C11.8157 8.92746 12.3867 8.92746 12.9577 9.21763L14.5718 9.97901C15.1427 10.2692 15.1427 10.5593 14.5718 10.8495L4.75528 15.7824C4.1843 16.0725 3.61332 16.0725 3.04234 15.7824L1.42824 15.021C0.857255 14.7308 0.857255 14.4407 1.42824 14.1505L11.2447 9.21763Z"
        fill={vars.primary['600']}
      />
      <path
        d="M13 0.422764V2.95935L5.02857 7.17642C4.62857 7.38781 4.42857 7.70488 4.42857 8.12764V10.8228C4.42857 11.2455 4.22857 11.5626 3.82857 11.774L1.75429 12.8679C1.25143 13.1321 1 13 1 12.4715V7.39837C1 6.55285 1.4 5.9187 2.2 5.49593L12.4 0.105691C12.8 -0.105691 13 -9.44952e-08 13 0.422764Z"
        fill={vars.primary['400']}
      />
    </svg>
  );
}

const MARK_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export interface LogoProps extends ElementProps<HTMLDivElement> {
  size?: LogoVariants['size'];
  showText?: boolean;
}

export function Logo({
  size = 'md',
  showText = true,
  className,
  ref,
  ...props
}: LogoProps): React.JSX.Element {
  return (
    <div ref={ref} className={cx(logoRecipe({ size }), className)} {...props}>
      <LogoMark size={size} />
      {showText && (
        <span className={logoTextRecipe({ size })}>
          Cumulo <span className={logoAccentStyle.className}>UI</span>
        </span>
      )}
    </div>
  );
}
