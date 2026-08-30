import { recipe } from '@cumulo/css';

export const baseButtonRecipe = recipe(
  {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      borderRadius: 6,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    },
    variants: {
      intent: {
        primary: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
        },
        secondary: {
          backgroundColor: '#6b7280',
          color: '#ffffff',
        },
        danger: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
        },
      },
      size: {
        sm: {
          fontSize: 12,
          padding: '4px 8px',
          height: 28,
        },
        md: {
          fontSize: 14,
          padding: '8px 16px',
          height: 36,
        },
        lg: {
          fontSize: 16,
          padding: '12px 24px',
          height: 44,
        },
      },
      variant: {
        solid: {},
        outline: {
          backgroundColor: 'transparent',
        },
      },
    },
    compoundVariants: [
      {
        variants: { intent: 'primary', variant: 'outline' },
        style: {
          borderColor: '#3b82f6',
          color: '#3b82f6',
        },
      },
      {
        variants: { intent: 'danger', variant: 'outline' },
        style: {
          borderColor: '#ef4444',
          color: '#ef4444',
        },
      },
    ],
    defaultVariants: {
      intent: 'primary',
      size: 'md',
      variant: 'solid',
    },
  },
  'btn-fixture',
);

export const extendedButtonRecipe = recipe(
  {
    extend: baseButtonRecipe,
    base: {
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    variants: {
      shape: {
        pill: {
          borderRadius: 9999,
        },
        square: {
          borderRadius: 0,
        },
      },
      size: {
        xl: {
          fontSize: 18,
          padding: '16px 32px',
          height: 52,
        },
      },
    },
    defaultVariants: {
      shape: 'pill',
    },
  },
  'btn-ext-fixture',
);
