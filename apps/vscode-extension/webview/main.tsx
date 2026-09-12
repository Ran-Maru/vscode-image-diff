import {
  bytesToImageSource,
  type Background,
  type DiffMode,
  type ImageSource,
} from '@image-diff/viewer';
import { ImageDiffViewer } from '@image-diff/viewer';
import '@image-diff/viewer/theme.css';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';

interface Payload {
  name: string;
  byteSize: number;
  mime: string;
  bytes: ArrayBuffer | Uint8Array | number[] | { data?: number[] };
}

interface SetStateMessage {
  type: 'setState';
  before?: Payload;
  after?: Payload;
  mode?: DiffMode;
  background?: Background;
}

function toUint8(data: Payload['bytes']): Uint8Array {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  if (Array.isArray(data)) {
    return Uint8Array.from(data);
  }
  if (data && Array.isArray(data.data)) {
    return Uint8Array.from(data.data);
  }
  return new Uint8Array();
}

function revoke(source?: ImageSource): void {
  if (source?.url.startsWith('blob:')) {
    URL.revokeObjectURL(source.url);
  }
}

function App() {
  const [before, setBefore] = useState<ImageSource>();
  const [after, setAfter] = useState<ImageSource>();
  const [mode, setMode] = useState<DiffMode>('2-up');
  const [background, setBackground] = useState<Background>('checkerboard');

  useEffect(() => {
    const onMessage = (event: MessageEvent<SetStateMessage>) => {
      const message = event.data;
      if (message?.type !== 'setState') {
        return;
      }
      void (async () => {
        const nextBefore = message.before
          ? await bytesToImageSource(toUint8(message.before.bytes), message.before.name)
          : undefined;
        const nextAfter = message.after
          ? await bytesToImageSource(toUint8(message.after.bytes), message.after.name)
          : undefined;
        setBefore((prev) => {
          revoke(prev);
          return nextBefore;
        });
        setAfter((prev) => {
          revoke(prev);
          return nextAfter;
        });
        if (message.mode) {
          setMode(message.mode);
        }
        if (message.background) {
          setBackground(message.background);
        }
      })();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <ImageDiffViewer
      before={before}
      after={after}
      initialMode={mode}
      initialBackground={background}
      theme="vscode"
    />
  );
}

createRoot(document.getElementById('root')!).render(<App />);
