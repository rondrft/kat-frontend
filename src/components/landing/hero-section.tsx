"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Command, Zap, Shield, Gift, BarChart3 } from "lucide-react";
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

const FEATURE_CARDS = [
  {
    Icon: Zap,
    title: "Smart Automation",
    desc: "Automate actions, welcome messages, roles and more.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    glow: "rgba(245,158,11,0.35)",
  },
  {
    Icon: Shield,
    title: "Advanced Moderation",
    desc: "Powerful moderation tools to keep your server safe.",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    glow: "rgba(99,102,241,0.35)",
  },
  {
    Icon: Gift,
    title: "Unlimited Fun",
    desc: "Games, economy, activities and much more.",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    glow: "rgba(236,72,153,0.35)",
  },
  {
    Icon: BarChart3,
    title: "Detailed Dashboard",
    desc: "Modern dashboard with powerful real-time stats.",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
    glow: "rgba(6,182,212,0.35)",
    lightText: true,
  },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { loginWithDiscord } = useAuth();
  const router = useRouter();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const scale        = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 0.85, 0.48]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5, 1], [0, 8, 18]);
  const cardOpacity  = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const navScale     = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);

  const rawOnCard = useTransform(scrollYProgress, (v): number => (v < 0.18 ? 1 : 0));
  const onCard    = useSpring(rawOnCard, { stiffness: 200, damping: 30 });

  const lightNavColor = useTransform(onCard, [0, 1], ["#ffffff", "#000000"]);
  const lightBorder   = useTransform(onCard, [0, 1], ["rgba(139,92,246,0.25)", "rgba(139,92,246,0.5)"]);

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

  useEffect(() => {
    if (typeof requestIdleCallback === "undefined") {
      router.prefetch("/dashboard");
      return;
    }
    const id = requestIdleCallback(() => router.prefetch("/dashboard"));
    return () => cancelIdleCallback(id);
  }, [router]);

  const inDark = mounted && resolvedTheme === "dark";

  const navColorStyle  = !mounted ? undefined
    : inDark  ? { color: "#ffffff" }
    : { color: lightNavColor };
  const navBorderStyle = !mounted ? undefined
    : inDark  ? { borderColor: "rgba(167,139,250,0.6)" }
    : { borderColor: lightBorder };

  const gradientStyle = !mounted || !inDark
    ? {
        backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 40%, #c4b5fd 70%, #818cf8 100%)",
        WebkitBackgroundClip: "text" as const,
        WebkitTextFillColor: "transparent",
        backgroundClip: "text" as const,
        filter: mounted ? "drop-shadow(0 0 18px rgba(139,92,246,0.28))" : undefined,
      }
    : {
        backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #c4b5fd 50%, #7c3aed 100%)",
        WebkitBackgroundClip: "text" as const,
        WebkitTextFillColor: "transparent",
        backgroundClip: "text" as const,
      };

  return (
    <section ref={sectionRef} className="relative h-[250vh]">

      {/* Fixed nav — KAT wordmark */}
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

      {/* Fixed nav — buttons */}
      <motion.div
        className="fixed top-8 right-8 z-50 origin-top-right flex items-center gap-2.5 sm:gap-3"
        style={{ scale: navScale }}
      >
        <button
          type="button"
          onClick={loginWithDiscord}
          className="flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 h-[4.5rem] rounded-[14px] bg-violet-600 dark:bg-[#7c3aed] text-white font-black text-sm sm:text-[1.05rem] tracking-[0.04em] select-none transition-colors hover:bg-violet-700 dark:hover:bg-[#6d28d9]"
        >
          <Sparkles className="w-5 h-5 sm:w-[1.25rem] sm:h-[1.25rem] shrink-0" />
          LOGIN
        </button>
        <MotionLink
          href="/dashboard"
          className={`group relative flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-[14px] border-[2.5px]${!mounted ? " border-foreground/40 dark:border-[#d6ff00]/60" : ""}`}
          style={navBorderStyle}
        >
          <span className="absolute inset-0 rounded-[14px] bg-violet-600 dark:bg-[#7c3aed] [clip-path:inset(100%_0_0_0_round_14px)] group-hover:[clip-path:inset(0%_0_0_0_round_14px)] transition-[clip-path] duration-300 ease-in-out" />
          <motion.span
            className={`relative z-10 group-hover:text-white dark:group-hover:text-white transition-colors duration-200${!mounted ? " text-foreground" : ""}`}
            style={navColorStyle}
          >
            <Command className="w-[1.25rem] h-[1.25rem]" />
          </motion.span>
        </MotionLink>
      </motion.div>

      {/* Sticky hero card */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ perspective: "1000px" }}
        data-pixel-trail-exclude=""
      >
        <motion.div
          ref={cardRef}
          className="absolute inset-0 overflow-hidden bg-white dark:bg-[#060900]"
          style={{
            scale,
            opacity: cardOpacity,
            borderRadius,
          }}
        >
          <FluidCanvas isDark={resolvedTheme === "dark"} />

          {/* Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ zIndex: 1 }}
          >
            <span
              className="font-sans font-black text-violet-400/[0.09] dark:text-white/[0.04]"
              style={{ fontSize: "clamp(10rem, 40vw, 30rem)", lineHeight: 1, letterSpacing: "-0.05em" }}
            >
              KAT
            </span>
          </div>

          {/* Left: slogan column */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[46%] flex flex-col justify-center gap-5 select-none pointer-events-none"
            style={{ paddingLeft: "14%", paddingRight: "2%", zIndex: 2 }}
          >
            {/* Glass pill label */}
            <div
              className="flex items-center gap-2 w-fit"
              style={{
                padding: "0.35rem 0.85rem 0.35rem 0.55rem",
                borderRadius: "999px",
                background: inDark ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.65)",
                border: inDark ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(196,181,253,0.45)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 2px 12px rgba(139,92,246,0.12), 0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: "1.1rem",
                  height: "1.1rem",
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  boxShadow: "0 2px 6px rgba(139,92,246,0.4)",
                }}
              >
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </span>
              <span className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-violet-600/80 dark:text-[#a78bfa]/80">
                All-in-One Discord Bot
              </span>
            </div>

            {/* Slogan */}
            <div className="flex flex-col" style={{ gap: "0.04em" }}>
              <span
                className="font-sans font-black leading-[1.05] tracking-[-0.04em] text-gray-900 dark:text-white"
                style={{ fontSize: "clamp(2rem, 4.4vw, 4.6rem)" }}
              >
                Powerful.
              </span>
              <span
                className="font-sans font-black leading-[1.05] tracking-[-0.04em] text-gray-900 dark:text-white"
                style={{ fontSize: "clamp(2rem, 4.4vw, 4.6rem)" }}
              >
                Modern.
              </span>
              <span
                className="font-sans font-black leading-[1.05] tracking-[-0.04em]"
                style={{ fontSize: "clamp(2rem, 4.4vw, 4.6rem)", ...gradientStyle }}
              >
                All-in-One.
              </span>
            </div>

            {/* Subtitle */}
            <p
              className="text-gray-500/80 dark:text-white/38 font-medium leading-relaxed"
              style={{ fontSize: "clamp(0.82rem, 1.05vw, 0.975rem)", maxWidth: "24rem" }}
            >
              The ultimate Discord bot to moderate, automate and entertain your server.
            </p>
          </div>

          {/* Right: glass circle + cat — z-5, sits below the cards */}
          <div
            className="absolute top-0 right-0 bottom-0 w-[54%] pointer-events-none select-none"
            style={{ paddingRight: "13%", paddingLeft: "2%", zIndex: 5 }}
          >
            {/* Crystal glass circle — light mode only */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%] rounded-full dark:hidden"
              style={{
                width:  "min(64vh, 50vw)",
                height: "min(64vh, 50vw)",
                background: "radial-gradient(ellipse at 38% 33%, rgba(216,180,254,0.22) 0%, rgba(196,181,253,0.10) 42%, transparent 68%)",
                border: "1.5px solid rgba(216,180,254,0.30)",
                boxShadow: "0 0 100px rgba(139,92,246,0.13), inset 0 0 55px rgba(255,255,255,0.10)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            />
            {/* Violet halo glow — light mode only */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%] rounded-full dark:hidden"
              style={{
                width:  "min(42vh, 34vw)",
                height: "min(42vh, 34vw)",
                background: "radial-gradient(ellipse at 50% 56%, rgba(139,92,246,0.14) 0%, transparent 70%)",
                filter: "blur(28px)",
              }}
            />
            {/* Cat image with parallax */}
            <div className="absolute inset-0" style={{ transform: "translateY(4%) translateX(-16%)" }}>
              <motion.div
                className="absolute inset-0"
                style={{ rotateX, rotateY, x: parallaxX, y: parallaxY }}
              >
                <Image
                  src="/katv3.png"
                  alt="Kat"
                  fill
                  className="object-contain object-center select-none pointer-events-none"
                  priority
                  sizes="54vw"
                  draggable={false}
                />
              </motion.div>
            </div>
          </div>

          {/* Feature cards — z-20, float above everything including the cat */}
          <div
            className="absolute bottom-0 left-0 right-0 flex gap-3"
            style={{ padding: "0 12% 5.5% 12%", zIndex: 20 }}
          >
            {FEATURE_CARDS.map(({ Icon, title, desc, gradient, glow, lightText }) => (
              <div
                key={title}
                className="flex-1 flex flex-row items-center gap-3.5 rounded-2xl px-4 py-6 bg-white/45 dark:bg-white/[0.04] border border-violet-100/60 dark:border-white/[0.07]"
                style={{
                  backdropFilter: "blur(32px)",
                  WebkitBackdropFilter: "blur(32px)",
                  boxShadow: "0 8px 40px rgba(139,92,246,0.07), 0 1px 4px rgba(0,0,0,0.03)",
                }}
              >
                {/* Icon — left, sized to span title+desc height */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={!inDark
                    ? { background: gradient, boxShadow: `0 4px 16px ${glow}` }
                    : { background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)" }
                  }
                >
                  <Icon
                    className={`w-[1.1rem] h-[1.1rem] ${inDark ? "text-[#a78bfa]" : "text-white"}`}
                  />
                </div>
                {/* Title + desc — right of icon */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className={`font-semibold text-[0.8rem] leading-tight truncate ${lightText && !inDark ? "text-white" : "text-gray-900 dark:text-white/85"}`}>
                    {title}
                  </div>
                  <p className={`text-[0.71rem] leading-snug line-clamp-2 ${lightText && !inDark ? "text-white/75" : "text-gray-400/90 dark:text-white/32"}`}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </motion.div>
      </div>

    </section>
  );
}
