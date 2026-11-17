import { Link as CumuloLink } from '@cumulo/core';
import { Link as RouterLink } from '@renr/parcel-rsc-router';
import { flatRoutes, type RoutePath } from '../../routes';

const routePathSet = new Set<string>(flatRoutes.map((route) => route.path));

function isRoutePath(path: string): path is RoutePath {
  return routePathSet.has(path);
}

interface ParsedInternalRoute {
  to: RoutePath;
  hash?: string;
  search?: Record<string, string>;
}

function parseInternalRoute(href: string): ParsedInternalRoute | null {
  if (
    href.startsWith('//') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return null;
  }

  if (!href.startsWith('/') && !href.startsWith('.')) {
    return null;
  }

  try {
    const url = new URL(href, 'http://localhost');
    let pathname = url.pathname;
    if (pathname.endsWith('.html')) {
      pathname = pathname.slice(0, -5);
      if (pathname === '/index') {
        pathname = '/';
      }
    }
    if (isRoutePath(pathname)) {
      const hash = url.hash.length > 1 ? url.hash.slice(1) : undefined;
      const search: Record<string, string> = {};
      let hasSearch = false;
      for (const [key, value] of url.searchParams.entries()) {
        search[key] = value;
        hasSearch = true;
      }
      return {
        to: pathname,
        hash,
        search: hasSearch ? search : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function Link({
  href,
  children,
  target,
  rel,
  ...props
}: React.JSX.IntrinsicElements['a']): React.JSX.Element {
  if (!href) {
    return (
      <CumuloLink target={target} rel={rel} {...props}>
        {children}
      </CumuloLink>
    );
  }

  if (href.startsWith('#')) {
    return (
      <CumuloLink href={href} target={target} rel={rel} {...props}>
        {children}
      </CumuloLink>
    );
  }

  const internalRoute = parseInternalRoute(href);
  if (internalRoute && (!target || target === '_self')) {
    return (
      <CumuloLink
        as={RouterLink}
        to={internalRoute.to}
        hash={internalRoute.hash}
        search={internalRoute.search}
        target={target}
        rel={rel}
        {...props}
      >
        {children}
      </CumuloLink>
    );
  }

  return (
    // oxlint-disable-next-line jsx-a11y/anchor-has-content
    <a href={href} target={target ?? '_blank'} rel={rel ?? 'noreferrer noopener'} {...props}>
      {children}
    </a>
  );
}
