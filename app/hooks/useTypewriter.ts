"use client";
import { useState, useEffect, useRef } from "react";

export function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !text) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    indexRef.current = 0;
    lastTimeRef.current = null;

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= speed) {
        const chars = Math.floor(elapsed / speed);
        indexRef.current = Math.min(indexRef.current + chars, text.length);
        setDisplayed(text.slice(0, indexRef.current));
        lastTimeRef.current = timestamp;

        if (indexRef.current >= text.length) {
          setDone(true);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed]);

  return { displayed, done };
}
