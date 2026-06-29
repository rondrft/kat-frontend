import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimatedGradientTextProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "animated-gradient-text bg-clip-text font-semibold text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}
