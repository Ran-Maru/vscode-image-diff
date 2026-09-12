import type { CSSProperties } from 'react';
import type { ImageSource } from '../types.js';

interface ImageFrameProps {
  image?: ImageSource;
  stage: { width: number; height: number };
  label?: string;
  clipPath?: string;
  opacity?: number;
  className?: string;
}

export function ImageFrame({
  image,
  stage,
  label,
  clipPath,
  opacity = 1,
  className,
}: ImageFrameProps) {
  const style: CSSProperties = {
    width: stage.width,
    height: stage.height,
    clipPath,
    opacity,
  };

  return (
    <div className={['imgdiff-frame', className].filter(Boolean).join(' ')} style={style}>
      {image ? (
        <img
          className="imgdiff-frame__img"
          src={image.url}
          alt={image.name}
          width={image.width}
          height={image.height}
          draggable={false}
        />
      ) : (
        <div className="imgdiff-frame__empty">No image</div>
      )}
      {label ? <span className="imgdiff-frame__label">{label}</span> : null}
    </div>
  );
}
