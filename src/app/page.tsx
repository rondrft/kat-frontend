import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthExpiredBanner, HeroSection } from "@/components/landing";
import { SmoothScroll } from "@/components/smooth-scroll";

export const metadata: Metadata = {
  title: { absolute: "Kat" },
};

export default function HomePage() {
  return (
    <>
    <style>{`
      html { background-color: #ffffff; }
      html.dark { background-color: #030d1c; }
    `}</style>
    <SmoothScroll>
      <div className="relative min-h-screen [overflow-x:clip] bg-white dark:bg-[#030d1c]">
        <Suspense>
          <AuthExpiredBanner />
        </Suspense>
        <main>
          <HeroSection />
        </main>
      </div>
    </SmoothScroll>
    </>
  );
}
