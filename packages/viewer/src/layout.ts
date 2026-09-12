import type { Size } from './types.js';

export function computeStageSize(
  a?: Pick<Size, 'width' | 'height'>,
  b?: Pick<Size, 'width' | 'height'>,
): Size {
  return {
    width: Math.max(a?.width ?? 0, b?.width ?? 0),
    height: Math.max(a?.height ?? 0, b?.height ?? 0),
  };
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) {
    return '0 B';
  }
  if (n < 1024) {
    return `${Math.round(n)} B`;
  }
  if (n < 1024 * 1024) {
    return `${(n / 1024).toFixed(1)} KB`;
  }
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDelta(before: number, after: number): string {
  const delta = after - before;
  if (delta === 0) {
    return '±0 B';
  }
  const sign = delta > 0 ? '+' : '−';
  return `${sign}${formatBytes(Math.abs(delta))}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function swipeClipInset(percent: number): string {
  const p = clamp(percent, 0, 100);
  return `inset(0 ${100 - p}% 0 0)`;
}

export function pointerPercent(clientX: number, rectLeft: number, rectWidth: number): number {
  if (rectWidth <= 0) {
    return 0;
  }
  return clamp(((clientX - rectLeft) / rectWidth) * 100, 0, 100);
}

export function fitScale(content: Size, container: Size, padding = 16): number {
  const availW = container.width - padding * 2;
  const availH = container.height - padding * 2;
  if (content.width <= 0 || content.height <= 0 || availW <= 0 || availH <= 0) {
    return 1;
  }
  return Math.min(availW / content.width, availH / content.height);
}

export function nextScale(current: number, zoomIn: boolean, min = 0.1, max = 16): number {
  const factor = 1.1;
  const next = zoomIn ? current * factor : current / factor;
  return clamp(next, min, max);
}

export function zoomAround(
  scale: number,
  next: number,
  offset: { x: number; y: number },
  origin: { x: number; y: number },
): { x: number; y: number } {
  if (scale === 0) {
    return offset;
  }
  const ratio = next / scale;
  return {
    x: origin.x - (origin.x - offset.x) * ratio,
    y: origin.y - (origin.y - offset.y) * ratio,
  };
}
