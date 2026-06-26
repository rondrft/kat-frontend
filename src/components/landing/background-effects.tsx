"use client";

import { motion } from "framer-motion";

const FADE_TRANSITION = {
  repeat: Infinity,
  ease: "easeInOut" as const,
};

export function BackgroundEffects() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />

      <div className="gradient-mesh absolute inset-0 opacity-70" />

      {/* Massive deep-blue backdrop smoke — scale/opacity only (GPU-friendly) */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[130vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[200px]"
        animate={{ scale: [1, 1.1, 0.95, 1.08, 1], opacity: [0.4, 0.55, 0.45, 0.55, 0.4] }}
        transition={{ duration: 20, ...FADE_TRANSITION }}
      />

      <motion.div
        className="absolute left-[25%] top-[15%] h-[100vh] w-[100vw] rounded-full bg-cyan-400/15 blur-[180px]"
        animate={{ opacity: [0.3, 0.5, 0.35, 0.5, 0.3] }}
        transition={{ duration: 25, ...FADE_TRANSITION }}
      />

      <motion.div
        className="absolute right-[5%] bottom-[5%] h-[90vh] w-[90vw] rounded-full bg-indigo-500/15 blur-[200px]"
        animate={{ opacity: [0.25, 0.45, 0.3, 0.45, 0.25] }}
        transition={{ duration: 28, ...FADE_TRANSITION, delay: 3 }}
      />

      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
        style={{
          backgroundImage: [
            "linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px)",
            "linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 75%)",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_72%)]" />
    </div>
  );
}
