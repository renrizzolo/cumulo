import { useEffect, useId, useRef } from 'react';

const dismissibleStack = new Map<string, () => void>();

function isTopLayer(id: string) {
  return id === Array.from(dismissibleStack.keys()).at(-1);
}

export function hasHigherLayer(id: string) {
  const idx = Array.from(dismissibleStack.keys()).indexOf(id);
  return idx !== -1 && idx < dismissibleStack.size - 1;
}

function addLayer(id: string, onDismiss: () => void) {
  if (dismissibleStack.has(id)) {
    throw new Error('unexpected dismissible layer id exists');
  }

  dismissibleStack.set(id, onDismiss);
}

function removeLayer(id: string) {
  dismissibleStack.delete(id);
}

export function useDismissible(props: { onDismiss: () => void; dismissOnClickOutside: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const id = useId();

  const { onDismiss } = props;

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

      if (ref.current && !ref.current.contains(event.target as Node)) {
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
  }, [id, onDismiss, props.dismissOnClickOutside]);

  return ref;
}
