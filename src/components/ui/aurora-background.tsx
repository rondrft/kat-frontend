import { cn } from "@/lib/utils";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  showRadialGradient?: boolean;
}

// Global fixed background layer — no children, no height.
//
// Light: two-layer system:
//   1. Violet ambient (blur 160px) — strong lavender/violet halos from top, right glow for cat.
//   2. Soft white highlight (blur 45px) — gentle centre bloom, no longer fully white.
// Dark:  near-black (#060900) + screen(violet stripes) → purple neon glow on black.
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
      {/* Light mode: Apple/visionOS — two-layer spotlight */}
      <div className="absolute inset-0 dark:hidden overflow-hidden" aria-hidden>
        {/* Layer 1: violet aurora — large top-down bloom columns.
            Gradients come from above: y=0% of the -20%-inset div = 20% above viewport top.
            blur(160px) pushes light down into the viewport creating the aurora effect. */}
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            filter: "blur(100px)",
            backgroundImage: [
              "radial-gradient(ellipse 90% 65% at 50% 0%, rgba(139,92,246,0.78) 0%, transparent 68%)",
              "radial-gradient(ellipse 70% 55% at 12% 0%, rgba(167,139,250,0.70) 0%, transparent 72%)",
              "radial-gradient(ellipse 70% 55% at 88% 0%, rgba(167,139,250,0.65) 0%, transparent 72%)",
              "radial-gradient(ellipse 80% 42% at 50% 42%, rgba(196,181,253,0.48) 0%, transparent 68%)",
              "radial-gradient(ellipse 55% 60% at 82% 45%, rgba(124,58,237,0.38) 0%, transparent 62%)",
            ].join(", "),
          }}
        />
        {/* Layer 2: white spotlight — tight blur, stays in the centre */}
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            filter: "blur(45px)",
            backgroundImage:
              "radial-gradient(ellipse 36% 28% at 50% 42%, rgba(255,255,255,0.62) 0%, rgba(232,220,255,0.40) 50%, transparent 74%)",
          }}
        />
      </div>

      {/* Animated aurora bands — light: near-white (effectively invisible on white base via screen)
          dark: yellow-lime on near-black */}
      <div
        className={cn(
          "[--dark-gradient:repeating-linear-gradient(100deg,#060900_0%,#060900_7%,transparent_10%,transparent_12%,#060900_16%)]",
          "[--aurora:repeating-linear-gradient(100deg,#7c3aed_10%,#6d28d9_15%,#a78bfa_20%,#c4b5fd_25%,#7c3aed_30%)]",
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
