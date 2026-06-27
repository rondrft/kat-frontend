"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Shield,
  Zap,
  Lock,
  Terminal,
  BarChart2,
  ChevronDown,
} from "lucide-react";

// ── Code content ──────────────────────────────────────────────────────────────

const CODE_LINES = [
  "const kat = new DiscordBot({",
  "  moderation: true,",
  "  automation: true,",
  "  security:   true,",
  "})",
  "",
  "await kat.start()",
  "",
  "// ✓ Online — 2,847 guilds active",
] as const;

// ── Feature list ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: "moderation",
    Icon: Shield,
    title: "Moderation",
    desc: "Block spam, filter content, manage warnings and bans automatically. Rules enforced around the clock without manual effort.",
  },
  {
    id: "automation",
    Icon: Zap,
    title: "Automation",
    desc: "Custom triggers, scheduled messages, role sync, and event flows — configure once, run forever.",
  },
  {
    id: "security",
    Icon: Lock,
    title: "Security",
    desc: "Anti-raid gates, suspicious join detection, real-time threat response, and full audit logs.",
  },
  {
    id: "commands",
    Icon: Terminal,
    title: "Commands",
    desc: "50+ built-in slash commands across moderation, economy, info, and fun — all customizable per server.",
  },
  {
    id: "analytics",
    Icon: BarChart2,
    title: "Analytics",
    desc: "Member growth, activity trends, command stats, and engagement data accessible from your dashboard.",
  },
] as const;

// ── Typing hook ───────────────────────────────────────────────────────────────

function useTypingEffect(lines: readonly string[], enabled: boolean) {
  const linesRef = useRef(lines);
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (!enabled || lineIdx >= linesRef.current.length) return;
    const line = linesRef.current[lineIdx] ?? "";

    if (charIdx < line.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 42);
      return () => clearTimeout(t);
    }

    const t = setTimeout(
      () => {
        setDisplayed((d) => [...d, line]);
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      },
      line === "" ? 60 : 160,
    );
    return () => clearTimeout(t);
  }, [enabled, lineIdx, charIdx]);

  const isTyping = lineIdx < linesRef.current.length;
  return {
    displayed,
    partial: isTyping ? (linesRef.current[lineIdx] ?? "").slice(0, charIdx) : "",
    isTyping,
  };
}

// ── Code line renderer ────────────────────────────────────────────────────────

function CodeLine({ text }: { text: string }) {
  if (text === "") return <span className="block h-[1.75rem]" />;

  if (text.startsWith("//")) {
    return <span className="text-white/30">{text}</span>;
  }

  if (text.startsWith("const") || text.startsWith("await")) {
    const spaceIdx = text.indexOf(" ");
    const keyword = text.slice(0, spaceIdx);
    const rest = text.slice(spaceIdx + 1);
    return (
      <>
        <span className="text-[#d6ff00]">{keyword} </span>
        <span className="text-white/75">{rest}</span>
      </>
    );
  }

  if (text.includes(":") && !text.includes("({")) {
    const colonIdx = text.indexOf(":");
    const prop = text.slice(0, colonIdx + 1);
    const val = text.slice(colonIdx + 1);
    return (
      <>
        <span className="text-white/45">{prop}</span>
        <span className="text-[#eaff8a]">{val}</span>
      </>
    );
  }

  return <span className="text-white/60">{text}</span>;
}

// ── Terminal panel ────────────────────────────────────────────────────────────

function TerminalPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const { displayed, partial, isTyping } = useTypingEffect(CODE_LINES, inView);

  return (
    <div ref={ref} className="relative h-full min-h-[480px] overflow-hidden rounded-2xl">
      <Image
        src="/bgcard.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="absolute inset-6 flex flex-col">
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080808]/90 backdrop-blur-sm flex-1">
          {/* Title bar */}
          <div className="flex shrink-0 items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 h-9">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/70" />
            <span className="ml-3 font-mono text-[11px] text-white/20">
              kat.config.ts
            </span>
          </div>

          {/* Code */}
          <div className="flex-1 px-5 py-5 font-mono text-[13px] leading-[1.85]">
            {displayed.map((line, i) => (
              <div key={i}>
                <CodeLine text={line} />
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center">
                <CodeLine text={partial} />
                <span className="ml-px inline-block h-[1em] w-[2px] animate-pulse bg-[#d6ff00]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature accordion ─────────────────────────────────────────────────────────

function FeatureAccordion() {
  const [openId, setOpenId] = useState<string>("moderation");

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md">
      {FEATURES.map((feature, i) => {
        const isOpen = openId === feature.id;
        const isLast = i === FEATURES.length - 1;

        return (
          <div
            key={feature.id}
            className={isLast ? "" : "border-b border-white/[0.07]"}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? "" : feature.id)}
              className="group flex w-full items-center px-6 py-5 text-left"
            >
              <span
                className={`mr-4 rounded-lg p-2 transition-colors duration-200 ${
                  isOpen
                    ? "bg-[#d6ff00]/10 text-[#d6ff00]"
                    : "bg-white/5 text-white/35 group-hover:text-white/60"
                }`}
              >
                <feature.Icon className="h-4 w-4" />
              </span>

              <span
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                  isOpen
                    ? "text-[#d6ff00]"
                    : "text-white/75 group-hover:text-white"
                }`}
              >
                {feature.title}
              </span>

              <ChevronDown
                className={`ml-auto h-4 w-4 transition-all duration-300 ${
                  isOpen
                    ? "rotate-180 text-[#d6ff00]/50"
                    : "text-white/20 group-hover:text-white/40"
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 pl-[4.25rem] text-sm leading-relaxed text-white/45">
                    {feature.desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function KatShowcase() {
  return (
    <section className="relative px-6 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-[11px] font-black uppercase tracking-[0.28em] text-[#d6ff00]">
            Platform
          </span>
          <h2 className="outfit font-black text-4xl tracking-[-0.04em] text-foreground md:text-[3.25rem] leading-[1.1]">
            Everything your server needs
          </h2>
        </motion.div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <motion.div
            className="h-full"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          >
            <TerminalPanel />
          </motion.div>

          <motion.div
            className="h-full"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <FeatureAccordion />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
