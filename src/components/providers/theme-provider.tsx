"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { themeStorageKey } from "@/config/themes";

let hasResetThemeOnThisPageLoad = false;

function ResetThemeOnMount() {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (hasResetThemeOnThisPageLoad) return;
    hasResetThemeOnThisPageLoad = true;
    setTheme("light");
  }, [setTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey={themeStorageKey}
      {...props}
    >
      <ResetThemeOnMount />
      {children}
    </NextThemesProvider>
  );
}
