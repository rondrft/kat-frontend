"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ShineTextProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
};

export function ShineText({ children, className, duration = 5 }: ShineTextProps) {
  return (
    <span
      className={cn(
        "shine-text relative inline-block font-extrabold uppercase",
        className,
      )}
      style={{ "--shine-duration": `${duration}s` } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
