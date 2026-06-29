"use client";

import { memo } from "react";
import Image from "next/image";
import { BotInviteReturnHandler } from "@/features/guilds/components/bot-invite-return-handler";
import { SiteHeader } from "@/components/layout/site-header";
import { AnimatedBackground } from "@/features/dashboard/components/animated-background";
import { DynamicContent } from "@/features/dashboard/components/dynamic-content";
import { FloatingPanel } from "@/features/dashboard/components/floating-panel";
import { SidebarNavigation } from "@/features/dashboard/components/sidebar-navigation";

function DashboardShellComponent() {
  return (
    <div className="relative flex h-screen max-h-screen flex-col overflow-hidden bg-background">
      <BotInviteReturnHandler />
      <AnimatedBackground />
      <SiteHeader variant="dashboard" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-row px-1.5 pb-0 pt-1 sm:px-2 md:px-3">
        <SidebarNavigation />
        <FloatingPanel className="h-full max-h-full">
          <div className="relative z-10 flex min-h-0 flex-1 flex-row">
            <DynamicContent />
          </div>
          <Image
            src="/kathand.webp"
            alt=""
            width={700}
            height={480}
            className="pointer-events-none absolute -top-64 -right-56 z-0 opacity-10 select-none"
            style={{ transform: "rotate(-45deg)" }}
            priority={false}
          />
        </FloatingPanel>
      </div>
    </div>
  );
}

export const DashboardShell = memo(DashboardShellComponent);
