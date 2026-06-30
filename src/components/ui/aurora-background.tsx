import { cn } from "@/lib/utils";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  showRadialGradient?: boolean;
}

// Global fixed background layer — no children, no height.
//
// Light: two-layer system:
//   1. Violet ambient (blur 160px) — large diffuse halos at viewport corners/edges.
//      Coordinates use the -20% inset div's frame: viewport top-left corner = at 14% 14%,
//      viewport top-right = at 86% 14%, viewport bottom-right = at 86% 86%, etc.
//   2. White spotlight (blur 45px) — concentrated at centre only (36%×28% ellipse).
//      Sits on top; white covers ~65% of pixels, violet halos fill the remaining ~35%.
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
      {/* Light mode: Apple/visionOS — two-layer spotlight */}
      <div className="absolute inset-0 dark:hidden overflow-hidden" aria-hidden>
        {/* Layer 1: violet aurora — large top-down bloom columns.
            Gradients come from above: y=0% of the -20%-inset div = 20% above viewport top.
            blur(160px) pushes light down into the viewport creating the aurora effect. */}
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            filter: "blur(160px)",
            backgroundImage: [
              // Top-centre — wide main aurora column
              "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(167,139,250,0.45) 0%, transparent 70%)",
              // Top-left — secondary bloom
              "radial-gradient(ellipse 60% 45% at 15% 0%, rgba(196,181,253,0.40) 0%, transparent 75%)",
              // Top-right — secondary bloom
              "radial-gradient(ellipse 60% 45% at 85% 0%, rgba(196,181,253,0.35) 0%, transparent 75%)",
              // Mid lavender blend — transition between aurora and white
              "radial-gradient(ellipse 70% 35% at 50% 38%, rgba(221,214,254,0.22) 0%, transparent 70%)",
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
              "radial-gradient(ellipse 36% 28% at 50% 42%, rgba(255,255,255,0.97) 0%, rgba(248,245,255,0.55) 50%, transparent 74%)",
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
