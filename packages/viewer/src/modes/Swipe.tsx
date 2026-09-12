import { useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { pointerPercent, swipeClipInset } from '../layout.js';
import type { ImageSource } from '../types.js';
import { ImageFrame } from '../components/ImageFrame.js';
import type { ViewportState } from '../useViewport.js';

interface SwipeProps {
  before?: ImageSource;
  after?: ImageSource;
  stage: { width: number; height: number };
  viewport: ViewportState;
  percent: number;
  onPercentChange: (percent: number) => void;
}

export function Swipe({ before, after, stage, viewport, percent, onPercentChange }: SwipeProps) {
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;

  const updateFromEvent = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const stageEl = event.currentTarget.querySelector<HTMLElement>('[data-swipe-stage]');
      if (!stageEl) {
        return;
      }
      const rect = stageEl.getBoundingClientRect();
      onPercentChange(pointerPercent(event.clientX, rect.left, rect.width));
    },
    [onPercentChange],
  );

  const onHandlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromEvent(event);
  };

  const onHandlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    updateFromEvent(event);
  };

  return (
    <div className="imgdiff-overlay-mode">
      <div className="imgdiff-transform" style={{ transform, transformOrigin: '0 0' }}>
        <div className="imgdiff-swipe" data-swipe-stage>
          <ImageFrame image={before} stage={stage} label="Before" />
          <ImageFrame
            image={after}
            stage={stage}
            label="After"
            className="imgdiff-swipe__after"
            clipPath={swipeClipInset(percent)}
          />
          <div
            className="imgdiff-swipe__handle"
            data-no-pan
            role="slider"
            tabIndex={0}
            aria-label="Swipe position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            style={{ left: `${percent}%` }}
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
          >
            <span className="imgdiff-swipe__bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
