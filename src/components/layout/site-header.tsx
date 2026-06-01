"use client";

import { motion } from "framer-motion";
import { DashboardHeaderActions } from "@/components/layout/dashboard-header-actions";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  variant?: "default" | "dashboard";
};

export function SiteHeader({ variant = "default" }: SiteHeaderProps) {
  const isDashboard = variant === "dashboard";

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 flex h-14 w-full items-center justify-between px-4 md:px-8",
        isDashboard
          ? "bg-background dark:bg-background"
          : "border-b border-border/40 bg-background/60 backdrop-blur-xl",
      )}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Logo />
      <div className="flex items-center gap-2 sm:gap-3">
        {isDashboard && <DashboardHeaderActions />}
      </div>
    </motion.header>
  );
}
