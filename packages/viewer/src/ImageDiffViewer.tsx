import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toolbar } from './components/Toolbar.js';
import { computeStageSize } from './layout.js';
import { OnionSkin } from './modes/OnionSkin.js';
import { Swipe } from './modes/Swipe.js';
import { TwoUp } from './modes/TwoUp.js';
import type { Background, DiffMode, ImageSource } from './types.js';
import { DEFAULT_BACKGROUND, DEFAULT_MODE } from './types.js';
import { useViewport } from './useViewport.js';

export interface ImageDiffViewerProps {
  before?: ImageSource;
  after?: ImageSource;
  initialMode?: DiffMode;
  initialBackground?: Background;
  className?: string;
  theme?: 'default' | 'vscode';
}

export function ImageDiffViewer({
  before,
  after,
  initialMode = DEFAULT_MODE,
  initialBackground = DEFAULT_BACKGROUND,
  className,
  theme = 'default',
}: ImageDiffViewerProps) {
  const [mode, setMode] = useState<DiffMode>(initialMode);
  const [background, setBackground] = useState<Background>(initialBackground);
  const [swipePercent, setSwipePercent] = useState(50);
  const [onionOpacity, setOnionOpacity] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);

  const stage = useMemo(() => computeStageSize(before, after), [before, after]);
  const { viewport, fit, reset100, zoomBy } = useViewport(containerRef, stage);

  const overlaySupported = Boolean(before && after);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setBackground(initialBackground);
  }, [initialBackground]);

  useEffect(() => {
    if (!overlaySupported && mode !== '2-up') {
      setMode('2-up');
    }
  }, [mode, overlaySupported]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (mode !== 'swipe') {
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const dir = event.key === 'ArrowRight' ? 1 : -1;
        setSwipePercent((prev) => Math.min(100, Math.max(0, prev + step * dir)));
      }
    },
    [mode],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const classes = [
    'imgdiff',
    theme === 'vscode' ? 'imgdiff--vscode' : '',
    `imgdiff--bg-${background}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        background={background}
        onBackgroundChange={setBackground}
        scale={viewport.scale}
        onZoomIn={() => zoomBy(true)}
        onZoomOut={() => zoomBy(false)}
        onFit={fit}
        onReset100={reset100}
        before={before}
        after={after}
        swipePercent={swipePercent}
        onSwipePercentChange={setSwipePercent}
        onionOpacity={onionOpacity}
        onOnionOpacityChange={setOnionOpacity}
      />
      <div ref={containerRef} className="imgdiff-stage" tabIndex={0}>
        {!before && !after ? (
          <div className="imgdiff-empty">Select two images to compare</div>
        ) : mode === '2-up' || !overlaySupported ? (
          <TwoUp before={before} after={after} stage={stage} viewport={viewport} />
        ) : mode === 'swipe' ? (
          <Swipe
            before={before}
            after={after}
            stage={stage}
            viewport={viewport}
            percent={swipePercent}
            onPercentChange={setSwipePercent}
          />
        ) : (
          <OnionSkin
            before={before}
            after={after}
            stage={stage}
            viewport={viewport}
            opacity={onionOpacity}
          />
        )}
      </div>
    </div>
  );
}
