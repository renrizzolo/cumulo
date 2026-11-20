'use client';

import { useEffect, useRef, useState } from 'react';

export type DragAxis = 'x' | 'y' | 'both';

export interface DragState {
  /** Pointer X coordinate where the drag gesture started. */
  startX: number;
  /** Pointer Y coordinate where the drag gesture started. */
  startY: number;
  /** Current pointer X coordinate. */
  currentX: number;
  /** Current pointer Y coordinate. */
  currentY: number;
  /** Horizontal displacement from start in pixels (0 when `axis === 'y'`). */
  deltaX: number;
  /** Vertical displacement from start in pixels (0 when `axis === 'x'`). */
  deltaY: number;
  /** Horizontal velocity in pixels per millisecond. */
  velocityX: number;
  /** Vertical velocity in pixels per millisecond. */
  velocityY: number;
}

export interface UseDragOptions {
  /**
   * Constrain drag tracking to a single axis or allow both.
   * @default 'both'
   */
  axis?: DragAxis;
  /**
   * Minimum movement in pixels before the drag gesture engages.
   * @default 4
   */
  threshold?: number;
  /**
   * Disables pointer drag tracking when true.
   * @default false
   */
  disabled?: boolean;
  /** Called once pointer movement crosses `threshold`. */
  onDragStart?: (state: DragState, event: PointerEvent) => void;
  /** Called on every pointer move while actively dragging. */
  onDragMove?: (state: DragState, event: PointerEvent) => void;
  /** Called when the pointer is released after dragging started. */
  onDragEnd?: (state: DragState, event: PointerEvent) => void;
  /** Called when the pointer gesture is cancelled after dragging started. */
  onDragCancel?: (state: DragState, event: PointerEvent) => void;
}

export interface UseDragReturn<T extends HTMLElement> {
  /** Ref to attach to the draggable element or drag handle. */
  ref: React.RefObject<T | null>;
  /** Whether a drag gesture is currently active. */
  isDragging: boolean;
}

function safeSetPointerCapture(el: HTMLElement, pointerId: number): void {
  if (typeof el.setPointerCapture === 'function') {
    try {
      el.setPointerCapture(pointerId);
    } catch {
      // Ignore in synthetic environments or when pointer is no longer active
    }
  }
}

function safeReleasePointerCapture(el: HTMLElement, pointerId: number): void {
  if (typeof el.releasePointerCapture === 'function') {
    try {
      if (typeof el.hasPointerCapture !== 'function' || el.hasPointerCapture(pointerId)) {
        el.releasePointerCapture(pointerId);
      }
    } catch {
      // Ignore if capture was already released
    }
  }
}

/**
 * Low-level pointer-capture drag gesture primitive.
 *
 * Tracks 1D or 2D pointer displacement and velocity from a handle or surface.
 * Designed as a shared building block for swipe-to-dismiss sheets, toast dismissal,
 * resizable sidebars, and custom drag interactions.
 */
export function useDrag<T extends HTMLElement = HTMLDivElement>(
  options: UseDragOptions = {},
): UseDragReturn<T> {
  const {
    axis = 'both',
    threshold = 4,
    disabled = false,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
  } = options;

  const ref = useRef<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const callbacksRef = useRef({
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
  });

  useEffect(() => {
    callbacksRef.current = {
      onDragStart,
      onDragMove,
      onDragEnd,
      onDragCancel,
    };
  }, [onDragStart, onDragMove, onDragEnd, onDragCancel]);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) {
      setIsDragging(false);
      return;
    }

    let activePointerId: number | null = null;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityX = 0;
    let velocityY = 0;

    const buildState = (currentX: number, currentY: number): DragState => ({
      startX,
      startY,
      currentX,
      currentY,
      deltaX: axis === 'y' ? 0 : currentX - startX,
      deltaY: axis === 'x' ? 0 : currentY - startY,
      velocityX: axis === 'y' ? 0 : velocityX,
      velocityY: axis === 'x' ? 0 : velocityY,
    });

    const reset = (pointerId: number | null) => {
      if (pointerId !== null) {
        safeReleasePointerCapture(el, pointerId);
      }
      activePointerId = null;
      if (dragging) {
        dragging = false;
        setIsDragging(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || activePointerId !== null) return;
      const pointerId = event.pointerId ?? 0;
      activePointerId = pointerId;
      dragging = false;
      startX = event.clientX;
      startY = event.clientY;
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = event.timeStamp || Date.now();
      velocityX = 0;
      velocityY = 0;
      safeSetPointerCapture(el, pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const pointerId = event.pointerId ?? 0;
      if (activePointerId === null || pointerId !== activePointerId) return;

      const now = event.timeStamp || Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocityX = (event.clientX - lastX) / dt;
        velocityY = (event.clientY - lastY) / dt;
        lastX = event.clientX;
        lastY = event.clientY;
        lastTime = now;
      }

      const state = buildState(event.clientX, event.clientY);

      if (!dragging) {
        const distance =
          axis === 'x'
            ? Math.abs(state.deltaX)
            : axis === 'y'
              ? Math.abs(state.deltaY)
              : Math.hypot(state.deltaX, state.deltaY);

        if (distance < threshold) return;

        dragging = true;
        setIsDragging(true);
        callbacksRef.current.onDragStart?.(state, event);
      }

      callbacksRef.current.onDragMove?.(state, event);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const pointerId = event.pointerId ?? 0;
      if (activePointerId === null || pointerId !== activePointerId) return;
      const now = event.timeStamp || Date.now();
      if (now - lastTime > 100) {
        velocityX = 0;
        velocityY = 0;
      }
      const wasDragging = dragging;
      const state = buildState(event.clientX, event.clientY);
      reset(pointerId);
      if (wasDragging) {
        callbacksRef.current.onDragEnd?.(state, event);
      }
    };

    const cancelActiveDrag = (event?: PointerEvent) => {
      if (activePointerId === null) return;
      const wasDragging = dragging;
      const state = buildState(event ? event.clientX : lastX, event ? event.clientY : lastY);
      reset(activePointerId);
      if (wasDragging && event) {
        callbacksRef.current.onDragCancel?.(state, event);
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const pointerId = event.pointerId ?? 0;
      if (activePointerId === null || pointerId !== activePointerId) return;
      cancelActiveDrag(event);
    };

    const handleLostPointerCapture = (event: PointerEvent) => {
      const pointerId = event.pointerId ?? 0;
      if (activePointerId === null || pointerId !== activePointerId) return;
      cancelActiveDrag(event);
    };

    const handleWindowBlur = () => {
      if (activePointerId === null) return;
      reset(activePointerId);
    };

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointercancel', handlePointerCancel);
    el.addEventListener('lostpointercapture', handleLostPointerCapture);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointercancel', handlePointerCancel);
      el.removeEventListener('lostpointercapture', handleLostPointerCapture);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('blur', handleWindowBlur);
      reset(activePointerId);
    };
  }, [axis, threshold, disabled]);

  return { ref, isDragging };
}
