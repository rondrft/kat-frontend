import { Suspense } from "react";
import type { Metadata } from "next";
import {
  AuthExpiredBanner,
  CommunityReveal,
  DiscordSlogan,
  HeroSection,
  KatShowcase,
  SmartSystems,
} from "@/components/landing";
import { PixelTrailGlobal } from "@/components/landing/pixel-trail-global";
import { SmoothScroll } from "@/components/smooth-scroll";
import { AuroraBackground } from "@/components/ui/aurora-background";

export const metadata: Metadata = {
  title: { absolute: "Kat" },
};

export default function HomePage() {
  return (
    <>
      <AuroraBackground />
      <PixelTrailGlobal />
      <SmoothScroll>
        <div className="landing-content relative min-h-screen [overflow-x:clip]">
          <Suspense>
            <AuthExpiredBanner />
          </Suspense>
          <main>
            <HeroSection />
            <DiscordSlogan />
            <KatShowcase />
            <CommunityReveal />
            <SmartSystems />
          </main>
        </div>
      </SmoothScroll>
    </>
  );
}
