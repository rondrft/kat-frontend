"use client";

import { motion } from "framer-motion";

export function BackgroundEffects() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />

      <div className="gradient-mesh absolute inset-0 opacity-80" />

      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 75%)",
        }}
      />

      <motion.div
        className="absolute -left-[20%] top-[10%] h-[420px] w-[420px] rounded-full bg-kat/20 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 24, 0], opacity: [0.4, 0.55, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[15%] bottom-[5%] h-[380px] w-[380px] rounded-full bg-primary/15 blur-[100px]"
        animate={{ x: [0, -32, 0], y: [0, -20, 0], opacity: [0.3, 0.45, 0.3] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_72%)]" />

      <div className="bg-noise absolute inset-0 opacity-[0.015] mix-blend-overlay" />
    </div>
  );
}
