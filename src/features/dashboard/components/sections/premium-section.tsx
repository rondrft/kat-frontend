"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Crown,
  HelpCircle,
  ChevronDown,
  X,
  Zap,
  Infinity,
  Sparkles,
  Shield,
  Users,
  MessageSquare,
  Image,
  Bell,
  BarChart3,
  Gauge,
  Lock,
  Headphones,
  Palette,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BillingPeriod = "monthly" | "yearly" | "lifetime";

type BenefitRow = {
  feature: string;
  icon: typeof Check;
  free: string | boolean;
  premium: string | boolean;
};

type FaqItem = {
  question: string;
  answer: string;
};

const PLANS = [
  {
    id: "monthly" as const,
    name: "Monthly",
    price: "$4.99",
    originalPrice: "$9.99",
    period: "/month",
    description: "Full access. Cancel anytime.",
    badge: "Save 50%",
    features: [
      "All Premium features",
      "One Discord server",
      "Cancel anytime",
      "Priority support",
    ],
  },
  {
    id: "lifetime" as const,
    name: "Lifetime",
    price: "$44.99",
    originalPrice: "$89.99",
    period: " one-time",
    description: "Pay once, never worry again.",
    badge: "Best Value",
    features: [
      "All Premium features forever",
      "One Discord server",
      "No recurring payments",
      "Priority support",
      "Future Premium features",
    ],
  },
  {
    id: "yearly" as const,
    name: "Yearly",
    price: "$24.99",
    originalPrice: "$59.88",
    period: "/year",
    description: "Just $2.08/month. Best value for active communities.",
    badge: "Most Popular",
    features: [
      "All Premium features",
      "One Discord server",
      "Cancel anytime",
      "Priority support",
      "Pay $2.08/month billed yearly",
    ],
  },
];

const BENEFITS: BenefitRow[] = [
  { feature: "Booster Roles", icon: Crown, free: false, premium: true },
  { feature: "Temporary Voice Channels", icon: Users, free: "Max 5 Channels", premium: "Unlimited" },
  { feature: "Autoroles (Join / Boost)", icon: Users, free: true, premium: true },
  { feature: "Reaction Roles", icon: MessageSquare, free: "Max 8 Reactions", premium: "Unlimited" },
  { feature: "Basic Welcome System", icon: Image, free: true, premium: true },
  { feature: "Booster Welcome Messages", icon: Sparkles, free: false, premium: true },
  { feature: "Raid Protection", icon: Shield, free: false, premium: true },
  { feature: "Command Permissions", icon: Lock, free: false, premium: true },
  { feature: "Activity Logs", icon: Bell, free: "7 Days", premium: "Unlimited History" },
  { feature: "Ranking", icon: BarChart3, free: "Top 10", premium: "Unlimited" },
  { feature: "Priority Support", icon: Headphones, free: false, premium: true },
  { feature: "Premium Badge", icon: Star, free: false, premium: true },
  { feature: "Advanced Analytics", icon: Gauge, free: false, premium: true },
  { feature: "Custom Branding", icon: Palette, free: false, premium: true },
];

const FAQS: FaqItem[] = [
  {
    question: "Why does Kat have Premium?",
    answer:
      "Kat Premium helps cover infrastructure costs, server hosting, development time and future features while keeping the core experience free for everyone.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Yes. If you're not satisfied with Kat Premium, you can request a refund within 3 days of your purchase.",
  },
  {
    question: "How many servers can I use my subscription on?",
    answer:
      "A Premium subscription is valid for one Discord server.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. Monthly and yearly plans can be cancelled at any time.",
  },
  {
    question: "What is the Premium revenue used for?",
    answer:
      "Premium revenue is used to pay for servers, APIs, development, maintenance and future improvements.",
  },
  {
    question: "Will Free features remain available?",
    answer:
      "Absolutely. Kat will always offer a powerful free experience. Premium simply unlocks additional advanced tools.",
  },
];

