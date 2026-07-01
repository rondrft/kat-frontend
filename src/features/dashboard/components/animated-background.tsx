"use client";

import { memo } from "react";

function AnimatedBackgroundComponent() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="to-violet-100/12 absolute inset-0 bg-gradient-to-b from-white/5 via-transparent dark:from-transparent dark:to-background/20" />

      <div className="anim-dash-blob-pulse bg-violet-500/12 absolute -left-[8%] bottom-[-4%] h-[360px] w-[360px] rounded-full blur-[115px] dark:bottom-[-8%] dark:bg-violet-500/8" />
      <div className="anim-dash-blob-fade bg-purple-400/10 absolute bottom-[-5%] right-[4%] h-[330px] w-[330px] rounded-full blur-[105px] dark:bottom-[-10%] dark:bg-purple-500/8" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_96%,hsl(250_80%_62%/0.08),transparent_48%),radial-gradient(ellipse_at_72%_92%,hsl(270_60%_60%/0.06),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_28%_98%,hsl(250_80%_62%/0.05),transparent_48%),radial-gradient(ellipse_at_72%_96%,hsl(270_60%_55%/0.03),transparent_45%)]" />
    </div>
  );
}

export const AnimatedBackground = memo(AnimatedBackgroundComponent);
