"use client";

import { useRef } from "react";
import { type ComponentType } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { MaskRevealLine } from "./mask-reveal-line";
import {
  UserPlus,
  Terminal,
  ScrollText,
  BarChart2,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

// ── Types / data ──────────────────────────────────────────────────────────────

type CardDef = {
  id:    string;
  Icon:  ComponentType<{ className?: string }>;
  label: string;
  desc:  string;
  badge: string | null;
  wide:  boolean;
};

const LOG_ENTRIES = [
  { text: "@spammer banned by auto-mod",  time: "just now", lime: true  },
  { text: "Message deleted in #general",  time: "2s ago",   lime: false },
  { text: "New member joined the server", time: "5s ago",   lime: false },
];

const CARDS: CardDef[] = [
  {
    id:    "roles",
    Icon:  UserPlus,
    label: "Auto Roles",
    desc:  "Assign roles on join, level-up, or verification — zero manual effort.",
    badge: "Active",
    wide:  false,
  },
  {
    id:    "commands",
    Icon:  Terminal,
    label: "Custom Commands",
    desc:  "Build commands with triggers, arguments, and branching logic.",
    badge: "50+",
    wide:  false,
  },
  {
    id:    "logs",
    Icon:  ScrollText,
    label: "Logs",
    desc:  "Every action logged — bans, edits, joins, messages — all auditable in real time.",
    badge: "Live",
    wide:  true,
  },
  {
    id:    "analytics",
    Icon:  BarChart2,
    label: "Analytics",
    desc:  "Member growth and activity trends, at a glance.",
    badge: null,
    wide:  false,
  },
  {
    id:    "settings",
    Icon:  SlidersHorizontal,
    label: "Server Settings",
    desc:  "One dashboard for every configuration.",
    badge: null,
    wide:  false,
  },
];

// ── Animation variants ────────────────────────────────────────────────────────

const gridVariants = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible:  {
    opacity: 1,
    y:       0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({ Icon, label, desc, badge, wide }: Omit<CardDef, "id">) {
  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl border border-violet-100/60 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.03] p-5 backdrop-blur-sm shadow-sm dark:shadow-none transition-colors duration-300 hover:border-violet-200/80 dark:hover:border-white/[0.13] hover:bg-white/90 dark:hover:bg-white/[0.05]${wide ? " col-span-2" : ""}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-[#A78BFA]/[0.08]">
          <Icon className="h-4 w-4 text-violet-600 dark:text-[#A78BFA]" />
        </span>
        <span className="text-[13px] font-semibold text-gray-800 dark:text-white/75">{label}</span>
        {badge && (
          <span className="ml-auto rounded px-2 py-[3px] text-[10px] font-black uppercase tracking-[0.12em] bg-violet-100 dark:bg-white/[0.06] text-violet-600 dark:text-white/35">
            {badge}
          </span>
        )}
      </div>

      <p className="text-[13px] leading-relaxed text-gray-500 dark:text-white/35">{desc}</p>

      {wide && (
        <div className="mt-4 space-y-[6px]">
          {LOG_ENTRIES.map((entry) => (
            <div key={entry.text} className="flex items-center gap-2.5 text-[11px]">
              <span
                className={`h-[5px] w-[5px] shrink-0 rounded-full ${
                  entry.lime ? "bg-violet-500" : "bg-gray-300 dark:bg-white/20"
                }`}
              />
              <span className="text-gray-600 dark:text-white/45">{entry.text}</span>
              <span className="ml-auto shrink-0 text-gray-400 dark:text-white/20">{entry.time}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function SmartSystems() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView     = useInView(sectionRef, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const cardsY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={sectionRef} className="relative px-8 md:px-16 py-28 md:py-44">

      {/* ── Section title ─────────────────────────────────────────────── */}
      <div className="mb-20 md:mb-28">
        <motion.p
          className="mb-4 text-[11px] font-black uppercase tracking-[0.28em] text-[#A78BFA]"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Platform
        </motion.p>
        <MaskRevealLine delay={0.08} inView={inView}>
          <span
            className="outfit block font-black leading-[0.88] tracking-[-0.04em] text-foreground"
            style={{ fontSize: "clamp(3.5rem, 8vw, 8.5rem)" }}
          >
            POWERFUL
          </span>
        </MaskRevealLine>
        <MaskRevealLine delay={0.30} inView={inView}>
          <span
            className="outfit block font-black leading-[0.88] tracking-[-0.04em] text-[#A78BFA]"
            style={{ fontSize: "clamp(3.5rem, 8vw, 8.5rem)" }}
          >
            BY DESIGN.
          </span>
        </MaskRevealLine>
      </div>

      {/* ── Two-column editorial ──────────────────────────────────────── */}
      <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-20">

        {/* Left — message */}
        <div className="shrink-0 lg:w-[36%]">
          <div className="mb-8">
            <MaskRevealLine delay={0.18} inView={inView}>
              <span
                className="outfit block font-black leading-[0.88] tracking-[-0.04em] text-foreground"
                style={{ fontSize: "clamp(2rem, 4.5vw, 5rem)" }}
              >
                SMART
              </span>
            </MaskRevealLine>
            <MaskRevealLine delay={0.40} inView={inView}>
              <span
                className="outfit block font-black leading-[0.88] tracking-[-0.04em] text-[#A78BFA]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 5rem)" }}
              >
                SYSTEMS.
              </span>
            </MaskRevealLine>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
          >
            <p className="mb-10 max-w-[300px] text-sm leading-relaxed text-foreground/50">
              Kat combines intelligent tools and seamless workflows to make managing your Discord server effortless.
            </p>

            <div
              aria-hidden
              className="inline-flex items-center gap-3 rounded-[14px] bg-[#A78BFA] px-7 h-[3.25rem] text-white font-black text-[13px] tracking-[0.04em] select-none"
            >
              EXPLORE FEATURES
              <ArrowRight className="h-4 w-4" />
            </div>
          </motion.div>
        </div>

        {/* Right — feature cards with scroll parallax */}
        <motion.div className="flex-1" style={{ y: cardsY }}>
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={gridVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {CARDS.map(({ id, ...card }) => (
              <FeatureCard key={id} {...card} />
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
