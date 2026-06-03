"use client";

export function Loader() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-moss/30" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-forest animate-spin" />
        {/* Leaf icon in center */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🌿
        </div>
      </div>
      <p className="text-sm font-medium text-clay tracking-wide animate-pulse">
        Identifying plant…
      </p>
    </div>
  );
}
