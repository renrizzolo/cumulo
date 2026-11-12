'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const avatarRecipe = recipe(
  {
    base: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      userSelect: 'none',
      overflow: 'hidden',
      verticalAlign: 'middle',
      fontFamily: vars.font.sans,
      fontWeight: vars.font.weight.medium,
      lineHeight: vars.line.height.none,
      backgroundColor: vars.surface.secondary.DEFAULT,
      color: vars.fg,
      boxSizing: 'border-box',
    },
    variants: {
      size: {
        '2xs': {
          width: vars.size['2xs'],
          height: vars.size['2xs'],
          fontSize: vars.font.size['2xs'],
        },
        xs: {
          width: vars.size.xs,
          height: vars.size.xs,
          fontSize: vars.font.size.xs,
        },
        sm: {
          width: vars.size.sm,
          height: vars.size.sm,
          fontSize: vars.font.size.sm,
        },
        md: {
          width: vars.size.md,
          height: vars.size.md,
          fontSize: vars.font.size.md,
        },
        lg: {
          width: vars.size.lg,
          height: vars.size.lg,
          fontSize: vars.font.size.lg,
        },
        xl: {
          width: vars.size.xl,
          height: vars.size.xl,
          fontSize: vars.font.size.xl,
        },
      },
      shape: {
        circle: {
          borderRadius: vars.radius.full,
        },
        square: {
          borderRadius: vars.radius.none,
        },
        rounded: {
          borderRadius: vars.radius.md,
        },
      },
      color: {
        yellow: {
          backgroundColor: vars.yellow.bg,
          color: vars.yellow.fg,
        },
        blue: {
          backgroundColor: vars.blue.bg,
          color: vars.blue.fg,
        },
        green: {
          backgroundColor: vars.green.bg,
          color: vars.green.fg,
        },
        beige: {
          backgroundColor: vars.beige.bg,
          color: vars.beige.fg,
        },
        pink: {
          backgroundColor: vars.pink.bg,
          color: vars.pink.fg,
        },
        purple: {
          backgroundColor: vars.purple.bg,
          color: vars.purple.fg,
        },
        sky: {
          backgroundColor: vars.sky.bg,
          color: vars.sky.fg,
        },
        neutral: {
          backgroundColor: vars.surface.secondary.DEFAULT,
          color: vars.fg,
        },
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  },
  'avatar',
);

export const avatarBadgeRecipe = recipe(
  {
    base: {
      position: 'absolute',
      display: 'block',
      borderRadius: vars.radius.full,
      boxSizing: 'border-box',
      borderStyle: 'solid',
      borderColor: vars.bg['0'],
      pointerEvents: 'none',
      zIndex: 1,
    },
    variants: {
      status: {
        online: {
          backgroundColor: vars.success.bg,
        },
        offline: {
          backgroundColor: vars.muted,
        },
        away: {
          backgroundColor: vars.warning.bg,
        },
        busy: {
          backgroundColor: vars.error.bg,
        },
      },
      size: {
        '2xs': {
          width: '6px',
          height: '6px',
          borderWidth: 1,
        },
        xs: {
          width: '7px',
          height: '7px',
          borderWidth: 1,
        },
        sm: {
          width: '8px',
          height: '8px',
          borderWidth: 1.5,
        },
        md: {
          width: '10px',
          height: '10px',
          borderWidth: 2,
        },
        lg: {
          width: '12px',
          height: '12px',
          borderWidth: 2,
        },
        xl: {
          width: '14px',
          height: '14px',
          borderWidth: 2.5,
        },
      },
      placement: {
        'bottom-right': {
          bottom: 0,
          right: 0,
          transform: 'translate(10%, 10%)',
        },
        'top-right': {
          top: 0,
          right: 0,
          transform: 'translate(10%, -10%)',
        },
        'bottom-left': {
          bottom: 0,
          left: 0,
          transform: 'translate(-10%, 10%)',
        },
        'top-left': {
          top: 0,
          left: 0,
          transform: 'translate(-10%, -10%)',
        },
      },
    },
    defaultVariants: {
      status: 'online',
      size: 'md',
      placement: 'bottom-right',
    },
  },
  'avatar-badge',
);

const avatarImageStyle = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
});

const avatarFallbackStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  lineHeight: vars.line.height.none,
  textTransform: 'uppercase',
  borderRadius: 'inherit',
});

const defaultAvatarIconStyle = style({
  width: '60%',
  height: '60%',
  display: 'block',
  fill: 'currentColor',
});

const avatarGroupStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexDirection: 'row',
});

const avatarGroupItemStyle = style({
  boxShadow: `0 0 0 2px ${vars.bg['0']}`,
  selectors: {
    '&:not(:first-child)': {
      marginInlineStart: 'calc(-1 * var(--avatar-overlap, 8px))',
    },
  },
});

export type AvatarVariants = RecipeVariants<typeof avatarRecipe>;
export type AvatarSize = NonNullable<AvatarVariants['size']>;
export type AvatarShape = NonNullable<AvatarVariants['shape']>;
export type AvatarColor = NonNullable<AvatarVariants['color']>;

