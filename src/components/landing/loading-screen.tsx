"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const IMG_SIZE = 100;

export function LoadingScreen() {
  const [phase,    setPhase]    = useState<"show" | "zoom">("show");
  const [done,     setDone]     = useState(false);
  const [maxScale, setMaxScale] = useState(32);

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setMaxScale(Math.ceil(Math.sqrt(w * w + h * h) * 1.6 / IMG_SIZE));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setDone(true), 350);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setPhase("zoom"), 480);
    const t2 = setTimeout(() => setDone(true), 1120);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (done) return null;

  const isZoom = phase === "zoom";

  return (
    <div className={`fixed inset-0 z-[9999] overflow-hidden select-none${isZoom ? " pointer-events-none" : ""}`}>

      {/* Background — full white/black base with subtle violet tint */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f0e8ff] dark:from-black dark:via-black dark:to-[#0a0118]"
        animate={{ opacity: isZoom ? 0 : 1 }}
        transition={{ duration: 0.18, delay: isZoom ? 0.44 : 0, ease: "easeOut" }}
      />

      {/* Silhouette — grows to cover full viewport, stays fully opaque */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={isZoom ? { scale: maxScale } : { scale: 1 }}
          transition={isZoom ? { duration: 0.58, ease: [0.4, 0, 1, 1] } : { duration: 0 }}
          style={{ transformOrigin: "center center" }}
        >
          {/* CSS-driven theme selection — no JS required, no hydration mismatch */}
          <Image
            src="/blacksil.png"
            alt=""
            width={IMG_SIZE}
            height={IMG_SIZE}
            priority
            draggable={false}
            className="block dark:hidden"
          />
          <Image
            src="/whitesil.png"
            alt=""
            width={IMG_SIZE}
            height={IMG_SIZE}
            priority
            draggable={false}
            className="hidden dark:block"
          />
        </motion.div>
      </div>

      {/* KAT — visible from first frame, fades out as zoom starts (before logo fills screen) */}
      <motion.span
        className="absolute bottom-[11vh] left-0 right-0 text-center font-sans font-black text-[13px] tracking-[0.48em] text-black/55 dark:text-white/45"
        animate={{ opacity: isZoom ? 0 : 1 }}
        transition={{ duration: 0.20, ease: "easeOut" }}
      >
        KAT
      </motion.span>
    </div>
  );
}
