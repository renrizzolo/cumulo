import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useRef } from 'react';
import { describe, it, expect, vi } from 'vitest';

import { useSwipeDismiss, type SwipeDirection } from './useSwipeDismiss.js';

function SwipeHarness({
  direction,
  onDismiss,
  threshold = 80,
  disabled = false,
}: {
  direction: SwipeDirection;
  onDismiss: () => void;
  threshold?: number;
  disabled?: boolean;
}): React.JSX.Element {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const { ref: handleRef, isDragging } = useSwipeDismiss({
    direction,
    targetRef: sheetRef,
    onDismiss,
    threshold,
    disabled,
  });

  return (
    <div ref={sheetRef} data-testid="sheet">
      <div ref={handleRef} data-testid="handle" data-dragging={String(isDragging)} />
    </div>
  );
}

describe('useSwipeDismiss', () => {
  it('dismisses when swiped past threshold in the configured direction', () => {
    const onDismiss = vi.fn();
    render(<SwipeHarness direction="down" onDismiss={onDismiss} threshold={80} />);

    const handle = screen.getByTestId('handle');
    const sheet = screen.getByTestId('sheet');

    fireEvent.pointerDown(handle, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 0, clientY: 100 });

    expect(sheet).toHaveAttribute('data-dragging', 'true');
    expect(sheet.style.transform).toBe('translate3d(0, 100px, 0)');

    fireEvent.pointerUp(handle, { clientX: 0, clientY: 100 });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(sheet.style.transform).toBe('');
  });

  it('clamps opposite-direction drag and does not dismiss a slow drag below threshold', () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      render(<SwipeHarness direction="down" onDismiss={onDismiss} threshold={80} />);

      const handle = screen.getByTestId('handle');
      const sheet = screen.getByTestId('sheet');

      fireEvent.pointerDown(handle, { button: 0, clientX: 0, clientY: 100 });
      vi.advanceTimersByTime(200);
      // Dragging upward should clamp offset to 0
      fireEvent.pointerMove(handle, { clientX: 0, clientY: 40 });
      expect(sheet.style.transform).toBe('translate3d(0, 0px, 0)');

      vi.advanceTimersByTime(300);
      // Slow downward drag below threshold should not dismiss
      fireEvent.pointerMove(handle, { clientX: 0, clientY: 130 });
      vi.advanceTimersByTime(200);
      fireEvent.pointerUp(handle, { clientX: 0, clientY: 130 });

      expect(onDismiss).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('dismisses on a fast flick even when distance is below threshold', () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      render(<SwipeHarness direction="down" onDismiss={onDismiss} threshold={200} />);

      const handle = screen.getByTestId('handle');

      fireEvent.pointerDown(handle, { button: 0, clientX: 0, clientY: 0 });
      vi.advanceTimersByTime(10);
      fireEvent.pointerMove(handle, { clientX: 0, clientY: 30 });
      fireEvent.pointerUp(handle, { clientX: 0, clientY: 30 });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('supports horizontal swipe directions for side sheets and toasts', () => {
    const onDismissRight = vi.fn();
    render(<SwipeHarness direction="right" onDismiss={onDismissRight} threshold={60} />);

    const handle = screen.getByTestId('handle');
    const sheet = screen.getByTestId('sheet');

    fireEvent.pointerDown(handle, { button: 0, clientX: 10, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 90, clientY: 0 });
    expect(sheet.style.transform).toBe('translate3d(80px, 0, 0)');

    fireEvent.pointerUp(handle, { clientX: 90, clientY: 0 });
    expect(onDismissRight).toHaveBeenCalledTimes(1);
  });
});
