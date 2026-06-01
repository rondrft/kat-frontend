"use client";

import { memo } from "react";
import { motion } from "framer-motion";

function AnimatedBackgroundComponent() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="to-blue-100/18 absolute inset-0 bg-gradient-to-b from-white/5 via-transparent dark:from-transparent dark:to-background/20" />

      <motion.div
        className="bg-blue-500/16 absolute -left-[8%] bottom-[-4%] h-[360px] w-[360px] rounded-full blur-[115px] dark:bottom-[-8%] dark:bg-blue-500/10"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="bg-cyan-400/13 absolute bottom-[-5%] right-[4%] h-[330px] w-[330px] rounded-full blur-[105px] dark:bottom-[-10%] dark:bg-blue-500/10"
        animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="bg-sky-400/11 dark:bg-sky-500/12 absolute bottom-[4%] left-[36%] h-[300px] w-[300px] rounded-full blur-[110px]"
        animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="bg-blue-300/12 dark:bg-cyan-400/12 absolute bottom-[2%] right-[26%] h-[270px] w-[270px] rounded-full blur-[95px]"
        animate={{ opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_96%,hsl(214_86%_55%/0.1),transparent_48%),radial-gradient(ellipse_at_72%_92%,hsl(195_88%_56%/0.08),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_28%_98%,hsl(214_86%_55%/0.06),transparent_48%),radial-gradient(ellipse_at_72%_96%,hsl(199_89%_48%/0.04),transparent_45%)]" />

      <div className="absolute inset-0 bg-background/[0.02] backdrop-blur-[1px]" />
    </div>
  );
}

export const AnimatedBackground = memo(AnimatedBackgroundComponent);
