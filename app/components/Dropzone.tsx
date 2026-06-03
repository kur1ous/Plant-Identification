"use client";
import { useRef, useState, useCallback, useEffect } from "react";
interface DropzoneProps {
  onImage: (file: File) => void;
  preview: string | null;
  disabled?: boolean;
}

export function Dropzone({ onImage, preview, disabled }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onImage(file);
    },
    [onImage]
  );

  // Clipboard paste
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((i) => i.type.startsWith("image/"));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) handleFile(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile, disabled]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none",
        "min-h-64 overflow-hidden",
        dragging
          ? "border-forest bg-sage/20 scale-[1.01]"
          : "border-moss/50 bg-cream/50 hover:border-forest hover:bg-sage/10",
        disabled ? "opacity-60 cursor-not-allowed" : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
        disabled={disabled}
      />

      {preview ? (
        <>
          {/* Plain img — blob URLs are local, no Next.js optimization needed */}
          <img
            src={preview}
            alt="Plant preview"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-forest/10 rounded-2xl" />
          <span className="absolute bottom-3 right-4 text-xs text-cream/80 bg-forest/60 px-2 py-1 rounded-full backdrop-blur-sm">
            Click or drop to change
          </span>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 px-8 py-10 text-center pointer-events-none">
          <span className="text-5xl">🌱</span>
          <p className="text-clay font-semibold text-lg">Drop a photo here</p>
          <p className="text-clay/70 text-sm leading-relaxed">
            or click to browse · paste with{" "}
            <kbd className="font-mono text-xs bg-moss/20 px-1.5 py-0.5 rounded">
              Ctrl+V
            </kbd>
          </p>
          <p className="text-clay/40 text-xs mt-1">JPG, PNG, WEBP — any plant photo</p>
        </div>
      )}
    </div>
  );
}
