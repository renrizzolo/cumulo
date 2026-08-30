import { style, keyframes } from '@cumulo/css';
import { themeContract } from './theme.js';

export const pulseAnimation = keyframes(
  {
    '0%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.8, transform: 'scale(0.98)' },
    '100%': { opacity: 1, transform: 'scale(1)' },
  },
  'pulse',
);

export const basicBoxStyle = style(
  {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: themeContract.spacing.sm,
    padding: themeContract.spacing.md,
    backgroundColor: themeContract.color.bg,
    color: themeContract.color.text,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: themeContract.color.border,
    borderRadius: themeContract.radius.md,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
    ':hover': {
      borderColor: themeContract.color.accent,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    ':active': {
      transform: 'scale(0.99)',
    },
    '@media': {
      '(min-width: 600px)': {
        padding: themeContract.spacing.lg,
      },
    },
  },
  'basic-box',
);

export const animatedBadgeStyle = style(
  {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: themeContract.radius.pill,
    animation: `${pulseAnimation.name} 2s infinite ease-in-out`,
  },
  'animated-badge',
);
