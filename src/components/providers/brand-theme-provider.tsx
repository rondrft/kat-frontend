"use client";

import { useEffect } from "react";
import { brandPresets } from "@/config/themes";
import { useUiStore } from "@/store/ui-store";

export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const brandPreset = useUiStore((s) => s.brandPreset);

  useEffect(() => {
    const preset = brandPresets[brandPreset];
    const root = document.documentElement;
    root.style.setProperty("--primary", preset.primary);
    root.style.setProperty("--primary-foreground", preset.primaryForeground);
    root.style.setProperty("--kat-brand", preset.primary);
    root.style.setProperty(
      "--kat-brand-muted",
      preset.primary.replace(/(\d+)%\)$/, "45%)"),
    );
  }, [brandPreset]);

  return <>{children}</>;
}
