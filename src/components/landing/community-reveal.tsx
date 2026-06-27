"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { CommunitySection } from "./community-section";

export function CommunityReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [vh, setVh] = useState(1080);
  useEffect(() => {
    setVh(window.innerHeight);
    const handler = () => setVh(window.innerHeight);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const spring = { stiffness: 55, damping: 24, mass: 0.9 };
  // top.png slides from 1 viewport below to 0 (fully covering cats).
  // Starts at 35% scroll progress to let the community section be visible first.
  const yRaw = useTransform(scrollYProgress, [0.35, 0.9], [vh, 0]);
  const y = useSpring(yRaw, spring);

  return (
    // 300vh = natural community section scroll time + ~200vh of reveal room
    <div ref={containerRef} className="relative" style={{ height: "300vh" }}>

      {/* Community (cats) section — stays pinned while top.png reveals */}
      <div className="sticky top-0 z-10">
        <CommunitySection />
      </div>

      {/* top.png — sticky at top, but starts 1vh below viewport via y transform.
          As scrollYProgress goes 0.35 → 0.9, slides up to cover the cats section.
          z-20 ensures it layers above the sticky community div. */}
      <motion.div
        className="sticky top-0 z-20 w-full"
        style={{ y }}
      >
        <Image
          src="/top.png"
          alt=""
          width={1893}
          height={930}
          className="w-screen block"
          style={{ display: "block", objectFit: "cover" }}
          sizes="100vw"
          priority
        />
      </motion.div>
    </div>
  );
}
