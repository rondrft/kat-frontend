"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthHydrationProvider } from "./auth-hydration-provider";
import { BrandThemeProvider } from "./brand-theme-provider";
import { LocaleHydrationProvider } from "./locale-hydration-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BrandThemeProvider>
        <QueryProvider>
          <AuthHydrationProvider>
            <TooltipProvider delayDuration={300}>
              <LocaleHydrationProvider>{children}</LocaleHydrationProvider>
            </TooltipProvider>
          </AuthHydrationProvider>
        </QueryProvider>
      </BrandThemeProvider>
    </ThemeProvider>
  );
}
