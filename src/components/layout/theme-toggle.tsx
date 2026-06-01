"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9" disabled />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Oscuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
        {theme && (
          <DropdownMenuItem disabled className="text-xs opacity-50">
            Actual: {theme}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
