import type { ImageSource } from '../types.js';
import { ImageFrame } from '../components/ImageFrame.js';
import type { ViewportState } from '../useViewport.js';

interface TwoUpProps {
  before?: ImageSource;
  after?: ImageSource;
  stage: { width: number; height: number };
  viewport: ViewportState;
}

export function TwoUp({ before, after, stage, viewport }: TwoUpProps) {
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;

  return (
    <div className="imgdiff-twoup">
      <div className="imgdiff-twoup__pane">
        <div className="imgdiff-transform" style={{ transform, transformOrigin: '0 0' }}>
          <ImageFrame image={before} stage={stage} label={before ? 'Before' : 'Deleted'} />
        </div>
      </div>
      <div className="imgdiff-twoup__pane">
        <div className="imgdiff-transform" style={{ transform, transformOrigin: '0 0' }}>
          <ImageFrame image={after} stage={stage} label={after ? 'After' : 'Added'} />
        </div>
      </div>
    </div>
  );
}
