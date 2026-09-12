export type DiffMode = '2-up' | 'swipe' | 'onion-skin';
export type Background = 'checkerboard' | 'white' | 'black';

export interface ImageSource {
  url: string;
  name: string;
  width: number;
  height: number;
  byteSize: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  height?: never;
  y: number;
}

export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg'] as const;

export const DEFAULT_MODE: DiffMode = '2-up';
export const DEFAULT_BACKGROUND: Background = 'checkerboard';
