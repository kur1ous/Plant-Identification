"use client";
import { useState, useCallback, useRef } from "react";
import { Dropzone } from "@/app/components/Dropzone";
import { Loader } from "@/app/components/Loader";
import { ResultCard } from "@/app/components/ResultCard";
import { ImageGallery } from "@/app/components/ImageGallery";

interface IdentifyResult {
  scientificName: string;
  commonNames: string[];
  genus: string;
  family: string;
  score: number;
}

interface PlantImage {
  url: string;
  thumbnail: string;
  attribution: string;
  sourceLink: string;
}

type Status = "idle" | "identifying" | "done" | "error";

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [images, setImages] = useState<PlantImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const galleryFetchedRef = useRef(false);

  const handleImage = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setStatus("identifying");
    setResult(null);
    setImages([]);
    setErrorMsg("");
    galleryFetchedRef.current = false;

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("/api/identify", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "no_match") {
          setErrorMsg("Couldn't identify this one — try a clearer photo of a single leaf or flower.");
        } else {
          setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        }
        setStatus("error");
        return;
      }

      const top = data.results?.[0];
      if (!top) {
        setErrorMsg("No plant found in this image. Try a close-up of a leaf, flower, or fruit.");
        setStatus("error");
        return;
      }

      setResult(top);
      setStatus("done");
    } catch {
      setErrorMsg("Network error — check your connection and try again.");
      setStatus("error");
    }
  }, []);

  const fetchGallery = useCallback(async (scientificName: string) => {
    if (galleryFetchedRef.current) return;
    galleryFetchedRef.current = true;
    setImagesLoading(true);
    try {
      const res = await fetch(`/api/images?q=${encodeURIComponent(scientificName)}`);
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {
      // Gallery is optional — silently fail
    } finally {
      setImagesLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-paper relative overflow-hidden">
      {/* Subtle leaf texture overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] bg-[url('/leaf-texture.svg')] bg-repeat" />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-moss text-sm font-medium tracking-widest uppercase mb-3">
            <span>🌿</span>
            <span>Plant Identifier</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-forest leading-tight">
            What plant is this?
          </h1>
          <p className="text-clay/70 mt-3 text-base leading-relaxed">
            Upload a photo and we&apos;ll identify it for you.
          </p>
        </header>

        {/* Upload zone */}
        <Dropzone
          onImage={handleImage}
          preview={preview}
          disabled={status === "identifying"}
        />

        {/* States */}
        <div className="mt-6">
          {status === "identifying" && <Loader />}

          {status === "error" && (
            <div className="rounded-2xl border border-clay/30 bg-clay/5 px-5 py-4 text-clay text-sm leading-relaxed animate-fade-in">
              <span className="mr-2">🍂</span>
              {errorMsg}
            </div>
          )}

          {status === "done" && result && (
            <>
              <ResultCard
                result={result}
                onTypingDone={() => fetchGallery(result.scientificName)}
              />
              <ImageGallery images={images} loading={imagesLoading} />
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-clay/40 text-xs space-y-1">
          <p>Powered by PlantNet · Photos from iNaturalist</p>
        </footer>
      </div>
    </main>
  );
}
