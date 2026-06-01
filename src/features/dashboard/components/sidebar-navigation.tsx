"use client";

import { memo, useCallback } from "react";
import { dashboardSections } from "@/features/dashboard/config/sections";
import { NavigationButton } from "@/features/dashboard/components/navigation-button";
import { SidebarThemeToggle } from "@/features/dashboard/components/sidebar-theme-toggle";
import { useDashboardNavStore } from "@/features/dashboard/store/dashboard-nav-store";
import type { DashboardSectionId } from "@/features/dashboard/types";

function SidebarNavigationComponent() {
  const activeSection = useDashboardNavStore((s) => s.activeSection);
  const setActiveSection = useDashboardNavStore((s) => s.setActiveSection);

  const handleSelect = useCallback(
    (id: DashboardSectionId) => {
      if (id !== activeSection) setActiveSection(id);
    },
    [activeSection, setActiveSection],
  );

  return (
    <nav
      className="flex shrink-0 flex-col items-center justify-center gap-3 px-4 py-8 md:px-6"
      aria-label="Dashboard sections"
    >
      <div className="flex flex-col items-center gap-3">
        {dashboardSections.map((section) => (
          <NavigationButton
            key={section.id}
            icon={section.icon}
            label={section.label}
            isActive={activeSection === section.id}
            onClick={() => handleSelect(section.id)}
          />
        ))}
      </div>

      <div className="my-1 h-px w-8 bg-black/[0.08] dark:bg-white/10" />
      <SidebarThemeToggle />
    </nav>
  );
}

export const SidebarNavigation = memo(SidebarNavigationComponent);
