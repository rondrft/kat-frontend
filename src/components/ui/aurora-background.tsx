import { cn } from "@/lib/utils";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  showRadialGradient?: boolean;
}

// Global fixed background layer — no children, no height.
//
// Both themes share the same architecture: a dark saturated base + mix-blend-screen aurora.
//   Dark:  near-black (#060900) + screen(#d6ff00 stripes H=67°) → yellow-lime glow on black
//   Light: dark lime  (#71AD02) + screen(#80ff00 stripes H=90°) → vivid lime-GREEN glow on green
//
// The aurora stripe hue matters a lot in light mode: #d6ff00 (H=67°) screen-blended over
// #71AD02 (H=82°) produces H≈64° (yellow). Using #80ff00 (H=90°) produces H≈90° (green).
export const AuroraBackground = ({
  className,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 -z-10 pointer-events-none overflow-hidden",
        "bg-[#71AD02] dark:bg-[#060900]",
        "transition-colors duration-500",
        className,
      )}
      {...props}
    >
      {/* Light mode: static radial spotlight — defines the bright zone shape */}
      <div className="absolute inset-0 dark:hidden overflow-hidden" aria-hidden>
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            filter: "blur(55px)",
            backgroundImage: [
              // Primary — large lime-GREEN luminous zone (H≈88°, not yellow)
              "radial-gradient(ellipse 95% 85% at 65% 12%, rgba(180,255,20,0.84)  0%, transparent 70%)",
              // Top-right secondary glow
              "radial-gradient(ellipse 58% 52% at 98% -5%, rgba(190,255,70,0.58)  0%, transparent 60%)",
              // Left shadow — deepens the base green
              "radial-gradient(ellipse 60% 55% at -5% 65%, rgba(30,70,0,0.40)     0%, transparent 60%)",
              // Bottom anchor
              "radial-gradient(ellipse 85% 38% at 50% 115%, rgba(20,60,0,0.45)    0%, transparent 55%)",
            ].join(", "),
          }}
        />
      </div>

      {/* Animated aurora bands — light mode uses greener stripes to avoid yellowing */}
      <div
        className={cn(
          "[--dark-gradient:repeating-linear-gradient(100deg,#060900_0%,#060900_7%,transparent_10%,transparent_12%,#060900_16%)]",
          // Dark mode: brand yellow-lime (#d6ff00, H=67°) — looks great on near-black
          "[--aurora:repeating-linear-gradient(100deg,#d6ff00_10%,#b9df00_15%,#eaff8a_20%,#f7ffd6_25%,#d6ff00_30%)]",
          // Light mode: pure lime-green (#80ff00, H=90°) — screen-blends to green, not yellow
          "[--aurora-lime:repeating-linear-gradient(100deg,#80ff00_10%,#5cd800_15%,#b0ff60_20%,#d8ffb0_25%,#80ff00_30%)]",
          "[background-image:var(--aurora-lime)]",
          "dark:[background-image:var(--dark-gradient),var(--aurora)]",
          "[background-size:300%,_200%]",
          "[background-position:50%_50%,50%_50%]",
          "blur-[10px]",
          "after:content-['']",
          "after:absolute",
          "after:inset-0",
          "after:[background-image:var(--aurora-lime)]",
          "after:dark:[background-image:var(--dark-gradient),var(--aurora)]",
          "after:[background-size:200%,_100%]",
          "after:animate-aurora",
          "after:[background-attachment:fixed]",
          "after:mix-blend-screen",
          "pointer-events-none",
          "absolute",
          "-inset-[10px]",
          "opacity-[0.65] dark:opacity-50",
          "will-change-transform",
          showRadialGradient && [
            "[mask-image:radial-gradient(ellipse_130%_110%_at_65%_5%,black_25%,transparent_92%)]",
            "dark:[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]",
          ],
        )}
      />
    </div>
  );
};
