"use client";

import { memo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { NewMember } from "@/features/dashboard/types/new-member";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDiscordAvatarUrl } from "@/utils/discord";
import { cn } from "@/lib/utils";

export type MemberAlertsWidgetProps = {
  members?: NewMember[];
  isLoading?: boolean;
  className?: string;
};

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return minutes === 1 ? "1 min ago" : `${minutes} min ago`;
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

const itemVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -6, filter: "blur(6px)", transition: { duration: 0.16 } },
};

export function MemberAlertsWidgetComponent({
  members = [],
  isLoading = false,
  className,
}: MemberAlertsWidgetProps) {
  const isEmpty = !isLoading && members.length === 0;

  return (
    <section
      className={cn(
        "dashboard-glass-card flex h-full flex-col overflow-hidden p-3 sm:p-4",
        className,
      )}
      aria-label="Member alerts"
    >
      <div className="mb-2">
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Member Alerts
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          Recent joins with quick heuristics. Refreshes every 30s.
        </p>
      </div>

      <ScrollArea className="max-h-[14.75rem] min-h-0 flex-1">
        <div className="space-y-1.5 pr-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg border border-black/[0.06] bg-black/[0.02] p-2 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="h-8 w-8 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-3.5 w-28 animate-pulse rounded bg-black/[0.06] dark:bg-white/10" />
                  <div className="h-3 w-16 animate-pulse rounded bg-black/[0.06] dark:bg-white/10" />
                </div>
              </div>
            ))
          ) : isEmpty ? (
            <p className="py-4 text-xs text-muted-foreground">
              No recent join events yet.
            </p>
          ) : (
            <AnimatePresence initial={false}>
              {members.map((member) => {
                const level = member.alertLevel ?? "green";
                const alertReasons = member.alertReasons ?? [];
                const dotClass =
                  level === "red"
                    ? "bg-red-500"
                    : level === "yellow"
                      ? "bg-amber-400"
                      : "bg-emerald-500";

                return (
                  <motion.div
                    key={member.id}
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex items-center gap-2.5 rounded-lg border border-black/[0.06] bg-black/[0.02] p-2 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                      <Image
                        src={getDiscordAvatarUrl(member.discordId, member.avatar, 64)}
                        alt={member.username}
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {member.username}
                        </p>
                        {member.bot ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-full border px-1.5 py-px text-[8px] font-bold leading-none",
                              member.verifiedBot
                                ? "border-black/[0.08] bg-black/[0.04] text-muted-foreground dark:border-white/10 dark:bg-white/5"
                                : "border-red-500/30 bg-red-500/10 text-red-500",
                            )}
                          >
                            BOT
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatRelative(member.joinedAt)}
                      </p>
                      {alertReasons.length > 0 ? (
                        <p
                          className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground"
                          title={alertReasons.join(" | ")}
                        >
                          {alertReasons.join(" | ")}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotClass)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}

export const MemberAlertsWidget = memo(MemberAlertsWidgetComponent);
