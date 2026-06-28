"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const PixelTrailCanvas = dynamic(
  () => import("./pixel-trail").then((m) => ({ default: m.PixelTrail })),
  { ssr: false }
);

export function PixelTrailGlobal() {
  const { resolvedTheme }     = useTheme();
  const [mounted, setMounted] = useState(false);
  const excludeElRef          = useRef<Element | null>(null);

  useEffect(() => {
    setMounted(true);
    excludeElRef.current = document.querySelector("[data-pixel-trail-exclude]");
  }, []);

  const getExcludeRect = useCallback(() => {
    const el = excludeElRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: r.left   / window.innerWidth,
      y: r.top    / window.innerHeight,
      w: r.width  / window.innerWidth,
      h: r.height / window.innerHeight,
    };
  }, []);

  if (!mounted) return null;

  return (
    <PixelTrailCanvas
      color="#9aff00"
      opacity={resolvedTheme === "light" ? 0.18 : 0.70}
      gridSize={140}
      trailSize={0.02}
      maxAge={300}
      interpolate={5}
      gooeyEnabled
      gooStrength={1}
      getExcludeRect={getExcludeRect}
    />
  );
}
