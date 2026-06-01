"use client";

import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FloatingPanelProps = {
  children: ReactNode;
  className?: string;
};

function FloatingPanelComponent({ children, className }: FloatingPanelProps) {
  return (
    <motion.div
      className={cn(
        "glass-panel relative mx-auto flex w-full max-w-[calc(100%-0.25rem)] flex-1 flex-col overflow-hidden sm:max-w-[calc(100%-0.5rem)]",
        "rounded-t-[2.5rem] border-b-0",
        "min-h-0",
        className,
      )}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export const FloatingPanel = memo(FloatingPanelComponent);
