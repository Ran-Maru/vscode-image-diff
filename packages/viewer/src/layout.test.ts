import { describe, expect, it } from 'vitest';
import {
  clamp,
  computeStageSize,
  fitScale,
  formatBytes,
  formatDelta,
  nextScale,
  pointerPercent,
  swipeClipInset,
  zoomAround,
} from './layout.js';

describe('computeStageSize', () => {
  it('uses the max of each dimension (GitHub-style top-left overlay box)', () => {
    expect(computeStageSize({ width: 100, height: 80 }, { width: 140, height: 50 })).toEqual({
      width: 140,
      height: 80,
    });
  });

  it('handles a missing side', () => {
    expect(computeStageSize({ width: 64, height: 32 })).toEqual({ width: 64, height: 32 });
    expect(computeStageSize(undefined, { width: 10, height: 20 })).toEqual({
      width: 10,
      height: 20,
    });
    expect(computeStageSize()).toEqual({ width: 0, height: 0 });
  });
});

describe('swipeClipInset', () => {
  it('reveals the left portion of the after image', () => {
    expect(swipeClipInset(0)).toBe('inset(0 100% 0 0)');
    expect(swipeClipInset(50)).toBe('inset(0 50% 0 0)');
    expect(swipeClipInset(100)).toBe('inset(0 0% 0 0)');
  });

  it('clamps out-of-range percents', () => {
    expect(swipeClipInset(-20)).toBe('inset(0 100% 0 0)');
    expect(swipeClipInset(140)).toBe('inset(0 0% 0 0)');
  });
});

describe('pointerPercent', () => {
  it('maps a pointer X into 0–100 within the stage', () => {
    expect(pointerPercent(150, 100, 200)).toBe(25);
    expect(pointerPercent(50, 100, 200)).toBe(0);
    expect(pointerPercent(400, 100, 200)).toBe(100);
  });

  it('returns 0 when the stage has no width', () => {
    expect(pointerPercent(10, 0, 0)).toBe(0);
  });
});

describe('viewport helpers', () => {
  it('fits content inside the container with padding', () => {
    expect(fitScale({ width: 200, height: 100 }, { width: 232, height: 132 }, 16)).toBe(1);
    expect(fitScale({ width: 400, height: 100 }, { width: 232, height: 200 }, 16)).toBeCloseTo(0.5);
  });

  it('zooms around a focal point without drifting that point', () => {
    const origin = { x: 40, y: 20 };
    const offset = { x: 10, y: 4 };
    const next = zoomAround(1, 2, offset, origin);
    expect(origin.x - (origin.x - offset.x) * 2).toBe(next.x);
    expect(origin.y - (origin.y - offset.y) * 2).toBe(next.y);
  });

  it('steps scale by 1.1 and clamps', () => {
    expect(nextScale(1, true)).toBeCloseTo(1.1);
    expect(nextScale(1, false)).toBeCloseTo(1 / 1.1);
    expect(nextScale(20, true, 0.1, 16)).toBe(16);
    expect(nextScale(0.05, false, 0.1, 16)).toBe(0.1);
  });

  it('clamps numeric values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('byte formatting', () => {
  it('formats sizes and deltas', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB');
    expect(formatDelta(1000, 1500)).toBe('+500 B');
    expect(formatDelta(1500, 1000)).toBe('−500 B');
    expect(formatDelta(100, 100)).toBe('±0 B');
  });
});
