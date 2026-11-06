'use client';

import { useEffect, useId, useRef } from 'react';

const dismissibleStack = new Map<string, () => void>();

function isTopLayer(id: string): boolean {
  return id === Array.from(dismissibleStack.keys()).at(-1);
}

function addLayer(id: string, onDismiss: () => void): void {
  if (dismissibleStack.has(id)) {
    throw new Error('unexpected dismissible layer id exists');
  }

  dismissibleStack.set(id, onDismiss);
}

function removeLayer(id: string): void {
  dismissibleStack.delete(id);
}

export function safeHidePopover(el: HTMLElement | null): boolean {
  if (el && 'hidePopover' in el && typeof el.hidePopover === 'function') {
    try {
      el.hidePopover();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function safeTogglePopover(el: HTMLElement | null): boolean {
  if (el && 'togglePopover' in el && typeof el.togglePopover === 'function') {
    try {
      el.togglePopover();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function handlePopoverToggleEvent(
  e: React.ToggleEvent<HTMLDivElement>,
  setOpen: (open: boolean) => void,
  onToggle?: React.ToggleEventHandler<HTMLDivElement>,
): void {
  onToggle?.(e);
  if (e.newState) {
    setOpen(e.newState === 'open');
  }
}

export function safeShowPopover(el: HTMLElement | null): void {
  if (!el || !('showPopover' in el) || typeof el.showPopover !== 'function') return;
  try {
    let isOpen = false;
    try {
      isOpen = el.matches?.(':popover-open') ?? false;
    } catch {
      isOpen = false;
    }
    if (!isOpen) {
      el.showPopover();
    }
  } catch {
    // Ignore if element is not in document yet or transitions
  }
}

export function togglePopoverFromTrigger(
  el: HTMLElement | null,
  button: HTMLElement,
  fallbackToggle: () => void,
): void {
  // In synthetic environments (like JSDOM / Vitest) where button popoverTarget is not dispatched by browser engine
  if (el && 'togglePopover' in el && typeof el.togglePopover === 'function') {
    if (!('popoverTargetElement' in button) && !('popoverTargetAction' in button)) {
      if (!safeTogglePopover(el)) {
        fallbackToggle();
      }
    }
  } else {
    fallbackToggle();
  }
}

export function useDismissible<T extends HTMLElement = HTMLDivElement>(props: {
  onDismiss: () => void;
  dismissOnClickOutside: boolean;
  ignoreRefs?: ReadonlyArray<React.RefObject<HTMLElement | null>>;
}): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const id = useId();

  const { onDismiss, ignoreRefs } = props;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      const isFocusedWithin = ref.current?.contains(document.activeElement);
      if (!isTopLayer(id) || !isFocusedWithin) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onDismiss();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (!props.dismissOnClickOutside || event.defaultPrevented) {
        return;
      }

      const isFocusedWithin = ref.current?.contains(document.activeElement);
      if (!isTopLayer(id) || !isFocusedWithin) {
        return;
      }

      const target = event.target;
      if (ref.current && target instanceof Node && !ref.current.contains(target)) {
        const isIgnored = ignoreRefs?.some((ignoreRef) => ignoreRef.current?.contains(target));
        if (isIgnored) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onDismiss();
      }
    };

    addLayer(id, onDismiss);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('pointerdown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('pointerdown', handleClickOutside);
      removeLayer(id);
    };
  }, [id, ignoreRefs, onDismiss, props.dismissOnClickOutside]);

  return ref;
}
