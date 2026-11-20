'use client';

import { useCallback, useEffect, useRef } from 'react';
import { vars } from '../contract.js';
import { useDrag, type DragAxis, type DragState } from './useDrag.js';

export type SwipeDirection = 'down' | 'up' | 'left' | 'right';

export interface UseSwipeDismissOptions {
  /** Direction in which the user swipes to dismiss the target element. */
  direction: SwipeDirection;
  /** Called when the swipe exceeds the distance or velocity threshold. */
  onDismiss: () => void;
  /**
   * Optional element to visually translate during the swipe.
   * Defaults to the handle element attached via the returned `ref`.
   */
  targetRef?: React.RefObject<HTMLElement | null>;
  /**
   * Distance in pixels required to dismiss on release.
   * Automatically capped at 35% of the target's size along the swipe axis when measurable.
   * @default 80
   */
  threshold?: number;
  /**
   * Minimum directional flick velocity in pixels per millisecond required to dismiss.
   * @default 0.5
   */
  velocityThreshold?: number;
  /**
   * Disables swipe-to-dismiss interaction when true.
   * @default false
   */
  disabled?: boolean;
}

export interface UseSwipeDismissReturn<T extends HTMLElement> {
  /** Ref to attach to the swipe handle or swipeable element. */
  ref: React.RefObject<T | null>;
  /** Whether a swipe gesture is currently active. */
  isDragging: boolean;
}

function getAxis(direction: SwipeDirection): DragAxis {
  return direction === 'left' || direction === 'right' ? 'x' : 'y';
}

function getDirectionalValues(
  direction: SwipeDirection,
  state: DragState,
): { offset: number; velocity: number } {
  switch (direction) {
    case 'down':
      return { offset: Math.max(0, state.deltaY), velocity: state.velocityY };
    case 'up':
      return { offset: Math.max(0, -state.deltaY), velocity: -state.velocityY };
    case 'right':
      return { offset: Math.max(0, state.deltaX), velocity: state.velocityX };
    case 'left':
      return { offset: Math.max(0, -state.deltaX), velocity: -state.velocityX };
  }
}

function formatTransform(direction: SwipeDirection, offset: number): string {
  switch (direction) {
    case 'down':
      return `translate3d(0, ${offset}px, 0)`;
    case 'up':
      return `translate3d(0, ${-offset}px, 0)`;
    case 'right':
      return `translate3d(${offset}px, 0, 0)`;
    case 'left':
      return `translate3d(${-offset}px, 0, 0)`;
  }
}

/**
 * Composable swipe-to-dismiss gesture primitive built on `useDrag`.
 *
 * Visually translates a target element along the configured swipe direction,
 * snaps back smoothly if released short of the threshold, and invokes `onDismiss`
 * when dragged past the distance or flick-velocity threshold.
 *
 * Suitable for bottom sheets, side drawers, toasts, and dismissible banners.
 */
export function useSwipeDismiss<T extends HTMLElement = HTMLDivElement>(
  options: UseSwipeDismissOptions,
): UseSwipeDismissReturn<T> {
  const {
    direction,
    onDismiss,
    targetRef,
    threshold = 80,
    velocityThreshold = 0.5,
    disabled = false,
  } = options;

  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleRef = useRef<T | null>(null);

  const getTarget = useCallback((): HTMLElement | null => {
    return targetRef ? targetRef.current : handleRef.current;
  }, [targetRef]);

  const clearSnapTimer = useCallback(() => {
    if (snapTimerRef.current !== null) {
      clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }
  }, []);

  const clearTargetStyles = useCallback((target: HTMLElement | null) => {
    if (!target) return;
    target.style.transform = '';
    target.style.transition = '';
    delete target.dataset.dragging;
  }, []);

  const snapBack = useCallback(
    (target: HTMLElement | null) => {
      if (!target) return;
      clearSnapTimer();
      delete target.dataset.dragging;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        clearTargetStyles(target);
        return;
      }

      target.style.transition = `transform ${vars.duration.fast} ${vars.ease.default}`;
      target.style.transform = 'translate3d(0, 0, 0)';
      snapTimerRef.current = setTimeout(() => {
        clearTargetStyles(target);
        snapTimerRef.current = null;
      }, 150);
    },
    [clearSnapTimer, clearTargetStyles],
  );

  const onDragStart = useCallback(() => {
    clearSnapTimer();
    const target = getTarget();
    if (!target) return;
    target.dataset.dragging = 'true';
    target.style.transition = 'none';
  }, [clearSnapTimer, getTarget]);

  const onDragMove = useCallback(
    (state: DragState) => {
      const target = getTarget();
      if (!target) return;
      const { offset } = getDirectionalValues(direction, state);
      target.style.transform = formatTransform(direction, offset);
    },
    [direction, getTarget],
  );

  const onDragEnd = useCallback(
    (state: DragState) => {
      const target = getTarget();
      const { offset, velocity } = getDirectionalValues(direction, state);

      let effectiveThreshold = threshold;
      if (target) {
        const rect = target.getBoundingClientRect();
        const dimension = direction === 'left' || direction === 'right' ? rect.width : rect.height;
        if (dimension > 0) {
          effectiveThreshold = Math.min(threshold, dimension * 0.35);
        }
      }

      if (offset >= effectiveThreshold || (offset > 16 && velocity >= velocityThreshold)) {
        clearTargetStyles(target);
        onDismiss();
      } else {
        snapBack(target);
      }
    },
    [clearTargetStyles, direction, getTarget, onDismiss, snapBack, threshold, velocityThreshold],
  );

  const onDragCancel = useCallback(() => {
    snapBack(getTarget());
  }, [getTarget, snapBack]);

  useEffect(() => {
    if (disabled) {
      clearSnapTimer();
      clearTargetStyles(getTarget());
    }
  }, [disabled, clearSnapTimer, clearTargetStyles, getTarget]);

  useEffect(() => {
    return () => {
      clearSnapTimer();
      clearTargetStyles(getTarget());
    };
  }, [clearSnapTimer, clearTargetStyles, getTarget]);

  const { ref: dragRef, isDragging } = useDrag<T>({
    axis: getAxis(direction),
    disabled,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
  });

  // Keep handleRef synchronized with dragRef so fallback target works without extra wrapper
  useEffect(() => {
    handleRef.current = dragRef.current;
  });

  return { ref: dragRef, isDragging };
}
