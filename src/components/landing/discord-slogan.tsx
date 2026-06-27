"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type WordConfig = {
  text:   string;
  weight: "heavy" | "light";
};

type LineConfig = {
  key:   string;
  words: WordConfig[];
  delay: number;
  shine: boolean;
};

const LINES: LineConfig[] = [
  {
    key:   "build-your",
    words: [
      { text: "BUILD", weight: "heavy" },
      { text: "YOUR",  weight: "light" },
    ],
    delay: 0.05,
    shine: true,
  },
  {
    key:   "discord-server",
    words: [
      { text: "DISCORD", weight: "heavy" },
      { text: "SERVER",  weight: "light" },
    ],
    delay: 0.52,
    shine: true,
  },
  {
    key:   "the-right-way",
    words: [
      { text: "THE",   weight: "light" },
      { text: "RIGHT", weight: "heavy" },
      { text: "WAY",   weight: "light" },
    ],
    delay: 1.0,
    shine: true,
  },
  {
    key:   "with-kat",
    words: [
      { text: "WITH", weight: "light" },
      { text: "KAT",  weight: "heavy" },
    ],
    delay: 1.52,
    shine: false,
  },
];

const MASK_ENTER = 0.30;
const MASK_EXIT  = 0.42;
const MASK_TOTAL = MASK_ENTER + MASK_EXIT;
const MASK_FRAC  = MASK_ENTER / MASK_TOTAL;

function SloganLine({ line, inView }: { line: LineConfig; inView: boolean }) {
  const textDelay  = line.delay + MASK_ENTER;
  const shineDelay = line.delay + MASK_TOTAL + 0.12;

  return (
    <div className="relative overflow-hidden py-px">
      <motion.div
        className="flex items-baseline justify-center"
        style={{ gap: "0.28em" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: textDelay, duration: 0.01 }}
      >
        {line.words.map((word) =>
          word.weight === "heavy" ? (
            <span
              key={word.text}
              className="outfit font-black leading-none tracking-[-0.04em] text-foreground dark:text-[#d6ff00]"
              style={{ fontSize: "clamp(1.8rem, 7.5vw, 7.5rem)" }}
            >
              {word.text}
            </span>
          ) : (
            <span
              key={word.text}
              className="outfit font-semibold leading-none tracking-[-0.04em] text-foreground/60 dark:text-white/50"
              style={{ fontSize: "clamp(1.8rem, 7.5vw, 7.5rem)" }}
            >
              {word.text}
            </span>
          )
        )}
      </motion.div>

      {line.shine && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 15%, rgba(255,255,255,0.20) 50%, transparent 85%)",
            zIndex: 5,
          }}
          initial={{ x: "-130%" }}
          animate={inView ? { x: "240%" } : { x: "-130%" }}
          transition={{
            delay:    shineDelay,
            duration: 1.15,
            ease:     [0.25, 0.46, 0.45, 0.94],
          }}
        />
      )}

      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: "#d6ff00", zIndex: 10 }}
        initial={{ x: "-101%" }}
        animate={inView ? { x: ["-101%", "0%", "101%"] } : { x: "-101%" }}
        transition={{
          delay:    line.delay,
          duration: MASK_TOTAL,
          times:    [0, MASK_FRAC, 1],
          ease:     "easeInOut",
        }}
      />
    </div>
  );
}

export function DiscordSlogan() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center"
    >
      <div className="flex flex-col items-center">
        {LINES.map((line) => (
          <SloganLine key={line.key} line={line} inView={inView} />
        ))}
      </div>
    </section>
  );
}
