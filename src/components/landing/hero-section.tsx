"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Command } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { FluidCanvas } from "./fluid-canvas";

const MotionLink = motion(Link);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { loginWithDiscord } = useAuth();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const scale        = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 0.85, 0.48]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5, 1], [0, 8, 18]);
  const cardOpacity  = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const navScale     = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);

  // Nav colour driven by Framer Motion — no React state, no re-renders during scroll.
  // rawOnCard is 1 while the hero card covers the viewport (progress < 0.18), 0 after.
  // The spring smooths the discrete snap to match the visual feel of transition-colors 300ms.
  const rawOnCard = useTransform(scrollYProgress, (v): number => (v < 0.18 ? 1 : 0));
  const onCard    = useSpring(rawOnCard, { stiffness: 200, damping: 30 });

  // Light mode: black on white card, white off card
  const lightNavColor = useTransform(onCard, [0, 1], ["#ffffff", "#000000"]);
  const lightBorder   = useTransform(onCard, [0, 1], ["rgba(255,255,255,0.4)", "rgba(0,0,0,0.4)"]);

  // ── Parallax ─────────────────────────────────────────────────────────────
  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 35, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 35, damping: 22 });
  const rotateX   = useTransform(smoothY, [-1, 1], [8, -8]);
  const rotateY   = useTransform(smoothX, [-1, 1], [-12, 12]);
  const parallaxX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const parallaxY = useTransform(smoothY, [-1, 1], [-18, 18]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth)  * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  useEffect(() => { setMounted(true); }, []);

  const inDark = mounted && resolvedTheme === "dark";

  // Style objects selected once per render (when theme/mount changes), not per scroll frame.
  const navColorStyle  = !mounted ? undefined
    : inDark  ? { color: "#ffffff" }
    : { color: lightNavColor };
  const navBorderStyle = !mounted ? undefined
    : inDark  ? { borderColor: "rgba(214,255,0,0.6)" }
    : { borderColor: lightBorder };

  return (
    <section ref={sectionRef} className="relative h-[250vh]">

      <motion.div
        className="fixed top-8 left-8 z-50 origin-top-left"
        style={{ scale: navScale }}
      >
        <motion.span
          className={`font-sans font-black text-[3.25rem] sm:text-[4.25rem] tracking-[-0.04em] leading-none${!mounted ? " text-foreground" : ""}`}
          style={navColorStyle}
        >
          KAT
        </motion.span>
      </motion.div>

      <motion.div
        className="fixed top-8 right-8 z-50 origin-top-right flex items-center gap-2.5 sm:gap-3"
        style={{ scale: navScale }}
      >
        <button
          type="button"
          onClick={loginWithDiscord}
          className="flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 h-[4.5rem] rounded-[14px] bg-[#d6ff00] text-black font-black text-sm sm:text-[1.05rem] tracking-[0.04em] select-none transition-colors hover:bg-[#c4ec00]"
        >
          <Sparkles className="w-5 h-5 sm:w-[1.25rem] sm:h-[1.25rem] shrink-0" />
          LOGIN
        </button>
        <MotionLink
          href="/dashboard"
          className={`group relative flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-[14px] border-[2.5px]${!mounted ? " border-foreground/40 dark:border-[#d6ff00]/60" : ""}`}
          style={navBorderStyle}
        >
          <span className="absolute inset-0 rounded-[14px] bg-[#d6ff00] [clip-path:inset(100%_0_0_0_round_14px)] group-hover:[clip-path:inset(0%_0_0_0_round_14px)] transition-[clip-path] duration-300 ease-in-out" />
          <motion.span
            className={`relative z-10 group-hover:text-black transition-colors duration-200${!mounted ? " text-foreground" : ""}`}
            style={navColorStyle}
          >
            <Command className="w-[1.25rem] h-[1.25rem]" />
          </motion.span>
        </MotionLink>
      </motion.div>

      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          ref={cardRef}
          className="absolute inset-0 overflow-hidden bg-white dark:bg-[#060900]"
          style={{
            scale,
            opacity: cardOpacity,
            borderRadius,
            backgroundColor: mounted
              ? resolvedTheme === "dark" ? "#060900" : "#ffffff"
              : undefined,
          }}
        >
          <FluidCanvas isDark={resolvedTheme === "dark"} />

          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ zIndex: 1 }}
          >
            <span
              className="font-sans font-black text-foreground/[0.06]"
              style={{ fontSize: "clamp(10rem, 40vw, 30rem)", lineHeight: 1, letterSpacing: "-0.05em" }}
            >
              KAT
            </span>
          </div>

          <div
            data-pixel-trail-exclude=""
            className="absolute inset-0"
            style={{ transform: "translateY(8%)", zIndex: 2 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ rotateX, rotateY, x: parallaxX, y: parallaxY }}
            >
              <Image
                src="/katv2.webp"
                alt="Kat"
                fill
                className="object-contain select-none pointer-events-none"
                priority
                sizes="100vw"
                draggable={false}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
