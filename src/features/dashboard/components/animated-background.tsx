"use client";

import { memo } from "react";

function AnimatedBackgroundComponent() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="to-blue-100/18 absolute inset-0 bg-gradient-to-b from-white/5 via-transparent dark:from-transparent dark:to-background/20" />

      <div className="anim-dash-blob-pulse bg-blue-500/16 absolute -left-[8%] bottom-[-4%] h-[360px] w-[360px] rounded-full blur-[115px] dark:bottom-[-8%] dark:bg-blue-500/10" />
      <div className="anim-dash-blob-fade bg-cyan-400/13 absolute bottom-[-5%] right-[4%] h-[330px] w-[330px] rounded-full blur-[105px] dark:bottom-[-10%] dark:bg-blue-500/10" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_96%,hsl(214_86%_55%/0.1),transparent_48%),radial-gradient(ellipse_at_72%_92%,hsl(195_88%_56%/0.08),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_28%_98%,hsl(214_86%_55%/0.06),transparent_48%),radial-gradient(ellipse_at_72%_96%,hsl(199_89%_48%/0.04),transparent_45%)]" />
    </div>
  );
}

export const AnimatedBackground = memo(AnimatedBackgroundComponent);
