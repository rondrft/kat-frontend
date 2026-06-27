import { cn } from "@/lib/utils";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  showRadialGradient?: boolean;
}

// Adapted from Aceternity UI AuroraBackground.
// Fixed global background layer — no children, no height.
// Uses lima palette exclusively (#d6ff00, #b9df00, #eaff8a, #f7ffd6).
// mix-blend-screen keeps all color mixing within the warm/yellow spectrum.
export const AuroraBackground = ({
  className,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-white dark:bg-[#060900] transition-bg",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          // Dark-mode gradient stripes for banding; light mode uses aurora directly
          "[--dark-gradient:repeating-linear-gradient(100deg,#060900_0%,#060900_7%,transparent_10%,transparent_12%,#060900_16%)]",
          // Lima palette only — no blue, no purple, no inversion trick
          "[--aurora:repeating-linear-gradient(100deg,#d6ff00_10%,#b9df00_15%,#eaff8a_20%,#f7ffd6_25%,#d6ff00_30%)]",
          // Light mode: show aurora directly (white stripes wash it out)
          // Dark mode: dark gradient bands + aurora
          "[background-image:var(--aurora)]",
          "dark:[background-image:var(--dark-gradient),var(--aurora)]",
          "[background-size:300%,_200%]",
          "[background-position:50%_50%,50%_50%]",
          // Blur softens stripes into an organic aurora glow
          "blur-[10px]",
          // Animated overlay via ::after
          "after:content-['']",
          "after:absolute",
          "after:inset-0",
          // Light mode: animate aurora directly; dark mode: dark gradient + aurora
          "after:[background-image:var(--aurora)]",
          "after:dark:[background-image:var(--dark-gradient),var(--aurora)]",
          "after:[background-size:200%,_100%]",
          "after:animate-aurora",
          "after:[background-attachment:fixed]",
          // screen blend only in dark mode — in light mode screen+white = invisible
          "dark:after:mix-blend-screen",
          // Positioning
          "pointer-events-none",
          "absolute",
          "-inset-[10px]",
          // Softer in light mode so it doesn't overpower the white page
          "opacity-[0.35] dark:opacity-50",
          "will-change-transform",
          showRadialGradient &&
            "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]",
        )}
      />
    </div>
  );
};
