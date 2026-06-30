"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { CommunitySection } from "./community-section";

export function CommunityReveal() {
  const communityRef              = useRef<HTMLDivElement>(null);
  const [communityH, setCommunityH] = useState(0);

  useEffect(() => {
    const el = communityRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setCommunityH(h);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="relative"
      style={{ height: communityH > 0 ? `calc(${communityH}px + 100vh)` : "200vh" }}
    >
      <div ref={communityRef} className="sticky top-0 z-20">
        <CommunitySection />
      </div>

      <div className="sticky top-0 z-30 w-full h-screen">
        <div className="relative w-full h-full">
          <Image
            src="/logo/miniature.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
