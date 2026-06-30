"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const IMG_SIZE = 100; // display px — base for scale calculation

export function LoadingScreen() {
  const [phase, setPhase] = useState<"show" | "zoom">("show");
  const [done,  setDone]  = useState(false);

  // Read theme and viewport synchronously on first client render — no flash, no useEffect needed.
  const [isDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );
  const [maxScale] = useState<number>(() => {
    if (typeof window === "undefined") return 32;
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Full diagonal of viewport → with 1.6× safety factor covers any silhouette shape
    return Math.ceil(Math.sqrt(w * w + h * h) * 1.6 / IMG_SIZE);
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setDone(true), 350);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setPhase("zoom"), 480);
    // zoom = 580ms, bg fade delay 440ms → bg gone at 480+440+180 = 1100ms
    const t2 = setTimeout(() => setDone(true), 1120);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (done) return null;

  const isZoom = phase === "zoom";

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden select-none${isZoom ? " pointer-events-none" : ""}`}
    >
      {/* Background — waits until logo fills viewport, then fades */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#f3effb] via-[#f9f7ff] to-[#ede8fe] dark:from-[#050210] dark:via-[#07031a] dark:to-[#0b0522]"
        animate={{ opacity: isZoom ? 0 : 1 }}
        transition={{
          duration: 0.18,
          delay:    isZoom ? 0.44 : 0,
          ease:     "easeOut",
        }}
      />

      {/* Silhouette — grows from center to fill full viewport, stays fully opaque */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={isZoom ? { scale: maxScale } : { scale: 1 }}
          transition={
            isZoom
              ? { duration: 0.58, ease: [0.4, 0, 1, 1] }
              : { duration: 0 }
          }
          style={{ transformOrigin: "center center" }}
        >
          <Image
            src={isDark ? "/whitesil.png" : "/blacksil.png"}
            alt=""
            width={IMG_SIZE}
            height={IMG_SIZE}
            priority
            draggable={false}
          />
        </motion.div>
      </div>

      {/* KAT — static, visible from first frame */}
      <span className="absolute bottom-[11vh] left-0 right-0 text-center font-sans font-black text-[13px] tracking-[0.48em] text-[#1e0a3a]/60 dark:text-[#c4b5fd]/55">
        KAT
      </span>
    </div>
  );
}