function BillingToggleStatic() {
  const options: { id: BillingPeriod; label: string; suffix?: string }[] = [
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly", suffix: "Save 58%" },
    { id: "lifetime", label: "Lifetime" },
  ];

  return (
    <div className="relative mx-auto flex w-fit items-center rounded-2xl border border-black/[0.06] bg-black/[0.03] p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
      {options.map((option) => {
        const isSelected = option.id === "yearly";
        return (
          <span
            key={option.id}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
              isSelected
                ? "text-white"
                : "text-muted-foreground",
            )}
          >
            {isSelected && (
              <span className="absolute inset-0 z-0 rounded-xl bg-gradient-to-r from-kat to-cyan-500 shadow-lg shadow-kat/25" />
            )}
            <span className="relative z-10">{option.label}</span>
            {option.suffix && (
              <span
                className={cn(
                  "relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}
              >
                {option.suffix}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function PricingCards() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 md:items-center">
      {PLANS.map((plan, index) => {
        const isHighlighted = index === 1;
        const isLifetime = plan.id === "lifetime";

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "group relative flex flex-col rounded-3xl border p-8 transition-all duration-500",
              isHighlighted
                ? [
                    "border-kat/30 bg-gradient-to-b from-kat/[0.07] to-transparent shadow-2xl shadow-kat/10",
                    "md:scale-105 md:-translate-y-2",
                    "dark:from-kat/[0.05] dark:shadow-kat/5",
                  ].join(" ")
                : [
                    "border-black/[0.08] bg-white shadow-lg shadow-black/[0.04]",
                    "dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none",
                    "hover:border-kat/20 hover:shadow-xl hover:shadow-kat/5",
                    "dark:hover:border-kat/20 dark:hover:shadow-[0_0_40px_hsl(var(--kat-brand)/0.08)]",
                  ].join(" "),
            )}
          >
            {isHighlighted && (
              <>
                <div className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-kat/40 via-kat/10 to-transparent opacity-40 blur-sm" />
                <div className="pointer-events-none absolute -inset-[2px] rounded-3xl bg-gradient-to-b from-kat/20 to-transparent opacity-20 blur-xl" />
              </>
            )}

            {plan.badge && (
              <div
                className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2",
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg",
                  isHighlighted
                    ? "bg-gradient-to-r from-kat to-cyan-500 text-white shadow-kat/30"
                    : plan.id === "monthly"
                      ? "bg-emerald-500 text-white shadow-emerald-500/30"
                      : "bg-amber-500 text-white shadow-amber-500/30",
                )}
              >
                {isHighlighted ? <Crown className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                {plan.badge}
              </div>
            )}

            <div className="relative z-10 mb-6">
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                {plan.originalPrice && (
                  <span className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                    {plan.originalPrice}
                  </span>
                )}
                <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              {plan.id === "yearly" && (
                <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Just $2.08/month billed yearly
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <Button
              className={cn(
                "relative z-10 mb-6 w-full rounded-xl py-6 text-base font-bold transition-all duration-300",
                isHighlighted
                  ? "bg-gradient-to-r from-kat to-cyan-500 text-white shadow-lg shadow-kat/25 hover:shadow-xl hover:shadow-kat/30 hover:scale-[1.02]"
                  : "border-2 border-kat/30 bg-kat/10 text-kat hover:bg-kat/20 hover:shadow-lg hover:shadow-kat/10",
              )}
            >
              <Crown className="mr-2 h-4 w-4" />
              Get Premium
            </Button>

            <ul className="relative z-10 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </span>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {isLifetime && (
              <div className="relative z-10 mt-6 rounded-xl bg-gradient-to-r from-amber-500/10 via-kat/5 to-cyan-500/10 p-3 text-center">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Infinity className="mr-1 inline-block h-3 w-3" />
                  No recurring charges — ever.
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function BenefitsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/[0.06] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Feature
            </th>
            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Free
            </th>
            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-kat">
              <Crown className="mr-1 inline-block h-3 w-3" />
              Premium
            </th>
          </tr>
        </thead>
        <tbody>
          {BENEFITS.map((row, index) => {
            const Icon = row.icon;
            return (
              <motion.tr
                key={row.feature}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.02 * index }}
                className={cn(
                  "border-b border-black/[0.04] transition-colors last:border-0 hover:bg-black/[0.02] dark:border-white/[0.04] dark:hover:bg-white/[0.02]",
                )}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
                    <span className="font-medium text-foreground">{row.feature}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {typeof row.free === "boolean" ? (
                    row.free ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-400/70" />
                    )
                  ) : (
                    <span className="text-muted-foreground">{row.free}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {typeof row.premium === "boolean" ? (
                    row.premium ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-kat/10 px-2.5 py-0.5 text-xs font-semibold text-kat">
                        <Check className="h-3 w-3" />
                        Premium
                      </span>
                    ) : (
                      <X className="h-4 w-4 text-red-400/70" />
                    )
                  ) : (
                    <span className="font-medium text-foreground">{row.premium}</span>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={cn(
              "overflow-hidden rounded-2xl border transition-colors duration-300",
              isOpen
                ? "border-kat/20 bg-kat/[0.03] shadow-sm shadow-kat/5"
                : "border-black/[0.06] bg-white dark:border-white/10 dark:bg-white/[0.03]",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
                <HelpCircle className="h-4 w-4 shrink-0 text-kat/60" strokeWidth={1.5} />
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 text-muted-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-black/[0.04] px-5 py-4 dark:border-white/[0.04]">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function AnimatedBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      <motion.div
        className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-gradient-to-br from-kat/8 to-cyan-500/5 blur-3xl"
        animate={{
          x: [0, 30, -15, 0],
          y: [0, -25, 15, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-gradient-to-bl from-violet-500/8 to-kat/5 blur-3xl"
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 25, -15, 0],
          scale: [1, 0.92, 1.04, 1],
        }}
        transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-12 left-1/3 h-56 w-56 rounded-full bg-gradient-to-tr from-cyan-500/6 to-kat/5 blur-3xl"
        animate={{
          x: [0, 15, -20, 0],
          y: [0, -15, 10, 0],
          scale: [1, 1.04, 0.96, 1],
        }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-kat/30"
          style={{
            left: `${18 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.7,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function PremiumSectionComponent() {
  return (
    <div className="relative min-h-0 space-y-20 pb-20">
      <AnimatedBlobs />

      {/* Hero */}
      <section className="relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Plan
          </div>

          <h2 className="font-hero text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-nowrap">
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Unlock the Full Power{' '}
            </span>
            <span className="bg-gradient-to-r from-kat via-cyan-400 to-violet-500 bg-clip-text text-transparent">
              of Kat
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Advanced automation, moderation and growth tools for serious communities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <BillingToggleStatic />
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section>
        <PricingCards />
      </section>

      {/* Benefits + FAQ */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center"
        >
          <h3 className="font-hero text-3xl font-extrabold tracking-tight md:text-4xl">
            Everything You Get
          </h3>
          <p className="mt-2 text-muted-foreground">
            See exactly what changes when you upgrade to Premium.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <BenefitsTable />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <FaqAccordion />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export const PremiumSection = memo(PremiumSectionComponent);
