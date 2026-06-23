"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { ShineText } from "@/components/landing/shine-text";
import { Button } from "@/components/ui/button";
import { DiscordLoginButton } from "@/features/auth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden -translate-y-10">
      {/* KAT background text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span className="text-[clamp(12rem,30vw,40rem)] font-black leading-none text-foreground/[0.03] tracking-tight">
          KAT
        </span>
      </div>

      {/* Center image */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/katrunv2.png"
          alt="Kat"
          width={900}
          height={900}
          className="h-[80vh] w-auto object-contain"
          priority
        />
      </motion.div>

      {/* Bottom-left content */}
      <motion.div
        className="absolute bottom-14 left-6 z-20 max-w-xl sm:left-10 lg:left-16 xl:left-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={itemVariants}
          className="mb-5 font-hero text-base font-bold uppercase tracking-[0.35em] text-muted-foreground/70 sm:text-lg"
        >
          Discord automation
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="font-hero text-3xl font-extrabold uppercase leading-snug tracking-tight sm:text-4xl lg:text-5xl"
        >
          <span className="block text-foreground/80">Build <span className="text-foreground">Faster</span>.</span>
          <span className="block text-foreground/80">Run <span className="text-foreground">Smarter</span></span>
          <span className="block text-foreground/80">With <ShineText>Kat</ShineText>.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-4 font-hero text-base font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 sm:text-lg"
        >
          Speed meets simplicity — powered by Kat
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4"
        >
          <DiscordLoginButton
            label="Login with Discord"
            className="h-12 min-w-[200px] rounded-full font-semibold uppercase tracking-wide text-base"
          />
          <Button
            variant="outline"
            size="default"
            asChild
            className="h-12 min-w-[200px] rounded-full border-border/80 bg-background/40 font-semibold uppercase tracking-wide text-base backdrop-blur-sm transition-colors hover:border-kat/50 hover:bg-kat/10"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Dashboard
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom-right footer links */}
      <div className="absolute bottom-12 right-6 z-20 flex flex-col items-end gap-1.5 text-xs text-muted-foreground/50 sm:right-10 lg:right-16 xl:right-24">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <div className="flex gap-3">
          <Link href={siteConfig.links.privacy} className="transition-colors hover:text-foreground/70">
            Privacy Policy
          </Link>
          <Link href={siteConfig.links.terms} className="transition-colors hover:text-foreground/70">
            Terms of Service
          </Link>
          <Link href={siteConfig.links.refund} className="transition-colors hover:text-foreground/70">
            Refund Policy
          </Link>
        </div>
      </div>
    </section>
  );
}
