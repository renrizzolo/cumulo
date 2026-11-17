import { vars } from '@cumulo/core';
import { style } from '@cumulo/css';
import React from 'react';

const EASE_OUT_STRONG = 'cubic-bezier(0.23, 1, 0.32, 1)';

export const metaPillLinkStyle = style(
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing['2xs'],
    paddingBlock: vars.spacing['3xs'],
    paddingInline: vars.spacing.xs,
    borderRadius: vars.radius.full,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars.surface.border,
    backgroundColor: vars.surface.bg.next,
    color: vars.surface.fg,
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.medium,
    textDecoration: 'none',
    ':hover': {
      borderColor: vars.primary.border,
      backgroundColor: vars.surface.secondary.hover,
      color: vars.primary['600'],
      textDecoration: 'none',
    },
    ':active': {
      transform: 'scale(0.97)',
    },
  },
  'doc-meta-pill-link',
);

export const subtleLinkStyle = style(
  {
    fontSize: vars.font.size.sm,
    lineHeight: vars.line.height.tight,
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing['2xs'],
    color: vars.surface.muted,
    textDecoration: 'none',
    transition: `color 150ms ${vars.ease.default}`,
    ':hover': {
      color: vars.surface.fg,
      textDecoration: 'none',
    },
  },
  'doc-subtle-link',
);

const iconSmallStyle = style(
  {
    width: vars.size['4xs'],
    height: vars.size['4xs'],
    flexShrink: 0,
  },
  'doc-icon-sm',
);

const externalArrowStyle = style(
  {
    width: '11px',
    height: '11px',
    opacity: 0.55,
    flexShrink: 0,
    transition: `transform 180ms ${EASE_OUT_STRONG}, opacity 180ms ${vars.ease.default}`,
    selectors: {
      'a:hover &': {
        transform: 'translate3d(1.5px, -1.5px, 0)',
        opacity: 1,
      },
    },
    '@media': {
      '(hover: none)': {
        transform: 'none',
      },
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
        transform: 'none',
      },
    },
  },
  'doc-external-arrow',
);

export function GitHubIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={iconSmallStyle.className}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

export function PackageIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={iconSmallStyle.className}
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}

export function ExternalArrowIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={externalArrowStyle.className}
    >
      <path d="M4.5 11.5 11.5 4.5" />
      <path d="M5.5 4.5h6v6" />
    </svg>
  );
}
