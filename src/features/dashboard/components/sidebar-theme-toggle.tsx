"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { id: "light", label: "Light theme", icon: Sun },
  { id: "dark", label: "Dark theme", icon: Moon },
] as const;

export function SidebarThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const currentTheme = mounted ? (resolvedTheme ?? "light") : "light";

  return (
    <div className="flex flex-col items-center gap-3" aria-label="Theme controls">
      {THEME_OPTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = currentTheme === id;

        return (
          <Tooltip key={id} delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setTheme(id)}
                aria-label={label}
                aria-pressed={isActive}
                disabled={!mounted}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  isActive
                    ? "border-kat/50 bg-kat/20 text-kat shadow-[0_0_20px_hsl(var(--kat-brand)/0.28)]"
                    : [
                        "border-black/[0.08] bg-black/[0.03] text-muted-foreground",
                        "hover:border-black/[0.12] hover:bg-black/[0.05] hover:text-foreground",
                        "dark:border-white/10 dark:bg-white/5",
                        "dark:hover:border-white/20 dark:hover:bg-white/10",
                      ].join(" "),
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.25 : 1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="border-black/[0.08] bg-background/95 shadow-md backdrop-blur-md dark:border-white/10 dark:shadow-none"
            >
              {label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
