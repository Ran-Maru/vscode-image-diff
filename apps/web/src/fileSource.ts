import { isSupportedImagePath, loadImageDimensions, type ImageSource } from '@image-diff/viewer';

function inferName(file: File): string {
  if (isSupportedImagePath(file.name)) {
    return file.name;
  }
  const subtype = file.type.split('/')[1];
  const ext = subtype === 'jpeg' ? 'jpg' : subtype === 'svg+xml' ? 'svg' : (subtype ?? 'png');
  return file.name && file.name !== 'image' ? file.name : `pasted.${ext}`;
}

export async function fileToSource(file: File): Promise<ImageSource> {
  if (!isImageFile(file) && !isSupportedImagePath(file.name)) {
    throw new Error(`Unsupported file type: ${file.name || file.type || 'unknown'}`);
  }
  const name = inferName(file);
  const url = URL.createObjectURL(file);
  try {
    const { width, height } = await loadImageDimensions(url);
    return { url, name, width, height, byteSize: file.size };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function revokeSource(source?: ImageSource): void {
  if (source?.url.startsWith('blob:')) {
    URL.revokeObjectURL(source.url);
  }
}

export function isImageFile(file: File): boolean {
  return isSupportedImagePath(file.name) || file.type.startsWith('image/');
}
