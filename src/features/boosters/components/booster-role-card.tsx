"use client";

import { motion } from "framer-motion";
import { Crown, Loader2, Palette, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BOOSTER_ROLE_COMMANDS,
  type BoosterRole,
} from "@/features/boosters/types/booster-role";
import { cn } from "@/lib/utils";

type BoosterRoleCardProps = {
  role: BoosterRole | null;
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
  compact?: boolean;
};

function isHexColor(value: string | null): value is string {
  return Boolean(value && /^#[0-9A-Fa-f]{6}$/.test(value));
}

export function BoosterRoleCard({
  role,
  isLoading = false,
  isError = false,
  className,
  compact = false,
}: BoosterRoleCardProps) {
  const savedRoleColor = role?.roleColor ?? null;
  const roleColor = isHexColor(savedRoleColor) ? savedRoleColor : "#5865F2";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border border-black/[0.08] bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                Booster custom role
              </p>
              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-600 shadow-none dark:text-amber-300">
                Premium
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Available to members who boosted the server twice.
            </p>
          </div>
        </div>

        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {isError ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load your booster role.
        </p>
      ) : null}

      {!isLoading && !isError && role ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-black/[0.06] bg-background/70 p-3 dark:border-white/10">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              Name
            </p>
            <p className="mt-1 truncate text-sm font-medium">
              {role.roleEmoji ? `${role.roleEmoji} ` : ""}
              {role.roleName ?? "Not set"}
            </p>
          </div>
          <div className="rounded-lg border border-black/[0.06] bg-background/70 p-3 dark:border-white/10">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              Color
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full border border-black/10 dark:border-white/20"
                style={{ backgroundColor: roleColor }}
              />
              <span className="text-sm font-medium">{role.roleColor ?? "Not set"}</span>
            </div>
          </div>
          <div className="rounded-lg border border-black/[0.06] bg-background/70 p-3 dark:border-white/10">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              Discord
            </p>
            {role.discordRoleId ? (
              <Badge variant="secondary" className="mt-1 text-[10px]">
                Created
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="mt-1 border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-300"
              >
                Role not created yet
              </Badge>
            )}
          </div>
        </div>
      ) : null}

      {!isLoading && !isError && !role ? (
        <div className="mt-4 rounded-lg border border-dashed border-black/[0.1] p-4 dark:border-white/10">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="min-w-0">
              <p className="text-sm font-medium">No custom role yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Boost the server twice, then use the Discord slash commands to configure
                and create your personal role.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!compact ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Palette className="h-3.5 w-3.5 text-kat" />
            Command reference
          </div>
          <div className="grid gap-2">
            {BOOSTER_ROLE_COMMANDS.map((item) => (
              <div
                key={item.command}
                className="flex flex-col gap-1 rounded-lg border border-black/[0.06] bg-background/70 px-3 py-2 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <code className="text-xs font-semibold text-kat">{item.command}</code>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
