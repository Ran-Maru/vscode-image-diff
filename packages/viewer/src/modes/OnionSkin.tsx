import type { ImageSource } from '../types.js';
import { ImageFrame } from '../components/ImageFrame.js';
import type { ViewportState } from '../useViewport.js';

interface OnionSkinProps {
  before?: ImageSource;
  after?: ImageSource;
  stage: { width: number; height: number };
  viewport: ViewportState;
  opacity: number;
}

export function OnionSkin({ before, after, stage, viewport, opacity }: OnionSkinProps) {
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;

  return (
    <div className="imgdiff-overlay-mode">
      <div className="imgdiff-transform" style={{ transform, transformOrigin: '0 0' }}>
        <div className="imgdiff-onion">
          <ImageFrame image={before} stage={stage} label="Before" />
          <ImageFrame
            image={after}
            stage={stage}
            label="After"
            className="imgdiff-onion__after"
            opacity={opacity}
          />
        </div>
      </div>
    </div>
  );
}
