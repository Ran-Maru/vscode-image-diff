import { IMAGE_EXTENSIONS } from './types.js';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export function extname(path: string): string {
  const slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  const base = slash >= 0 ? path.slice(slash + 1) : path;
  const query = base.split(/[?#]/, 1)[0] ?? base;
  const dot = query.lastIndexOf('.');
  if (dot <= 0) {
    return '';
  }
  return query.slice(dot).toLowerCase();
}

export function isSupportedImagePath(path: string, extra: readonly string[] = []): boolean {
  const ext = extname(path);
  if (!ext) {
    return false;
  }
  return (IMAGE_EXTENSIONS as readonly string[]).includes(ext) || extra.includes(ext);
}

export function mimeFromPath(path: string): string {
  return MIME_BY_EXT[extname(path)] ?? 'application/octet-stream';
}
