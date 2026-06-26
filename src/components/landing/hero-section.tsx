"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserRound, LayoutDashboard } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useTheme } from "next-themes";
import { FluidCanvas } from "./fluid-canvas";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const scale           = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 0.85, 0.48]);
  const borderRadius    = useTransform(scrollYProgress, [0, 0.5, 1], [0, 30, 70]);
  const blockBgLight    = useTransform(scrollYProgress, [0, 1], ["#ffffff", "#c8e8ff"]);
  const blockBgDark     = useTransform(scrollYProgress, [0, 1], ["#0a0a0f", "#0b1c33"]);
  const backgroundColor = resolvedTheme === "dark" ? blockBgDark : blockBgLight;
  const navScale        = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);

  // ── Parallax ────────────────────────────────────────────
  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 35, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 35, damping: 22 });
  const rotateX   = useTransform(smoothY, [-1, 1], [8, -8]);
  const rotateY   = useTransform(smoothX, [-1, 1], [-12, 12]);
  const parallaxX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const parallaxY = useTransform(smoothY, [-1, 1], [-18, 18]);

  useEffect(() => {
    const isDark = () => document.documentElement.classList.contains("dark");
    const update = (v: number) => {
      const from: [number, number, number] = isDark() ? [10, 10, 15] : [255, 255, 255];
      const to:   [number, number, number] = isDark() ? [3, 13, 28]  : [255, 255, 255];
      const r = Math.round(from[0] + (to[0] - from[0]) * v);
      const g = Math.round(from[1] + (to[1] - from[1]) * v);
      const b = Math.round(from[2] + (to[2] - from[2]) * v);
      document.documentElement.style.backgroundColor = `rgb(${r},${g},${b})`;
    };
    const unsubscribe = scrollYProgress.on("change", update);
    update(scrollYProgress.get());
    return () => {
      unsubscribe();
      document.documentElement.style.backgroundColor = "";
    };
  }, [scrollYProgress]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth)  * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={sectionRef} className="relative h-[250vh]">

      <motion.div
        className="fixed top-8 left-8 z-50 origin-top-left"
        style={{ scale: navScale }}
      >
        <div className="flex flex-col items-center leading-none">
          <span className="courier-prime-regular text-[28px] tracking-[0.1em] uppercase text-foreground/50">
            Discord
          </span>
          <span className="lilita-one-regular font-bold text-6xl tracking-tight text-foreground leading-none">
            KAT
          </span>
        </div>
      </motion.div>

      <motion.div
        className="fixed top-8 right-8 z-50 origin-top-right flex items-center gap-3"
        style={{ scale: navScale }}
      >
        <button
          type="button"
          className="flex items-center gap-3 px-8 h-16 rounded-xl bg-[#7ac8f5] text-slate-800 font-semibold text-lg tracking-wide select-none transition-colors hover:bg-[#5bb8e8]"
        >
          <UserRound className="w-6 h-6" />
          LOGIN
        </button>
        <Link
          href="/dashboard"
          className="group relative flex items-center justify-center w-16 h-16 rounded-xl border-[3px] border-black dark:border-white overflow-hidden"
        >
          <span className="absolute top-0 left-0 right-0 h-0 group-hover:h-full bg-[#7ac8f5] rounded-b-[50%] group-hover:rounded-b-none transition-all duration-300 ease-in-out" />
          <LayoutDashboard className="w-7 h-7 text-foreground relative z-10 group-hover:text-slate-800 transition-colors duration-300" />
        </Link>
      </motion.div>

      <div
        className="sticky top-0 h-screen w-full overflow-hidden hero-scene"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          ref={cardRef}
          className="absolute inset-0 overflow-hidden"
          style={{ scale, backgroundColor, borderRadius }}
        >
          <FluidCanvas isDark={resolvedTheme === "dark"} />

          <div
            className="absolute inset-0"
            style={{ transform: "translateY(8%)", zIndex: 2 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ rotateX, rotateY, x: parallaxX, y: parallaxY }}
            >
              <Image
                src="/kat.png"
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
