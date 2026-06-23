"use client";

import { motion } from "framer-motion";

export function BackgroundEffects() {
  const blobs = [
    { x: "15%", y: "10%", size: 500, color: "bg-blue-500/20", dur: 16, delay: 0 },
    { x: "70%", y: "20%", size: 400, color: "bg-cyan-400/15", dur: 20, delay: 2 },
    { x: "50%", y: "60%", size: 600, color: "bg-indigo-500/18", dur: 18, delay: 1 },
    { x: "80%", y: "70%", size: 350, color: "bg-sky-400/12", dur: 22, delay: 3 },
    { x: "25%", y: "80%", size: 450, color: "bg-blue-600/15", dur: 14, delay: 0.5 },
  ];

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: `${(i * 7 + 13) % 100}%`,
    y: `${(i * 11 + 5) % 100}%`,
    size: 2 + (i % 3),
    dur: 4 + (i % 5) * 2,
    delay: (i % 7) * 0.7,
    xDrift: (i % 3 - 1) * 40,
    yDrift: -(30 + (i % 5) * 15),
  }));

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />

      <div className="gradient-mesh absolute inset-0 opacity-70" />

      {/* Massive deep-blue backdrop smoke */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[130vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[200px]"
        animate={{
          scale: [1, 1.1, 0.95, 1.08, 1],
          opacity: [0.4, 0.55, 0.45, 0.55, 0.4],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-[25%] top-[15%] h-[100vh] w-[100vw] rounded-full bg-cyan-400/15 blur-[180px]"
        animate={{
          x: ["-8%", "8%", "-5%", "6%", "-8%"],
          y: ["-5%", "8%", "-6%", "5%", "-5%"],
          opacity: [0.3, 0.5, 0.35, 0.5, 0.3],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[5%] bottom-[5%] h-[90vh] w-[90vw] rounded-full bg-indigo-500/15 blur-[200px]"
        animate={{
          x: ["5%", "-8%", "6%", "-5%", "5%"],
          y: ["3%", "-6%", "5%", "-4%", "3%"],
          opacity: [0.25, 0.45, 0.3, 0.45, 0.25],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
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

      {/* Blue smoke blobs */}
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${b.color} blur-[100px]`}
          style={{ left: b.x, top: b.y, width: b.size, height: b.size }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
            opacity: [0.3, 0.5, 0.35, 0.5, 0.3],
          }}
          transition={{
            duration: b.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: b.delay,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={`p${i}`}
          className="absolute rounded-full bg-blue-400/40"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
          }}
          animate={{
            x: [0, p.xDrift],
            y: [0, p.yDrift],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeOut",
            delay: p.delay,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_72%)]" />

      <div className="bg-noise absolute inset-0 opacity-[0.015] mix-blend-overlay" />
    </div>
  );
}
