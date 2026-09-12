import { describe, expect, it } from 'vitest';
import { extname, isSupportedImagePath, mimeFromPath } from './formats.js';

describe('formats', () => {
  it('extracts a lowercased extension, ignoring query strings', () => {
    expect(extname('photo.PNG')).toBe('.png');
    expect(extname('/tmp/a/b/icon.svg')).toBe('.svg');
    expect(extname('C:\\img\\file.JPEG')).toBe('.jpeg');
    expect(extname('file.gif?cache=1')).toBe('.gif');
    expect(extname('noext')).toBe('');
  });

  it('accepts png/jpg/jpeg/gif/svg', () => {
    expect(isSupportedImagePath('a.png')).toBe(true);
    expect(isSupportedImagePath('a.jpg')).toBe(true);
    expect(isSupportedImagePath('a.jpeg')).toBe(true);
    expect(isSupportedImagePath('a.gif')).toBe(true);
    expect(isSupportedImagePath('a.svg')).toBe(true);
    expect(isSupportedImagePath('a.webp')).toBe(false);
    expect(isSupportedImagePath('a.webp', ['.webp'])).toBe(true);
  });

  it('maps extensions to MIME types', () => {
    expect(mimeFromPath('x.png')).toBe('image/png');
    expect(mimeFromPath('x.jpg')).toBe('image/jpeg');
    expect(mimeFromPath('x.jpeg')).toBe('image/jpeg');
    expect(mimeFromPath('x.gif')).toBe('image/gif');
    expect(mimeFromPath('x.svg')).toBe('image/svg+xml');
    expect(mimeFromPath('x.bin')).toBe('application/octet-stream');
  });
});
