import { mimeFromPath } from './formats.js';
import type { ImageSource } from './types.js';

export function bytesToObjectUrl(bytes: Uint8Array, mime: string): string {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: mime });
  return URL.createObjectURL(blob);
}

export function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || 300;
      const height = img.naturalHeight || 150;
      resolve({ width, height });
    };
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = url;
  });
}

export async function bytesToImageSource(bytes: Uint8Array, name: string): Promise<ImageSource> {
  const mime = mimeFromPath(name);
  const url = bytesToObjectUrl(bytes, mime);
  try {
    const { width, height } = await loadImageDimensions(url);
    return { url, name, width, height, byteSize: bytes.byteLength };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
