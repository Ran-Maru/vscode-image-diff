import { ImageDiffViewer, type ImageSource } from '@image-diff/viewer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FileSlot } from './FileSlot';
import { fileToSource, isImageFile, revokeSource } from './fileSource';

export function App() {
  const [before, setBefore] = useState<ImageSource>();
  const [after, setAfter] = useState<ImageSource>();
  const beforeRef = useRef(before);
  const afterRef = useRef(after);
  beforeRef.current = before;
  afterRef.current = after;

  const replaceBefore = useCallback((next: ImageSource) => {
    setBefore((prev) => {
      if (prev && prev.url !== next.url) {
        revokeSource(prev);
      }
      return next;
    });
  }, []);

  const replaceAfter = useCallback((next: ImageSource) => {
    setAfter((prev) => {
      if (prev && prev.url !== next.url) {
        revokeSource(prev);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = [...(event.clipboardData?.files ?? [])].filter(isImageFile);
      if (files.length === 0) {
        return;
      }
      event.preventDefault();
      void (async () => {
        const first = files[0];
        if (!first) {
          return;
        }
        const source = await fileToSource(first);
        if (!before) {
          replaceBefore(source);
          return;
        }
        replaceAfter(source);
      })();
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [before, replaceAfter, replaceBefore]);

  useEffect(() => {
    return () => {
      revokeSource(beforeRef.current);
      revokeSource(afterRef.current);
    };
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Image Diff</h1>
          <p>2-up, swipe, and onion skin — files stay in this browser.</p>
        </div>
        <div className="app__slots">
          <FileSlot label="Before" source={before} onChange={replaceBefore} />
          <FileSlot label="After" source={after} onChange={replaceAfter} />
        </div>
      </header>
      <main className="app__main">
        <ImageDiffViewer before={before} after={after} />
      </main>
    </div>
  );
}
