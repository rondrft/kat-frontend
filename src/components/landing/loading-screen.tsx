"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function LoadingScreen() {
  const [phase, setPhase] = useState<"show" | "zoom">("show");
  const [done,  setDone]  = useState(false);

  useEffect(() => {
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
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden select-none${isZoom ? " pointer-events-none" : ""}`}
    >
      {/* Background — fades out during zoom */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#f3effb] via-[#f9f7ff] to-[#ede8fe] dark:from-[#050210] dark:via-[#07031a] dark:to-[#0b0522]"
        animate={{ opacity: isZoom ? 0 : 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.6, 1] }}
      />

      {/* Cat head — grows and fades on zoom */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ paddingBottom: "8vh" }}
      >
        <motion.div
          className="text-[#1e0a3a] dark:text-[#c4b5fd]"
          animate={
            isZoom
              ? { scale: 34, opacity: 0 }
              : { scale: 1,  opacity: 1 }
          }
          transition={
            isZoom
              ? {
                  scale:   { duration: 0.62, ease: [0.4, 0, 1, 1] },
                  opacity: { duration: 0.50, delay: 0.12, ease: "easeIn" },
                }
              : { duration: 0 }
          }
        >
          <svg
            viewBox="0 0 100 100"
            width="76"
            height="76"
            fill="currentColor"
            aria-hidden="true"
          >
            {/* Left ear */}
            <polygon points="16,6 31,40 5,54" />
            {/* Right ear */}
            <polygon points="84,6 69,40 95,54" />
            {/* Head */}
            <circle cx="50" cy="64" r="30" />
          </svg>
        </motion.div>
      </div>

      {/* KAT label — fades out quickly on zoom */}
      <motion.span
        className="absolute bottom-[11vh] left-0 right-0 text-center font-sans font-black text-[13px] tracking-[0.48em] text-[#1e0a3a]/60 dark:text-[#c4b5fd]/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: isZoom ? 0 : 1 }}
        transition={{ duration: 0.22, delay: isZoom ? 0 : 0.18 }}
      >
        KAT
      </motion.span>
    </div>
  );
}
