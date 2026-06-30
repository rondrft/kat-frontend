"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

export function CommunitySection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const spring = { stiffness: 60, damping: 22, mass: 0.8 };

  // Characters slide in from the edges (reversible, scroll-driven)
  const leftRaw  = useTransform(scrollYProgress, [0, 1], [-260, -50]);
  const rightRaw = useTransform(scrollYProgress, [0, 1], [260, 50]);
  const leftX    = useSpring(leftRaw,  spring);
  const rightX   = useSpring(rightRaw, spring);

  // Text blocks converge horizontally — pushed outward at start, come together on scroll
  const leftTextXRaw  = useTransform(scrollYProgress, [0, 1], [-52, 0]);
  const rightTextXRaw = useTransform(scrollYProgress, [0, 1], [52, 0]);
  const leftTextX     = useSpring(leftTextXRaw,  spring);
  const rightTextX    = useSpring(rightTextXRaw, spring);

  // Fade in as section enters view
  const centerOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-32 md:py-48"
    >
      {/* ── Left character ─────────────────────────────────────────── */}
      {/* Rotated outward, bottom extends below section (clipped by overflow:hidden) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-90px] left-0 select-none"
        style={{ x: leftX, rotate: -8 }}
      >
        <Image
          src="/leftkat.webp"
          alt=""
          width={480}
          height={720}
          className="h-[260px] w-auto object-contain md:h-[580px]"
          draggable={false}
        />
      </motion.div>

      {/* ── Right character ─────────────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-90px] right-0 select-none"
        style={{ x: rightX, rotate: 8 }}
      >
        <Image
          src="/rightkat.webp"
          alt=""
          width={480}
          height={720}
          className="h-[260px] w-auto object-contain md:h-[580px]"
          draggable={false}
        />
      </motion.div>

      {/* ── Editorial two-column text ───────────────────────────────── */}
      <motion.div
        className="relative z-10 flex w-full items-center px-8 md:px-16"
        style={{ opacity: centerOpacity }}
      >
        {/* Left block — right-aligned on desktop, centered on mobile */}
        <motion.div
          style={{ x: leftTextX }}
          className="flex flex-1 flex-col items-center text-center md:items-end md:text-right"
        >
          <span
            className="outfit block font-black leading-[0.9] tracking-[-0.04em] text-foreground"
            style={{ fontSize: "clamp(2rem, 5.5vw, 5.5rem)" }}
          >
            BUILT
          </span>
          <span
            className="outfit block font-black leading-[0.9] tracking-[-0.04em] text-[#d6ff00]"
            style={{ fontSize: "clamp(2rem, 5.5vw, 5.5rem)" }}
          >
            TO GROW
          </span>
          <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-foreground/50">
            Automate your server, protect your members and keep everything organized.
          </p>
          <div
            aria-hidden
            className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6ff00] text-black"
          >
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>

        {/* Center air — the editorial gap */}
        <div className="w-[48px] shrink-0 md:w-[120px]" />

        {/* Right block — left-aligned on desktop, centered on mobile */}
        <motion.div
          style={{ x: rightTextX }}
          className="flex flex-1 flex-col items-center text-center md:items-start md:text-left"
        >
          <span
            className="outfit block font-black leading-[0.9] tracking-[-0.04em] text-[#d6ff00]"
            style={{ fontSize: "clamp(2rem, 5.5vw, 5.5rem)" }}
          >
            YOUR
          </span>
          <span
            className="outfit block font-black leading-[0.9] tracking-[-0.04em] text-foreground"
            style={{ fontSize: "clamp(2rem, 5.5vw, 5.5rem)" }}
          >
            COMMUNITY.
          </span>
          <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-foreground/50">
            Powerful moderation tools, smart features and a better Discord experience.
          </p>
          <div
            aria-hidden
            className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6ff00] text-black"
          >
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
