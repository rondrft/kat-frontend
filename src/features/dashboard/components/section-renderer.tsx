"use client";

import { lazy, memo, Suspense } from "react";
import { dashboardSectionMap } from "@/features/dashboard/config/sections";
import type { DashboardSectionId } from "@/features/dashboard/types";

const OverviewSection = lazy(() =>
  import("@/features/dashboard/components/sections/overview-section").then((m) => ({
    default: m.OverviewSection,
  })),
);

const WelcomeSection = lazy(() =>
  import("@/features/dashboard/components/sections/welcome-section").then((m) => ({
    default: m.WelcomeSection,
  })),
);

const StatisticsSection = lazy(() =>
  import("@/features/dashboard/components/sections/statistics-section").then((m) => ({
    default: m.StatisticsSection,
  })),
);

const ModerationSection = lazy(() =>
  import("@/features/dashboard/components/sections/moderation-section").then((m) => ({
    default: m.ModerationSection,
  })),
);

const ActivitySection = lazy(() =>
  import("@/features/dashboard/components/sections/activity-section").then((m) => ({
    default: m.ActivitySection,
  })),
);

const SectionPlaceholder = lazy(() =>
  import("@/features/dashboard/components/placeholders/section-placeholder").then(
    (m) => ({ default: m.SectionPlaceholder }),
  ),
);

function SectionFallback() {
  return (
    <div className="min-h-[200px] animate-pulse rounded-3xl bg-black/[0.04] dark:bg-white/[0.03]" />
  );
}

type SectionRendererProps = {
  sectionId: DashboardSectionId;
};

function SectionRendererComponent({ sectionId }: SectionRendererProps) {
  if (sectionId === "dashboard") {
    return (
      <Suspense fallback={<SectionFallback />}>
        <OverviewSection />
      </Suspense>
    );
  }

  if (sectionId === "servers") {
    return (
      <Suspense fallback={<SectionFallback />}>
        <WelcomeSection />
      </Suspense>
    );
  }

  if (sectionId === "analytics") {
    return (
      <Suspense fallback={<SectionFallback />}>
        <StatisticsSection />
      </Suspense>
    );
  }

  if (sectionId === "moderation") {
    return (
      <Suspense fallback={<SectionFallback />}>
        <ModerationSection />
      </Suspense>
    );
  }

  if (sectionId === "activity") {
    return (
      <Suspense fallback={<SectionFallback />}>
        <ActivitySection />
      </Suspense>
    );
  }

  const section = dashboardSectionMap[sectionId];

  return (
    <Suspense fallback={<SectionFallback />}>
      <SectionPlaceholder section={section} />
    </Suspense>
  );
}

export const SectionRenderer = memo(SectionRendererComponent);
