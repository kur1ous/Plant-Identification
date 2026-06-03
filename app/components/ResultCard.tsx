"use client";
import { useEffect, useRef } from "react";
import { useTypewriter } from "@/app/hooks/useTypewriter";

interface Result {
  scientificName: string;
  commonNames: string[];
  genus: string;
  family: string;
  score: number;
}

interface ResultCardProps {
  result: Result;
  onTypingDone?: () => void;
}

export function ResultCard({ result, onTypingDone }: ResultCardProps) {
  const primaryCommon = result.commonNames[0] ?? result.scientificName;
  const { displayed, done } = useTypewriter(primaryCommon, 40);
  const calledRef = useRef(false);

  useEffect(() => {
    if (done && onTypingDone && !calledRef.current) {
      calledRef.current = true;
      onTypingDone();
    }
  }, [done, onTypingDone]);

  return (
    <div className="rounded-2xl bg-cream border border-moss/30 shadow-botanical p-6 space-y-4 animate-fade-in">
      {/* Primary name with typewriter */}
      <div>
        <p className="text-xs font-medium tracking-widest text-moss uppercase mb-1">
          Identified plant
        </p>
        <h2 className="font-display text-3xl text-forest leading-tight">
          {displayed}
          {!done && (
            <span className="inline-block w-0.5 h-8 bg-forest ml-0.5 animate-blink align-middle" />
          )}
        </h2>
        <p className="text-clay/80 italic text-base mt-1">{result.scientificName}</p>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex justify-between text-xs text-clay/60 mb-1">
          <span>Confidence</span>
          <span className="font-semibold text-forest">{result.score}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-moss/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-moss to-forest transition-all duration-1000"
            style={{ width: `${result.score}%` }}
          />
        </div>
      </div>

      {/* Taxonomy pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {result.genus && <Pill label="Genus" value={result.genus} />}
        {result.family && <Pill label="Family" value={result.family} />}
        {result.commonNames.slice(1, 4).map((name) => (
          <span
            key={name}
            className="text-xs bg-sage/30 text-forest px-2.5 py-1 rounded-full"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs bg-moss/15 text-clay px-2.5 py-1 rounded-full">
      <span className="text-clay/50">{label}: </span>
      <span className="font-medium italic">{value}</span>
    </span>
  );
}
