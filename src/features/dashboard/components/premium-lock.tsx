"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type PremiumLockProps = {
  isPremium: boolean;
  children: React.ReactNode;
  className?: string;
};

export function PremiumLock({ isPremium, children, className }: PremiumLockProps) {
  if (isPremium) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute right-0 top-0 z-10 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">
        <Crown className="h-3 w-3" />
        Premium
      </span>
      <div className="pointer-events-none opacity-50">{children}</div>
    </div>
  );
}
