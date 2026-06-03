"use client";
import Image from "next/image";
import { useState } from "react";

interface PlantImage {
  url: string;
  thumbnail: string;
  attribution: string;
  sourceLink: string;
}

interface ImageGalleryProps {
  images: PlantImage[];
  loading?: boolean;
}

export function ImageGallery({ images, loading }: ImageGalleryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-moss/15 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!images.length) return null;

  return (
    <div className="mt-6 space-y-3 animate-fade-in">
      <p className="text-xs font-medium tracking-widest text-moss uppercase">
        Photos from iNaturalist
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <GalleryImage key={i} img={img} />
        ))}
      </div>
    </div>
  );
}

function GalleryImage({ img }: { img: PlantImage }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) return null;

  return (
    <a
      href={img.sourceLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square rounded-xl overflow-hidden bg-moss/15 block"
      title={img.attribution}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-moss/15 animate-pulse rounded-xl" />
      )}
      <Image
        src={img.url}
        alt={img.attribution || "Plant photo"}
        fill
        className={[
          "object-cover transition-all duration-500 group-hover:scale-105",
          loaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
        sizes="(max-width: 640px) 50vw, 33vw"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        unoptimized
      />
      {/* Attribution overlay */}
      {loaded && img.attribution && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-forest/70 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-cream text-[10px] leading-tight line-clamp-2">
            {img.attribution}
          </p>
        </div>
      )}
    </a>
  );
}
