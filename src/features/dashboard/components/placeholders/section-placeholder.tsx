"use client";

import { memo } from "react";
import type { DashboardSectionConfig } from "@/features/dashboard/config/sections";

type SectionPlaceholderProps = {
  section: DashboardSectionConfig;
};

function SectionPlaceholderComponent({ section }: SectionPlaceholderProps) {
  const Icon = section.icon;

  return (
    <div className="dashboard-glass-card flex h-full min-h-[280px] flex-col items-center justify-center border-dashed p-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] dark:border-white/10 dark:bg-white/5">
        <Icon className="h-8 w-8 text-kat/80" strokeWidth={1.5} />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">{section.description}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
        Coming soon
      </p>
    </div>
  );
}

export const SectionPlaceholder = memo(SectionPlaceholderComponent);
