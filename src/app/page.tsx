import type { Metadata } from "next";
import { BackgroundEffects, HeroSection } from "@/components/landing";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: { absolute: "Kat" },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />
      <SiteHeader />
      <main>
        <HeroSection />
      </main>
      <SiteFooter />
    </div>
  );
}
