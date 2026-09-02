'use client';

import { useEffect, useRef, useEffectEvent } from 'react';

export type UseFocusOptions = {
  /**
   * Whether to restore focus to the previously focused element on unmount
   * @default true
   */
  restoreFocusOnUnmount?: boolean;
  /**
   * Whether to automatically focus the first focusable element on mount
   * @default true
   */
  focusOnMount?: boolean;
  /** Callback when the Escape key is pressed */
  onEscape?: () => void;
  /**
   * Loop focus to start/end when navigating past the first/last item
   * @default true
   */
  loop?: boolean;
} & (UseFocusNavigationOptions | UseFocusModalityOptions);

export interface UseFocusModalityOptions {
  type: 'modality';
  /**
   * Trap focus within the container while mounted (e.g., for dialogs or modal popovers)
   * @default true
   */
  trap?: boolean;
  /**
   * Callback when focus leaves the container via Tab or Shift+Tab navigation (e.g., for non-modal popovers)
   */
  onTabOut?: () => void;
  navigation?: never;
  itemSelector?: never;
  rovingTabIndex?: never;
}

export interface UseFocusNavigationOptions {
  type: 'navigation';
  /** Enable WAI-ARIA arrow key navigation */
  navigation: 'vertical' | 'horizontal' | 'both';
  /**
   * CSS selector for items to navigate between.
   * @default [role="menuitem"]
   **/
  itemSelector?: string;
  /** Optionally manage roving tab index for the navigation items */
  rovingTabIndex?: boolean;
  trap?: never;
  onTabOut?: never;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])';

function getItems(container: HTMLElement, selector: string) {
  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
  return elements.filter((el) => {
    const style = window.getComputedStyle(el);
    return (
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      style.display !== 'none' &&
      style.visibility !== 'hidden'
    );
  });
}

/**
 * if in a textarea or input, don't prevent navigation if the cursor is not at the beginning or end
 **/
function shouldPreventInputNavigation(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
    const textarea = target as HTMLTextAreaElement;
    return textarea.selectionStart === 0 || textarea.selectionEnd === textarea.value.length;
  }

  return false;
}

export function useFocus<T extends HTMLElement = HTMLElement>(options: UseFocusOptions) {
  const {
    loop = true,
    onEscape,
    focusOnMount: autoFocus = false,
    restoreFocusOnUnmount: restoreFocus = false,
    itemSelector = '[role="menuitem"]',
    navigation,
    rovingTabIndex,
    trap,
    onTabOut,
    type,
  } = options;

  const ref = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const onMount = useEffectEvent(() => {
    const container = ref.current;
    if (!container) return;

    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    if (type === 'navigation' && rovingTabIndex) {
      const items = getItems(container, itemSelector);
      const activeIndex = items.indexOf(document.activeElement as HTMLElement);
      items.forEach((item, index) => {
        if (activeIndex !== -1) {
          item.tabIndex = index === activeIndex ? 0 : -1;
        } else {
          item.tabIndex = index === 0 ? 0 : -1;
        }
      });
    }

    if (autoFocus) {
      const items = getItems(container, FOCUSABLE_SELECTOR);
      if (items.length > 0) {
        // Focus the first focusable item
        requestAnimationFrame(() => items[0]?.focus());
      } else if (container.tabIndex >= -1) {
        // Fallback to focusing the container itself if it can receive focus
        requestAnimationFrame(() => container.focus());
      }
    }
  });

  const onUnmount = useEffectEvent(() => {
    if (restoreFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  });

  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const container = ref.current;
    if (!container) return;

    if (e.key === 'Escape' && onEscape) {
      onEscape();
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (trap && e.key === 'Tab') {
      const items = getItems(container, FOCUSABLE_SELECTOR);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (!first || !last) return;

      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === container)
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (onTabOut && e.key === 'Tab') {
      const items = getItems(container, FOCUSABLE_SELECTOR);
      if (items.length === 0) {
        onTabOut();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === container)
      ) {
        onTabOut();
      } else if (!e.shiftKey && document.activeElement === last) {
        onTabOut();
      }
    }

    if (navigation) {
      if (shouldPreventInputNavigation(e.target)) {
        return;
      }

      const isVertical = navigation === 'vertical' || navigation === 'both';
      const isHorizontal = navigation === 'horizontal' || navigation === 'both';

      const isNext =
        (isVertical && e.key === 'ArrowDown') || (isHorizontal && e.key === 'ArrowRight');
      const isPrev = (isVertical && e.key === 'ArrowUp') || (isHorizontal && e.key === 'ArrowLeft');
      const isFirst = e.key === 'Home';
      const isLast = e.key === 'End';

      if (isNext || isPrev || isFirst || isLast) {
        const items = getItems(container, itemSelector);
        if (items.length === 0) return;

        const currentIndex = items.indexOf(document.activeElement as HTMLElement);
        let nextIndex = currentIndex;

        if (isFirst) {
          nextIndex = 0;
        } else if (isLast) {
          nextIndex = items.length - 1;
        } else if (isNext) {
          nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;
          if (nextIndex >= items.length) {
            nextIndex = loop ? 0 : items.length - 1;
          }
        } else if (isPrev) {
          nextIndex = currentIndex === -1 ? items.length - 1 : currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? items.length - 1 : 0;
          }
        }

        if (nextIndex !== currentIndex) {
          e.preventDefault();
          e.stopPropagation();
          items[nextIndex]?.focus();
        }
      }
    }
  });

  const handleFocusIn = useEffectEvent((e: FocusEvent) => {
    const container = ref.current;
    if (!container || !rovingTabIndex) return;

    const items = getItems(container, itemSelector);
    if (items.includes(e.target as HTMLElement)) {
      items.forEach((item) => {
        item.tabIndex = item === e.target ? 0 : -1;
      });
    }
  });

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    onMount();

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocusIn);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocusIn);
      onUnmount();
    };
  }, []);

  return ref;
}
