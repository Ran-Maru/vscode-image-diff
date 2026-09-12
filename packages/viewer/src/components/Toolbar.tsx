import { formatBytes, formatDelta } from '../layout.js';
import type { Background, DiffMode, ImageSource } from '../types.js';

const MODES: { id: DiffMode; label: string }[] = [
  { id: '2-up', label: '2-up' },
  { id: 'swipe', label: 'Swipe' },
  { id: 'onion-skin', label: 'Onion Skin' },
];

const BACKGROUNDS: { id: Background; label: string }[] = [
  { id: 'checkerboard', label: 'Checker' },
  { id: 'white', label: 'White' },
  { id: 'black', label: 'Black' },
];

interface ToolbarProps {
  mode: DiffMode;
  onModeChange: (mode: DiffMode) => void;
  background: Background;
  onBackgroundChange: (background: Background) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset100: () => void;
  before?: ImageSource;
  after?: ImageSource;
  swipePercent: number;
  onSwipePercentChange: (value: number) => void;
  onionOpacity: number;
  onOnionOpacityChange: (value: number) => void;
}

export function Toolbar({
  mode,
  onModeChange,
  background,
  onBackgroundChange,
  scale,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset100,
  before,
  after,
  swipePercent,
  onSwipePercentChange,
  onionOpacity,
  onOnionOpacityChange,
}: ToolbarProps) {
  return (
    <div className="imgdiff-toolbar">
      <div className="imgdiff-toolbar__group" role="radiogroup" aria-label="Diff mode">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={mode === item.id}
            className={mode === item.id ? 'is-active' : undefined}
            onClick={() => onModeChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="imgdiff-toolbar__group">
        <button type="button" onClick={onZoomOut} aria-label="Zoom out">
          −
        </button>
        <span className="imgdiff-toolbar__scale">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={onZoomIn} aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={onFit}>
          Fit
        </button>
        <button type="button" onClick={onReset100}>
          100%
        </button>
      </div>

      <div className="imgdiff-toolbar__group" role="radiogroup" aria-label="Background">
        {BACKGROUNDS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={background === item.id}
            className={background === item.id ? 'is-active' : undefined}
            onClick={() => onBackgroundChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === 'swipe' ? (
        <label className="imgdiff-toolbar__slider">
          Swipe
          <input
            type="range"
            min={0}
            max={100}
            value={swipePercent}
            onChange={(event) => onSwipePercentChange(Number(event.target.value))}
          />
        </label>
      ) : null}

      {mode === 'onion-skin' ? (
        <label className="imgdiff-toolbar__slider">
          Opacity
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(onionOpacity * 100)}
            onChange={(event) => onOnionOpacityChange(Number(event.target.value) / 100)}
          />
        </label>
      ) : null}

      <Meta before={before} after={after} />
    </div>
  );
}

function Meta({ before, after }: { before?: ImageSource; after?: ImageSource }) {
  const parts: string[] = [];
  if (before) {
    parts.push(`${before.width}×${before.height} · ${formatBytes(before.byteSize)}`);
  }
  if (before && after) {
    parts.push('→');
  }
  if (after) {
    parts.push(`${after.width}×${after.height} · ${formatBytes(after.byteSize)}`);
  }
  if (before && after) {
    parts.push(`(${formatDelta(before.byteSize, after.byteSize)})`);
  }

  if (parts.length === 0) {
    return null;
  }

  return <div className="imgdiff-toolbar__meta">{parts.join(' ')}</div>;
}