export type AvatarBadgeVariants = RecipeVariants<typeof avatarBadgeRecipe>;
export type AvatarBadgeStatus = NonNullable<AvatarBadgeVariants['status']>;
export type AvatarBadgePlacement = NonNullable<AvatarBadgeVariants['placement']>;

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AvatarContextValue {
  size: AvatarSize;
  shape: AvatarShape;
  status: ImageLoadingStatus;
  setStatus: (status: ImageLoadingStatus) => void;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

export const useAvatar = (): AvatarContextValue => {
  const context = useContext(AvatarContext);
  if (!context) {
    return {
      size: 'md',
      shape: 'circle',
      status: 'idle',
      setStatus: () => {},
    };
  }
  return context;
};

export interface AvatarGroupContextValue {
  size?: AvatarSize;
  shape?: AvatarShape;
}

const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

export const useAvatarGroup = (): AvatarGroupContextValue | null => {
  return useContext(AvatarGroupContext);
};

/**
 * Extracts uppercase 1-2 character initials from a full name.
 *
 * @example
 * getInitials('Jane Doe') // 'JD'
 * getInitials('Ada') // 'AD'
 */
export function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0];
  if (!first) return '';
  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  const last = parts[parts.length - 1];
  if (!last) return first.slice(0, 2).toUpperCase();
  const firstChar = first[0] ?? '';
  const lastChar = last[0] ?? '';
  return `${firstChar}${lastChar}`.toUpperCase();
}

function DefaultAvatarIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={defaultAvatarIconStyle}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export interface AvatarRootProps extends ElementProps<HTMLDivElement> {
  /**
   * Sizing scale of the avatar.
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * Corner shape geometry.
   * @default 'circle'
   */
  shape?: AvatarShape;
  /**
   * Accent background tint for fallback display.
   */
  color?: AvatarColor;
  /**
   * User full name, used for accessibility labels and fallback initials generation.
   */
  name?: string;
  /**
   * Image source URL when using the concise single-element API.
   */
  src?: string;
  /**
   * Image alternative description for screen readers.
   */
  alt?: string;
  /**
   * Custom fallback node when image fails or is unavailable.
   */
  fallback?: ReactNode;
  children?: ReactNode;
}

export type AvatarProps = AvatarRootProps;

function AvatarRoot({
  size: sizeProp,
  shape: shapeProp,
  color,
  name,
  src,
  alt,
  fallback,
  className,
  children,
  ref,
  ...props
}: AvatarRootProps): React.JSX.Element {
  const group = useAvatarGroup();
  const size = sizeProp ?? group?.size ?? 'md';
  const shape = shapeProp ?? group?.shape ?? 'circle';

  const [prevSrc, setPrevSrc] = useState(src);
  const [status, setStatus] = useState<ImageLoadingStatus>(src ? 'loading' : 'idle');

  if (src !== prevSrc) {
    setPrevSrc(src);
    setStatus(src ? 'loading' : 'idle');
  }

  const contextValue = useMemo(
    (): AvatarContextValue => ({
      size,
      shape,
      status,
      setStatus,
    }),
    [size, shape, status],
  );

  const classes = avatarRecipe({ size, shape, color });
  const accessibleLabel = alt ?? name ?? 'Avatar';

  const hasDirectConfig = Boolean(src || name || fallback);

  return (
    <AvatarContext.Provider value={contextValue}>
      <div
        ref={ref}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="img"
        aria-label={accessibleLabel}
        className={cx(classes, group ? avatarGroupItemStyle : undefined, className)}
        {...props}
      >
        {hasDirectConfig ? (
          <>
            {src && <AvatarImage src={src} alt={accessibleLabel} />}
            <AvatarFallback name={name}>
              {fallback ?? (name ? getInitials(name) : undefined)}
            </AvatarFallback>
            {children}
          </>
        ) : (
          children
        )}
      </div>
    </AvatarContext.Provider>
  );
}

