import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { clamp, fitScale, nextScale, zoomAround } from './layout.js';
import type { Size } from './types.js';

export interface ViewportState {
  scale: number;
  x: number;
  y: number;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 16;

export function useViewport(containerRef: RefObject<HTMLElement | null>, content: Size) {
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  const fit = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const scale = fitScale(contentRef.current, { width: rect.width, height: rect.height });
    const x = (rect.width - contentRef.current.width * scale) / 2;
    const y = (rect.height - contentRef.current.height * scale) / 2;
    setViewport({ scale: clamp(scale, MIN_SCALE, MAX_SCALE), x, y });
  }, [containerRef]);

  const reset100 = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      setViewport({ scale: 1, x: 0, y: 0 });
      return;
    }
    const rect = el.getBoundingClientRect();
    setViewport({
      scale: 1,
      x: (rect.width - contentRef.current.width) / 2,
      y: (rect.height - contentRef.current.height) / 2,
    });
  }, [containerRef]);

  const zoomBy = useCallback(
    (zoomIn: boolean, origin?: { x: number; y: number }) => {
      setViewport((prev) => {
        const next = nextScale(prev.scale, zoomIn, MIN_SCALE, MAX_SCALE);
        const el = containerRef.current;
        const point = origin ?? {
          x: (el?.clientWidth ?? 0) / 2,
          y: (el?.clientHeight ?? 0) / 2,
        };
        const offset = zoomAround(prev.scale, next, { x: prev.x, y: prev.y }, point);
        return { scale: next, ...offset };
      });
    },
    [containerRef],
  );

  const setScale = useCallback(
    (scale: number) => {
      setViewport((prev) => {
        const next = clamp(scale, MIN_SCALE, MAX_SCALE);
        const el = containerRef.current;
        const origin = { x: (el?.clientWidth ?? 0) / 2, y: (el?.clientHeight ?? 0) / 2 };
        return { scale: next, ...zoomAround(prev.scale, next, { x: prev.x, y: prev.y }, origin) };
      });
    },
    [containerRef],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomBy(event.deltaY < 0, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-no-pan]')) {
        return;
      }
      dragging.current = { x: event.clientX, y: event.clientY, ox: 0, oy: 0 };
      setViewport((prev) => {
        if (dragging.current) {
          dragging.current.ox = prev.x;
          dragging.current.oy = prev.y;
        }
        return prev;
      });
      el.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging.current) {
        return;
      }
      const dx = event.clientX - dragging.current.x;
      const dy = event.clientY - dragging.current.y;
      setViewport((prev) => ({
        ...prev,
        x: dragging.current!.ox + dx,
        y: dragging.current!.oy + dy,
      }));
    };

    const onPointerUp = (event: PointerEvent) => {
      dragging.current = null;
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [containerRef, zoomBy]);

  useEffect(() => {
    fit();
  }, [fit, content.width, content.height]);

  return { viewport, fit, reset100, zoomBy, setScale };
}
