import { cn } from "@/lib/utils";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  showRadialGradient?: boolean;
}

// Global fixed background layer — no children, no height.
//
// Light: near-white (#F9F8FF) base. mix-blend-screen over white = white (invisible),
//        so the visual character comes entirely from the static radial spotlight:
//        a luminous white centre with a soft lavender blush top-left — Apple/visionOS feel.
// Dark:  near-black (#060900) + screen(#d6ff00 stripes H=67°) → yellow-lime glow on black.
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
        "bg-[#F9F8FF] dark:bg-[#060900]",
        "transition-colors duration-500",
        className,
      )}
      {...props}
    >
      {/* Light mode: Apple/visionOS spotlight — white centre, lavender ambient surrounding */}
      <div className="absolute inset-0 dark:hidden overflow-hidden" aria-hidden>
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            filter: "blur(62px)",
            backgroundImage: [
              // White luminous centre — the "screen" zone, dominant bright area
              "radial-gradient(ellipse 72% 58% at 55% 38%, rgba(255,255,255,0.97) 0%, rgba(248,245,255,0.55) 42%, transparent 70%)",
              // Main lavender zone top-left — clearly visible (#C4B5FD range), like reference
              "radial-gradient(ellipse 88% 72% at -5% -5%, rgba(196,181,253,0.72) 0%, rgba(221,214,254,0.48) 38%, rgba(237,233,254,0.18) 60%, transparent 75%)",
              // Left edge lavender — extends the purple glow down the left side
              "radial-gradient(ellipse 38% 75% at -5% 62%, rgba(167,139,250,0.28) 0%, rgba(221,214,254,0.14) 52%, transparent 75%)",
              // Right soft lavender halo — prevents pure white on right edge
              "radial-gradient(ellipse 48% 52% at 108% 22%, rgba(237,233,254,0.40) 0%, rgba(221,214,254,0.18) 50%, transparent 68%)",
              // Bottom ambient violet — very subtle anchor
              "radial-gradient(ellipse 62% 28% at 50% 108%, rgba(196,181,253,0.14) 0%, transparent 55%)",
            ].join(", "),
          }}
        />
      </div>

      {/* Animated aurora bands — light: near-white (effectively invisible on white base via screen)
          dark: yellow-lime on near-black */}
      <div
        className={cn(
          "[--dark-gradient:repeating-linear-gradient(100deg,#060900_0%,#060900_7%,transparent_10%,transparent_12%,#060900_16%)]",
          // Dark mode: brand yellow-lime (#d6ff00, H=67°) — looks great on near-black
          "[--aurora:repeating-linear-gradient(100deg,#d6ff00_10%,#b9df00_15%,#eaff8a_20%,#f7ffd6_25%,#d6ff00_30%)]",
          // Light mode: near-white stripes — screen over white = white, just a whisper of texture
          "[--aurora-soft:repeating-linear-gradient(100deg,#F5F3FF_10%,#EDE9FE_15%,#FFFFFF_20%,#FAF9FF_25%,#F5F3FF_30%)]",
          "[background-image:var(--aurora-soft)]",
          "dark:[background-image:var(--dark-gradient),var(--aurora)]",
          "[background-size:300%,_200%]",
          "[background-position:50%_50%,50%_50%]",
          "blur-[10px]",
          "after:content-['']",
          "after:absolute",
          "after:inset-0",
          "after:[background-image:var(--aurora-soft)]",
          "after:dark:[background-image:var(--dark-gradient),var(--aurora)]",
          "after:[background-size:200%,_100%]",
          "after:animate-aurora",
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
