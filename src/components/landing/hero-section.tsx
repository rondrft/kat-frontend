"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { ShineText } from "@/components/landing/shine-text";
import { Button } from "@/components/ui/button";
import { DiscordLoginButton } from "@/features/auth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
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

const imageVariants = {
  hidden: { opacity: 0, x: 40, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
  },
};

export function HeroSection() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] items-center px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-8 lg:gap-16">

        {/* Left: text + buttons */}
        <motion.div
          className="flex min-w-0 flex-1 flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={itemVariants}
            className="mb-6 font-hero text-xs font-bold uppercase tracking-[0.35em] text-muted-foreground/80 sm:text-sm"
          >
            Discord automation
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-balance font-hero text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] xl:leading-[0.95]"
          >
            <span className="text-foreground/90">Build </span>
            <span className="text-foreground">Faster</span>
            <span className="text-foreground/90">. Run </span>
            <span className="text-foreground">Smarter</span>
            <span className="text-foreground/90"> With </span>
            <ShineText>Kat</ShineText>
            <span className="text-foreground/90">.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-balance font-hero text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm md:text-base"
          >
            Speed meets simplicity — powered by Kat
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <DiscordLoginButton
              label="Login with Discord"
              className="h-11 min-w-[200px] rounded-full font-semibold uppercase tracking-wide"
            />
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-11 min-w-[200px] rounded-full border-border/80 bg-background/40 font-semibold uppercase tracking-wide backdrop-blur-sm transition-colors hover:border-kat/50 hover:bg-kat/10"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Right: image */}
        <motion.div
          className="hidden shrink-0 items-center justify-center lg:flex"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <Image
            src="/katrun.png"
            alt="Kat"
            width={420}
            height={420}
            className="h-auto w-[340px] xl:w-[420px]"
            priority
          />
        </motion.div>

      </div>
    </section>
  );
}
