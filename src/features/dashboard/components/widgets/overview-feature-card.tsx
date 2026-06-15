"use client";

import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type OverviewFeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
  disableHoverMotion?: boolean;
  badge?: "soon" | "configure" | "premium" | "none";
  bgImage?: string;
};

function OverviewFeatureCardComponent({
  title,
  description,
  icon: Icon,
  className,
  onClick,
  disableHoverMotion = false,
  badge = "soon",
  bgImage,
}: OverviewFeatureCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <article
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "dashboard-glass-card relative flex h-full min-h-0 flex-col justify-between overflow-hidden p-4 sm:p-5",
        isInteractive &&
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat/40",
        isInteractive &&
          !disableHoverMotion &&
          "transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {bgImage ? (
        <div className="pointer-events-none absolute inset-0 -z-0 select-none">
          <Image
            src={bgImage}
            alt=""
            fill
            className="object-cover opacity-[0.15] dark:opacity-[0.04]"
            sizes="300px"
          />
        </div>
      ) : null}
      <div className="relative z-[1] flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.06]">
          <Icon className="h-4 w-4 text-kat" strokeWidth={1.75} />
        </div>
        {badge === "soon" ? (
          <span className="rounded-full border border-black/[0.08] bg-black/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground dark:border-white/10 dark:bg-white/5">
            Soon
          </span>
        ) : null}
        {badge === "configure" ? (
          <span className="rounded-full border border-kat/30 bg-kat/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-kat">
            Configure
          </span>
        ) : null}
        {badge === "premium" ? (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300">
            Premium
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold tracking-tight text-foreground">{title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>
      </div>
    </article>
  );
}

export const OverviewFeatureCard = memo(OverviewFeatureCardComponent);
