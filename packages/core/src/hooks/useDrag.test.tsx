import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useDrag, type UseDragOptions } from './useDrag.js';

function DragHarness(props: UseDragOptions): React.JSX.Element {
  const { ref, isDragging } = useDrag(props);
  return <div ref={ref} data-testid="drag-target" data-dragging={String(isDragging)} />;
}

describe('useDrag', () => {
  it('tracks drag lifecycle once movement crosses threshold', () => {
    const onDragStart = vi.fn();
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();

    render(
      <DragHarness
        threshold={5}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />,
    );

    const target = screen.getByTestId('drag-target');
    expect(target).toHaveAttribute('data-dragging', 'false');

    fireEvent.pointerDown(target, { button: 0, clientX: 10, clientY: 20 });

    // Movement below threshold does not start drag
    fireEvent.pointerMove(target, { clientX: 12, clientY: 22 });
    expect(onDragStart).not.toHaveBeenCalled();
    expect(target).toHaveAttribute('data-dragging', 'false');

    // Movement past threshold starts drag
    fireEvent.pointerMove(target, { clientX: 30, clientY: 50 });
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragMove).toHaveBeenCalledTimes(1);
    expect(onDragMove).toHaveBeenCalledWith(
      expect.objectContaining({ deltaX: 20, deltaY: 30 }),
      expect.any(Event),
    );
    expect(target).toHaveAttribute('data-dragging', 'true');

    fireEvent.pointerUp(target, { clientX: 35, clientY: 60 });
    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({ deltaX: 25, deltaY: 40 }),
      expect.any(Event),
    );
    expect(target).toHaveAttribute('data-dragging', 'false');
  });

  it('constrains deltas to the configured axis', () => {
    const onDragMove = vi.fn();

    render(<DragHarness axis="y" threshold={0} onDragMove={onDragMove} />);
    const target = screen.getByTestId('drag-target');

    fireEvent.pointerDown(target, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(target, { clientX: 50, clientY: 25 });

    expect(onDragMove).toHaveBeenCalledWith(
      expect.objectContaining({ deltaX: 0, deltaY: 25 }),
      expect.any(Event),
    );
  });

  it('ignores non-primary button presses and disabled state', () => {
    const onDragStart = vi.fn();

    const { rerender } = render(<DragHarness threshold={0} onDragStart={onDragStart} />);
    const target = screen.getByTestId('drag-target');

    // Right click should be ignored
    fireEvent.pointerDown(target, { button: 2, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(target, { clientX: 40, clientY: 40 });
    expect(onDragStart).not.toHaveBeenCalled();

    // Disabled hook ignores primary button
    rerender(<DragHarness threshold={0} disabled onDragStart={onDragStart} />);
    fireEvent.pointerDown(target, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(target, { clientX: 40, clientY: 40 });
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('calls onDragCancel when pointer is cancelled mid-drag', () => {
    const onDragCancel = vi.fn();

    render(<DragHarness threshold={0} onDragCancel={onDragCancel} />);
    const target = screen.getByTestId('drag-target');

    fireEvent.pointerDown(target, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(target, { clientX: 20, clientY: 20 });
    fireEvent.pointerCancel(target, { clientX: 20, clientY: 20 });

    expect(onDragCancel).toHaveBeenCalledTimes(1);
    expect(target).toHaveAttribute('data-dragging', 'false');
  });

  it('resets dragging state when pointer capture is lost mid-drag', () => {
    const onDragCancel = vi.fn();

    render(<DragHarness threshold={0} onDragCancel={onDragCancel} />);
    const target = screen.getByTestId('drag-target');

    fireEvent.pointerDown(target, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(target, { clientX: 0, clientY: 30 });
    expect(target).toHaveAttribute('data-dragging', 'true');

    fireEvent(target, new Event('lostpointercapture'));

    expect(onDragCancel).toHaveBeenCalledTimes(1);
    expect(target).toHaveAttribute('data-dragging', 'false');
  });
});
