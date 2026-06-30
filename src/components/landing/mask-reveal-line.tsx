"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export const MASK_ENTER = 0.18;
export const MASK_EXIT  = 0.25;
export const MASK_TOTAL = MASK_ENTER + MASK_EXIT;

const MASK_FRAC = MASK_ENTER / MASK_TOTAL;

type Props = {
  delay:    number;
  inView:   boolean;
  children: ReactNode;
  shine?:   ReactNode;
};

export function MaskRevealLine({ delay, inView, children, shine }: Props) {
  return (
    <div className="relative overflow-hidden py-px">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: delay + MASK_ENTER, duration: 0.01 }}
      >
        {children}
      </motion.div>

      {shine}

      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: "#A78BFA", zIndex: 10 }}
        initial={{ x: "-101%" }}
        animate={inView ? { x: ["-101%", "0%", "101%"] } : { x: "-101%" }}
        transition={{
          delay,
          duration: MASK_TOTAL,
          times:    [0, MASK_FRAC, 1],
          ease:     "easeInOut",
        }}
      />
    </div>
  );
}
