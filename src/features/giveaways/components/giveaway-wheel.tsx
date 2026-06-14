"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GiveawayParticipant } from "@/features/giveaways/types/giveaway";

type GiveawayWheelProps = {
  participants: GiveawayParticipant[];
  winner: GiveawayParticipant | null;
  spinning: boolean;
  spinDurationMs?: number;
  className?: string;
};

export function GiveawayWheel({
  participants,
  winner,
  spinning,
  spinDurationMs = 3500,
  className,
}: GiveawayWheelProps) {
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "spinning" | "done">("idle");

  const displayParticipants = useMemo(() => {
    if (participants.length === 0) return [];
    if (participants.length >= 8) return participants;
    const repeated: GiveawayParticipant[] = [];
    while (repeated.length < 8) {
      repeated.push(...participants);
    }
    return repeated.slice(0, 12);
  }, [participants]);

  useEffect(() => {
    if (!spinning) {
      setPhase("idle");
      return;
    }

    setPhase("spinning");
    const start = performance.now();
    let animationFrame: number;
    const totalDuration = spinDurationMs;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / totalDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentDelay = 50 + 400 * eased;

      const index = Math.floor(elapsed / currentDelay) % Math.max(displayParticipants.length, 1);
      setHighlightIndex(index);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setPhase("done");
        if (winner && displayParticipants.length > 0) {
          const winnerIndex = displayParticipants.findIndex((p) => p.userId === winner.userId);
          setHighlightIndex(winnerIndex >= 0 ? winnerIndex : 0);
        }
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [spinning, winner, displayParticipants, spinDurationMs]);

  if (displayParticipants.length === 0) {
    return (
      <div
        className={cn(
          "flex h-64 flex-col items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]",
          className,
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Waiting for participants…</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]",
        className,
      )}
    >
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {displayParticipants.map((participant, index) => {
          const isHighlighted = phase === "done"
            ? winner?.userId === participant.userId
            : phase === "spinning" && highlightIndex === index;

          return (
            <div
              key={`${participant.userId}-${index}`}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-3 transition-all duration-150",
                isHighlighted
                  ? "scale-105 border-kat bg-kat/15 shadow-md"
                  : "border-black/[0.06] bg-white/50 dark:border-white/10 dark:bg-white/[0.04]",
              )}
            >
              <div
                className="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-white/10"
                style={{ backgroundImage: `url(${participant.avatarUrl})` }}
              />
              <span className="mt-2 max-w-full truncate text-[10px] font-medium text-foreground">
                {participant.globalName ?? participant.username}
              </span>
            </div>
          );
        })}
      </div>

      {phase === "done" && winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm dark:bg-black/60">
          <div className="flex flex-col items-center rounded-2xl border border-kat/30 bg-white p-6 shadow-xl dark:bg-[#1e1f22]">
            <div
              className="h-20 w-20 rounded-full bg-cover bg-center ring-4 ring-kat/30"
              style={{ backgroundImage: `url(${winner.avatarUrl})` }}
            />
            <p className="mt-4 text-lg font-bold text-foreground">Winner</p>
            <p className="text-sm text-kat">@{winner.username}</p>
          </div>
        </div>
      )}
    </div>
  );
}
