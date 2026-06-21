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
  ArrowLeft,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useGuildStore } from "@/store/guild-store";
import { useGuilds } from "@/features/guilds/hooks/use-guilds";
import { useCreatePaymentOrder } from "@/features/premium/hooks/use-create-payment-order";

type BillingPeriod = "monthly" | "yearly" | "lifetime";

// ---- Billing toggle (display only) ----

function BillingToggleStatic({ toggle }: { toggle: { monthly: string; yearly: string; yearlySuffix: string; lifetime: string } }) {
  const options: { id: BillingPeriod; label: string; suffix?: string }[] = [
    { id: "monthly", label: toggle.monthly },
    { id: "yearly", label: toggle.yearly, suffix: toggle.yearlySuffix },
    { id: "lifetime", label: toggle.lifetime },
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
              isSelected ? "text-white" : "text-muted-foreground",
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

// ---- Pricing cards ----

type PlanData = {
  name: string;
  price: string;
  original: string;
  period: string;
  description: string;
  badge: string;
  features: readonly string[];
};

type PricingCardsProps = {
  plans: { monthly: PlanData; yearly: PlanData; lifetime: PlanData };
  cta: string;
  lifetimeSubtext: string;
  onSelectPlan: (plan: BillingPeriod) => void;
};

function PricingCards({ plans, cta, lifetimeSubtext, onSelectPlan }: PricingCardsProps) {
  const planIds: BillingPeriod[] = ["monthly", "lifetime", "yearly"];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 md:items-center">
      {planIds.map((id, index) => {
        const plan = plans[id];
        const isHighlighted = index === 1;
        const isLifetime = id === "lifetime";
        const isYearly = id === "yearly";
        const isMonthly = id === "monthly";

        return (
          <motion.div
            key={id}
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
                    : isMonthly
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
                {plan.original && (
                  <span className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                    {plan.original}
                  </span>
                )}
                <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
              </div>
              {isYearly && (
                <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {plan.description}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <Button
              onClick={() => onSelectPlan(id)}
              className={cn(
                "relative z-10 mb-6 w-full rounded-xl py-6 text-base font-bold transition-all duration-300",
                isHighlighted
                  ? "bg-gradient-to-r from-kat to-cyan-500 text-white shadow-lg shadow-kat/25 hover:shadow-xl hover:shadow-kat/30 hover:scale-[1.02]"
                  : "border-2 border-kat/30 bg-kat/10 text-kat hover:bg-kat/20 hover:shadow-lg hover:shadow-kat/10",
              )}
            >
              <Crown className="mr-2 h-4 w-4" />
              {cta}
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
                  {lifetimeSubtext}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ---- Checkout view ----

const PLAN_LABELS: Record<BillingPeriod, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  lifetime: "Lifetime",
};

type CheckoutViewProps = {
  plan: BillingPeriod;
  plans: { monthly: PlanData; yearly: PlanData; lifetime: PlanData };
  onBack: () => void;
};

function CheckoutView({ plan, plans, onBack }: CheckoutViewProps) {
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const { data: guilds = [] } = useGuilds();
  const guild = guilds.find((g) => g.id === selectedGuildId) ?? null;

  const { mutate: createOrder, isPending, error } = useCreatePaymentOrder();
  const planData = plans[plan];

  function handleProceed() {
    if (!selectedGuildId) return;
    createOrder(
      { guildId: selectedGuildId, plan },
      {
        onSuccess: (result) => {
          window.location.href = result.checkoutUrl;
        },
      },
    );
  }

  return (
    <motion.div
      key="checkout"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-lg"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to plans
      </button>

      <div className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-xl shadow-black/[0.05] dark:border-white/10 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="bg-gradient-to-r from-kat/10 to-cyan-500/10 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-kat to-cyan-500 shadow-lg shadow-kat/25">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Order Summary
              </p>
              <h2 className="text-xl font-extrabold text-foreground">
                Kat Premium — {PLAN_LABELS[plan]}
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-8 py-6">
          {/* Plan line */}
          <div className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-black/[0.02] px-4 py-3.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {planData.name} Plan
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{planData.description}</p>
            </div>
            <div className="text-right">
              {planData.original && (
                <p className="text-xs text-muted-foreground line-through">{planData.original}</p>
              )}
              <p className="text-lg font-black text-foreground">
                {planData.price}
                <span className="ml-0.5 text-xs font-medium text-muted-foreground">
                  {planData.period}
                </span>
              </p>
            </div>
          </div>

          {/* Server */}
          {guild ? (
            <div className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-black/[0.02] px-4 py-3.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kat/10 text-xs font-bold text-kat">
                {guild.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Activating on</p>
                <p className="truncate text-sm font-semibold text-foreground">{guild.name}</p>
              </div>
              <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-500" />
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No server selected. Please select a server first.
              </p>
            </div>
          )}

          {/* Features list */}
          <ul className="space-y-2 pt-1">
            {planData.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleProceed}
            disabled={isPending || !selectedGuildId}
            className="w-full rounded-xl bg-gradient-to-r from-kat to-cyan-500 py-6 text-base font-bold text-white shadow-lg shadow-kat/25 hover:shadow-xl hover:shadow-kat/30 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing payment...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Continue to MercadoPago
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You will be redirected to MercadoPago's secure checkout.
            Your payment details are never stored on our servers.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Benefits table ----

function BenefitsTable({ rows, featureLabel, freeLabel, premiumLabel, premiumBadge }: {
  rows: Record<string, { name: string; free: string | boolean; premium: string | boolean }>;
  featureLabel: string;
  freeLabel: string;
  premiumLabel: string;
  premiumBadge: string;
}) {
  const rowEntries = Object.values(rows);
  const icons = [Crown, Users, Users, MessageSquare, Image, Sparkles, Shield, Lock, Bell, BarChart3, Headphones, Star, Gauge, Palette];

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/[0.06] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {featureLabel}
            </th>
            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {freeLabel}
            </th>
            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-kat">
              <Crown className="mr-1 inline-block h-3 w-3" />
              {premiumLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rowEntries.map((row, index) => {
            const Icon = icons[index] ?? Check;
            return (
              <motion.tr
                key={row.name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.02 * index }}
                className="border-b border-black/[0.04] transition-colors last:border-0 hover:bg-black/[0.02] dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
                    <span className="font-medium text-foreground">{row.name}</span>
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
                        {premiumBadge}
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

// ---- FAQ accordion ----

function FaqAccordion({ questions }: { questions: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {questions.map((faq, index) => {
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
                {faq.q}
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
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
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

// ---- Animated background blobs ----

function AnimatedBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      <motion.div
        className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-gradient-to-br from-kat/8 to-cyan-500/5 blur-3xl"
        animate={{ x: [0, 30, -15, 0], y: [0, -25, 15, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-gradient-to-bl from-violet-500/8 to-kat/5 blur-3xl"
        animate={{ x: [0, -25, 15, 0], y: [0, 25, -15, 0], scale: [1, 0.92, 1.04, 1] }}
        transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-12 left-1/3 h-56 w-56 rounded-full bg-gradient-to-tr from-cyan-500/6 to-kat/5 blur-3xl"
        animate={{ x: [0, 15, -20, 0], y: [0, -15, 10, 0], scale: [1, 1.04, 0.96, 1] }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-kat/30"
          style={{ left: `${18 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.7, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ---- Root component ----

function PremiumSectionComponent() {
  const t = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<BillingPeriod | null>(null);

  const plans = {
    monthly: { ...t.premium.plans.monthly, features: [...t.premium.plans.monthly.features] },
    yearly: { ...t.premium.plans.yearly, features: [...t.premium.plans.yearly.features] },
    lifetime: { ...t.premium.plans.lifetime, features: [...t.premium.plans.lifetime.features] },
  };

  return (
    <div className="relative min-h-0 space-y-20 pb-20">
      <AnimatedBlobs />

      <AnimatePresence mode="wait">
        {selectedPlan ? (
          <CheckoutView
            key="checkout"
            plan={selectedPlan}
            plans={plans}
            onBack={() => setSelectedPlan(null)}
          />
        ) : (
          <motion.div
            key="plans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-20"
          >
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
                  {t.premium.hero.badge}
                </div>
                <h2 className="font-hero text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-nowrap">
                  <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                    {t.premium.hero.heading}
                  </span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {t.premium.hero.subtext}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <BillingToggleStatic toggle={t.premium.billingToggle} />
              </motion.div>
            </section>

            {/* Pricing cards */}
            <section>
              <PricingCards
                plans={plans}
                cta={t.premium.cta}
                lifetimeSubtext={t.premium.billingToggle.lifetimeSubtext}
                onSelectPlan={setSelectedPlan}
              />
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
                  {t.premium.benefits.heading}
                </h3>
                <p className="mt-2 text-muted-foreground">{t.premium.benefits.subtext}</p>
              </motion.div>

              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BenefitsTable
                    rows={t.premium.benefitsTable.rows}
                    featureLabel={t.premium.benefitsTable.feature}
                    freeLabel={t.premium.benefitsTable.free}
                    premiumLabel={t.premium.benefitsTable.premium}
                    premiumBadge={t.premium.benefitsTable.premiumBadge}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FaqAccordion questions={t.premium.faq.questions as unknown as { q: string; a: string }[]} />
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const PremiumSection = memo(PremiumSectionComponent);