export interface AvatarImageProps extends ElementProps<HTMLImageElement> {
  src?: string;
  alt?: string;
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

function AvatarImage({
  src,
  alt = '',
  className,
  onLoad,
  onError,
  onLoadingStatusChange,
  ref,
  ...props
}: AvatarImageProps): React.JSX.Element | null {
  const { status, setStatus } = useAvatar();

  useEffect(() => {
    if (!src) {
      setStatus('error');
      onLoadingStatusChange?.('error');
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const image = new window.Image();
    image.src = src;

    if (image.complete) {
      if (image.naturalWidth === 0) {
        setStatus('error');
        onLoadingStatusChange?.('error');
      } else {
        setStatus('loaded');
        onLoadingStatusChange?.('loaded');
      }
      return;
    }

    const handleLoad = (): void => {
      setStatus('loaded');
      onLoadingStatusChange?.('loaded');
    };

    const handleError = (): void => {
      setStatus('error');
      onLoadingStatusChange?.('error');
    };

    image.addEventListener('load', handleLoad);
    image.addEventListener('error', handleError);

    return () => {
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', handleError);
    };
  }, [src, setStatus, onLoadingStatusChange]);

  const handleNativeLoad = (event: SyntheticEvent<HTMLImageElement, Event>): void => {
    setStatus('loaded');
    onLoadingStatusChange?.('loaded');
    onLoad?.(event);
  };

  const handleNativeError = (event: SyntheticEvent<HTMLImageElement, Event>): void => {
    setStatus('error');
    onLoadingStatusChange?.('error');
    onError?.(event);
  };

  if (status !== 'loaded') {
    return null;
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onLoad={handleNativeLoad}
      onError={handleNativeError}
      className={cx(avatarImageStyle, className)}
      {...props}
    />
  );
}

export interface AvatarFallbackProps extends ElementProps<HTMLSpanElement> {
  /**
   * User full name used to generate 2-letter uppercase initials when no children are provided.
   */
  name?: string;
  children?: ReactNode;
}

function AvatarFallback({
  name,
  className,
  children,
  ref,
  ...props
}: AvatarFallbackProps): React.JSX.Element | null {
  const { status } = useAvatar();

  if (status === 'loaded') {
    return null;
  }

  const content = children ?? (name ? getInitials(name) : <DefaultAvatarIcon />);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx(avatarFallbackStyle, className)}
      {...props}
    >
      {content}
    </span>
  );
}

export interface AvatarBadgeProps extends ElementProps<HTMLSpanElement> {
  /**
   * Activity or status intent.
   * @default 'online'
   */
  status?: AvatarBadgeStatus;
  /**
   * Position placement of the indicator dot relative to the avatar bounds.
   * @default 'bottom-right'
   */
  placement?: AvatarBadgePlacement;
  /**
   * Size scale of the indicator dot. Defaults to the enclosing avatar's size.
   */
  size?: AvatarSize;
}

function AvatarBadge({
  status = 'online',
  placement = 'bottom-right',
  size: sizeProp,
  className,
  ref,
  ...props
}: AvatarBadgeProps): React.JSX.Element {
  const { size: avatarSize } = useAvatar();
  const size = sizeProp ?? avatarSize;
  const classes = avatarBadgeRecipe({ status, placement, size });

  return (
    <span
      ref={ref}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="status"
      aria-label={`Status: ${status}`}
      className={cx(classes, className)}
      {...props}
    />
  );
}

export interface AvatarGroupProps extends ElementProps<HTMLDivElement> {
  /**
   * Maximum number of visible avatars before rendering a +N overflow indicator.
   */
  max?: number;
  /**
   * Shared size scale propagated to all child avatars.
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * Shared shape geometry propagated to all child avatars.
   * @default 'circle'
   */
  shape?: AvatarShape;
  /**
   * Pixel or token overlap between adjacent avatars.
   * @default '8px'
   */
  overlap?: string;
  children?: ReactNode;
}

function AvatarGroup({
  max,
  size = 'md',
  shape = 'circle',
  overlap = '8px',
  className,
  children,
  style: styleProp,
  ref,
  ...props
}: AvatarGroupProps): React.JSX.Element {
  const groupContextValue = useMemo(
    (): AvatarGroupContextValue => ({
      size,
      shape,
    }),
    [size, shape],
  );

  const childArray = React.Children.toArray(children);
  const totalCount = childArray.length;
  const hasOverflow = typeof max === 'number' && max > 0 && totalCount > max;
  const visibleChildren = hasOverflow ? childArray.slice(0, max) : childArray;
  const overflowCount = totalCount - (max ?? totalCount);

  const groupStyle = useMemo((): React.CSSProperties => {
    const inlineStyle: React.CSSProperties = {
      ...styleProp,
    };
    Reflect.set(inlineStyle, '--avatar-overlap', overlap);
    return inlineStyle;
  }, [styleProp, overlap]);

  return (
    <AvatarGroupContext.Provider value={groupContextValue}>
      <div
        ref={ref}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="group"
        className={cx(avatarGroupStyle, className)}
        style={groupStyle}
        {...props}
      >
        {visibleChildren}
        {hasOverflow && (
          <AvatarRoot
            size={size}
            shape={shape}
            aria-label={`${overflowCount} more`}
            fallback={`+${overflowCount}`}
          />
        )}
      </div>
    </AvatarGroupContext.Provider>
  );
}

AvatarRoot.displayName = 'Avatar.Root';
AvatarImage.displayName = 'Avatar.Image';
AvatarFallback.displayName = 'Avatar.Fallback';
AvatarBadge.displayName = 'Avatar.Badge';
AvatarGroup.displayName = 'Avatar.Group';

export {
  AvatarRoot as Root,
  AvatarImage as Image,
  AvatarFallback as Fallback,
  AvatarBadge as Badge,
  AvatarGroup as Group,
};

export {
  AvatarRoot as Avatar,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
};

export type {
  AvatarRootProps,
  AvatarRootProps as RootProps,
  AvatarImageProps as ImageProps,
  AvatarFallbackProps as FallbackProps,
  AvatarBadgeProps as BadgeProps,
  AvatarGroupProps as GroupProps,
};
