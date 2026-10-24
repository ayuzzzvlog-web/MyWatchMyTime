import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useToast } from '../../lib/store';
import { cx } from '../../lib/format';

export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const { push } = useToast();

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setUploading(true);
    setProgress(8);
    const timer = setInterval(() => setProgress((p) => Math.min(88, p + 7)), 260);
    try {
      const res = await api.uploadImages(list.slice(0, 8));
      onChange([...value, ...res.files.map((f) => f.url)]);
      push({ title: `${res.files.length} image${res.files.length > 1 ? 's' : ''} uploaded`, tone: 'success' });
    } catch (error) {
      push({
        title: error instanceof ApiError ? error.message : 'Upload failed',
        description: 'Use JPG, PNG or WEBP under 15 MB.',
        tone: 'error',
      });
    } finally {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 350);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={cx(
          'relative flex cursor-pointer flex-col items-center justify-center border border-dashed px-6 py-9 text-center transition-colors',
          dragging
            ? 'border-gold bg-gold/[0.06]'
            : 'border-ivory/15 bg-white/[0.015] hover:border-gold/40 hover:bg-white/[0.03]',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            e.target.value = '';
          }}
        />
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-gold" />
            <p className="mt-3 text-[11px] tracking-[0.14em] text-ivory/60 uppercase">Processing images…</p>
            <div className="mt-3 h-[2px] w-40 bg-ivory/10">
              <div className="h-full bg-gold transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="size-6 text-gold/60" strokeWidth={1.4} />
            <p className="mt-3 text-[11px] tracking-[0.14em] text-ivory/60 uppercase">
              Drop images here or click to browse
            </p>
            <p className="mt-1.5 text-[10px] text-ivory/25">
              JPG, PNG, WEBP or HEIC · up to 8 at a time · auto-optimised to WebP
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="flex items-center gap-1.5 text-[10px] tracking-[0.14em] text-ivory/40 uppercase hover:text-ivory"
        >
          <Link2 className="size-3" /> Add by URL
        </button>
        <span className="ml-auto text-[10px] text-ivory/25">{value.length} / 12 images</span>
      </div>

      {showUrl && (
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… or /images/w1.jpg"
            className="flex-1 border border-ivory/12 bg-white/[0.02] px-3 py-2 text-xs text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (!url.trim()) return;
              onChange([...value, url.trim()]);
              setUrl('');
              setShowUrl(false);
            }}
            className="border border-gold/40 bg-gold/10 px-3 text-[10px] tracking-[0.14em] text-gold uppercase"
          >
            Add
          </button>
        </div>
      )}

      {value.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className={cx(
                'group relative aspect-square overflow-hidden border bg-surface-2',
                index === 0 ? 'border-gold/60' : 'border-ivory/10',
              )}
            >
              <img src={src} alt="" className="size-full object-cover" />
              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-gold px-1.5 py-0.5 text-[8px] font-bold tracking-[0.1em] text-ink uppercase">
                  <Star className="size-2 fill-ink" /> Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-black/70 px-1 py-1 transition-transform duration-200 group-hover:translate-y-0">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    aria-label="Move left"
                    className="grid size-6 place-items-center text-ivory/70 hover:text-gold disabled:opacity-25"
                    disabled={index === 0}
                  >
                    <ArrowLeft className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    aria-label="Move right"
                    className="grid size-6 place-items-center text-ivory/70 hover:text-gold disabled:opacity-25"
                    disabled={index === value.length - 1}
                  >
                    <ArrowRight className="size-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove image"
                  className="grid size-6 place-items-center text-ivory/60 hover:text-rose-300"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center border border-dashed border-ivory/15 text-ivory/25 transition-colors hover:border-gold/40 hover:text-gold/60"
            aria-label="Add image"
          >
            <ImagePlus className="size-5" />
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-ivory/25">
          No images yet — the first image becomes the cover.
        </p>
      )}
    </div>
  );
}
