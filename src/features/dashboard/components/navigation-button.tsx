"use client";

import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type NavigationButtonProps = {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function NavigationButtonComponent({
  icon: Icon,
  label,
  isActive,
  onClick,
}: NavigationButtonProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            isActive
              ? "border-kat/50 bg-kat/20 text-kat shadow-[0_0_24px_hsl(var(--kat-brand)/0.35)]"
              : [
                  "border-black/[0.08] bg-black/[0.03] text-muted-foreground",
                  "shadow-sm shadow-black/[0.04]",
                  "hover:border-black/[0.12] hover:bg-black/[0.05] hover:text-foreground",
                  "dark:border-white/10 dark:bg-white/5 dark:shadow-none",
                  "dark:hover:border-white/20 dark:hover:bg-white/10",
                  "dark:hover:shadow-[0_0_20px_hsl(var(--kat-brand)/0.15)]",
                ].join(" "),
          )}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        >
          {isActive && (
            <motion.span
              layoutId="nav-active-ring"
              className="absolute inset-0 rounded-full ring-2 ring-kat/40"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Icon
            className="relative z-10 h-5 w-5"
            strokeWidth={isActive ? 2.25 : 1.75}
          />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="border-black/[0.08] bg-background/95 shadow-md backdrop-blur-md dark:border-white/10 dark:shadow-none"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export const NavigationButton = memo(NavigationButtonComponent);
