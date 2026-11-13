'use client';

import { useEffect, useRef, useEffectEvent } from 'react';

export type UseFocusOptions = {
  /**
   * Whether to restore focus to the previously focused element on unmount or when closed
   * @default true
   */
  restoreFocusOnUnmount?: boolean;
  /**
   * Whether to automatically focus the first focusable element on mount or when opened
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
  /**
   * Controlled open state for persistent elements (e.g. popovers, menus, dialogs)
   * that remain mounted in the DOM.
   */
  open?: boolean;
  /**
   * Additional element refs to ignore when detecting focus moving outside the container.
   */
  ignoreRefs?: ReadonlyArray<React.RefObject<HTMLElement | null>>;
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
  /**
   * Callback when focus leaves the container (via Tab or outside focus).
   */
  onTabOut?: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])';

function getItems(container: HTMLElement, selector: string): HTMLElement[] {
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
function shouldPreventInputNavigation(target: EventTarget | null): boolean {
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
    return target.selectionStart === 0 || target.selectionEnd === target.value.length;
  }

  return false;
}

export function useFocus<T extends HTMLElement = HTMLElement>(
  options: UseFocusOptions,
): React.RefObject<T | null> {
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
    open,
    ignoreRefs,
  } = options;

  const ref = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const activateFocus = useEffectEvent(() => {
    const container = ref.current;
    if (!container) return;

    if (
      restoreFocus &&
      document.activeElement instanceof HTMLElement &&
      !container.contains(document.activeElement)
    ) {
      previousFocusRef.current = document.activeElement;
    }

    if (type === 'navigation' && rovingTabIndex) {
      const items = getItems(container, itemSelector);
      const activeIndex =
        document.activeElement instanceof HTMLElement ? items.indexOf(document.activeElement) : -1;
      items.forEach((item, index) => {
        if (activeIndex !== -1) {
          item.tabIndex = index === activeIndex ? 0 : -1;
        } else {
          item.tabIndex = index === 0 ? 0 : -1;
        }
      });
    }

    if (autoFocus && !container.contains(document.activeElement)) {
      const items = getItems(container, type === 'navigation' ? itemSelector : FOCUSABLE_SELECTOR);
      if (items.length > 0) {
        requestAnimationFrame(() => {
          if (!container.contains(document.activeElement)) {
            items[0]?.focus();
          }
        });
      } else if (container.tabIndex >= -1) {
        requestAnimationFrame(() => {
          if (!container.contains(document.activeElement)) {
            container.focus();
          }
        });
      }
    }
  });

  const deactivateFocus = useEffectEvent(() => {
    const container = ref.current;
    const wasFocusedInside = container?.contains(document.activeElement);
    if (restoreFocus && previousFocusRef.current && wasFocusedInside) {
      previousFocusRef.current.focus();
    }
    previousFocusRef.current = null;
  });

  const wasOpenRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (open === undefined) {
      activateFocus();
      return () => {
        deactivateFocus();
      };
    }

    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;

    if (open && !wasOpen) {
      activateFocus();
    } else if (!open && wasOpen) {
      deactivateFocus();
    }
  }, [open]);

  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const container = ref.current;
    if (!container) return;

    if (e.key === 'Escape' && onEscape) {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
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
      if (type === 'navigation') {
        onTabOut();
        return;
      }

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

        const currentIndex =
          document.activeElement instanceof HTMLElement
            ? items.indexOf(document.activeElement)
            : -1;
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
    if (e.target instanceof HTMLElement && items.includes(e.target)) {
      items.forEach((item) => {
        item.tabIndex = item === e.target ? 0 : -1;
      });
    }
  });

  const handleDocumentFocusIn = useEffectEvent((e: FocusEvent) => {
    const container = ref.current;
    if (!container || !onTabOut || (open !== undefined && !open)) return;

    const target = e.target;
    if (!(target instanceof Node)) return;

    const isInsideContainer = container.contains(target);
    const isInsideIgnored = ignoreRefs?.some((r) => r.current?.contains(target));

    if (!isInsideContainer && !isInsideIgnored) {
      onTabOut();
    }
  });

  useEffect(() => {
    if (!onTabOut || (open !== undefined && !open)) return;

    const onFocusIn = (e: FocusEvent) => handleDocumentFocusIn(e);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [onTabOut, open]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocusIn);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocusIn);
      deactivateFocus();
    };
  }, []);

  return ref;
}
