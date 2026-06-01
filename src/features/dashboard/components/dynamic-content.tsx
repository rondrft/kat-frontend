"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dashboardSectionMap } from "@/features/dashboard/config/sections";
import { SectionRenderer } from "@/features/dashboard/components/section-renderer";
import { useDashboardNavStore } from "@/features/dashboard/store/dashboard-nav-store";

const titleVariants = {
  initial: { opacity: 0, x: -12, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: 8,
    filter: "blur(4px)",
    transition: { duration: 0.18 },
  },
};

const contentVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.04 },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(6px)",
    transition: { duration: 0.2 },
  },
};

function DynamicContentComponent() {
  const activeSection = useDashboardNavStore((s) => s.activeSection);
  const config = dashboardSectionMap[activeSection];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6 md:p-8 lg:p-10">
      <AnimatePresence mode="wait" initial={false}>
        <motion.header
          key={`title-${activeSection}`}
          className="mb-6 shrink-0 md:mb-8"
          variants={titleVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <h1 className="font-hero text-2xl font-extrabold uppercase tracking-tight text-foreground md:text-3xl lg:text-4xl">
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{config.description}</p>
        </motion.header>
      </AnimatePresence>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSection}
            className="min-h-0"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SectionRenderer sectionId={activeSection} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export const DynamicContent = memo(DynamicContentComponent);
