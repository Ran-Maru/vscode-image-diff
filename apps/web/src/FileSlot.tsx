import { useId, useState, type DragEvent } from 'react';
import { fileToSource, isImageFile } from './fileSource';
import type { ImageSource } from '@image-diff/viewer';

interface FileSlotProps {
  label: string;
  source?: ImageSource;
  onChange: (source: ImageSource) => void;
}

export function FileSlot({ label, source, onChange }: FileSlotProps) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const applyFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    try {
      setError(null);
      onChange(await fileToSource(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image');
    }
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setOver(false);
    const file = [...event.dataTransfer.files].find(isImageFile);
    void applyFile(file);
  };

  return (
    <label
      className={`slot${over ? ' is-over' : ''}${source ? ' has-file' : ''}`}
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <span className="slot__label">{label}</span>
      {source ? (
        <>
          <img className="slot__thumb" src={source.url} alt="" />
          <span className="slot__name">{source.name}</span>
          <span className="slot__meta">
            {source.width}×{source.height}
          </span>
        </>
      ) : (
        <span className="slot__hint">Drop a PNG, JPG, GIF, or SVG, or click to browse</span>
      )}
      {error ? <span className="slot__error">{error}</span> : null}
      <input
        id={inputId}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.svg,image/png,image/jpeg,image/gif,image/svg+xml"
        hidden
        onChange={(event) => {
          void applyFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </label>
  );
}
