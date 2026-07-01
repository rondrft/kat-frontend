"use client";

import { useState } from "react";
import { Crown, Info, Loader2, MessageCircle, Settings, Trophy, Users, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useServerLeaderboard } from "@/features/server-leaderboard/hooks/use-server-leaderboard";
import {
  useLeaderboardSettings,
  useUpdateLeaderboardSettings,
} from "@/features/server-leaderboard/hooks/use-leaderboard-settings";
import type { ServerLeaderboardEntry } from "@/features/server-leaderboard/types/server-leaderboard";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/utils/format";

type ServerLeaderboardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId?: string | null;
};

type Tab = "ranking" | "info" | "settings";

type PodiumTone = "gold" | "silver" | "bronze";

const styles = `
  @keyframes podium-shimmer {
    0% { transform: translateX(-100%) skewX(-15deg); }
    60% { transform: translateX(100%) skewX(-15deg); }
    100% { transform: translateX(100%) skewX(-15deg); }
  }
  @keyframes gold-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.25); }
    50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.55); }
  }
  .sl-podium-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
    animation: podium-shimmer 4s ease-in-out infinite;
    pointer-events: none;
  }
  .sl-gold-pulse {
    animation: gold-pulse 3s ease-in-out infinite;
  }
`;

const PODIUM_GRADIENTS: Record<PodiumTone, { bg: string; glow: string; ring: string }> = {
  gold: {
    bg: "linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,140,0,0.10))",
    glow: "0 0 30px rgba(255,215,0,0.3)",
    ring: "#FFD700",
  },
  silver: {
    bg: "linear-gradient(135deg, rgba(192,192,192,0.20), rgba(128,128,128,0.10))",
    glow: "0 0 25px rgba(192,192,192,0.25)",
    ring: "#C0C0C0",
  },
  bronze: {
    bg: "linear-gradient(135deg, rgba(205,127,50,0.20), rgba(139,69,19,0.10))",
    glow: "0 0 25px rgba(205,127,50,0.25)",
    ring: "#CD7F32",
  },
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.at(0)?.toUpperCase())
    .join("");
}

function ServerAvatar({
  entry,
  className,
  style,
}: {
  entry: ServerLeaderboardEntry;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Avatar className={cn("h-10 w-10", className)} style={style}>
      {entry.iconUrl ? <AvatarImage src={entry.iconUrl} alt="" /> : null}
      <AvatarFallback delayMs={0} className="text-xs font-semibold">
        {getInitials(entry.name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}

function PodiumCard({
  entry,
  rank,
  tone,
  primary = false,
}: {
  entry: ServerLeaderboardEntry;
  rank: number;
  tone: PodiumTone;
  primary?: boolean;
}) {
  const gradient = PODIUM_GRADIENTS[tone];
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border px-3 text-center backdrop-blur-md",
        primary ? "sm:min-h-[190px] sm:-translate-y-2 sm:py-5 py-4" : "py-4",
        rank === 1
          ? "border-yellow-500/40 sl-gold-pulse"
          : rank === 2
            ? "border-slate-400/30"
            : "border-orange-700/30",
      )}
      style={{ background: gradient.bg, boxShadow: gradient.glow }}
    >
      {rank === 1 ? <div className="sl-podium-shimmer" /> : null}

      {rank === 1 ? (
        <Crown className="mb-1.5 h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
      ) : (
        <span
          className={cn(
            "mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black",
            rank === 2
              ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
              : "bg-gradient-to-br from-amber-600 to-orange-800 text-white",
          )}
        >
          {rank}
        </span>
      )}

      <ServerAvatar
        entry={entry}
        className="mx-auto h-11 w-11"
        style={{ boxShadow: `0 0 0 3px ${gradient.ring}, 0 0 15px ${gradient.ring}55` }}
      />

      <p className="mt-1.5 max-w-full truncate text-sm font-bold text-white leading-tight">
        {entry.name}
      </p>

      <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-bold text-white/70">
        <Users className="h-3 w-3 text-yellow-400" />
        {formatCompactNumber(entry.memberCount)}
      </p>
    </div>
  );
}

function RankingRow({ entry, rank }: { entry: ServerLeaderboardEntry; rank: number }) {
  return (
    <li className="group relative flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2.5 transition-colors hover:bg-white/90 dark:bg-black/[0.18] dark:hover:bg-black/[0.3]">
      <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-gradient-to-b from-violet-500 to-purple-600 opacity-40 transition-opacity group-hover:opacity-80 dark:opacity-60 dark:group-hover:opacity-100" />

      <span className="flex h-6 w-8 items-center justify-center rounded-md bg-purple-100 font-mono text-xs font-bold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
        #{rank}
      </span>

      <ServerAvatar entry={entry} className="h-8 w-8" />

      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800 dark:text-white/90">
        {entry.name}
      </span>

      <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-gray-500 dark:text-white/60">
        <Users className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
        {formatCompactNumber(entry.memberCount)}
      </span>
    </li>
  );
}

function RankingTab({ entries }: { entries: ServerLeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl bg-black/[0.025] p-6 text-center dark:bg-white/[0.03]">
        <Trophy className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No servers yet</p>
        <p className="text-xs text-muted-foreground">
          Servers that opt in will appear here.
        </p>
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-end">
        <div className="order-2 sm:order-1">
          {top3[1] ? <PodiumCard entry={top3[1]} rank={2} tone="silver" /> : null}
        </div>
        <div className="order-1 sm:order-2">
          {top3[0] ? <PodiumCard entry={top3[0]} rank={1} tone="gold" primary /> : null}
        </div>
        <div className="order-3">
          {top3[2] ? <PodiumCard entry={top3[2]} rank={3} tone="bronze" /> : null}
        </div>
      </div>

      {rest.length > 0 ? (
        <ul className="space-y-1.5">
          {rest.map((entry, i) => (
            <RankingRow key={entry.id || entry.guildId} entry={entry} rank={i + 4} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function InfoTab() {
  const items = [
    {
      icon: Trophy,
      title: "What is this?",
      body: "A public ranking of the largest servers using Kat Bot, sorted by member count.",
    },
    {
      icon: Zap,
      title: "Privacy-first",
      body: "Only servers that explicitly opt in appear here. Servers are hidden by default.",
    },
    {
      icon: MessageCircle,
      title: "How to opt in",
      body: "Server admins can enable the leaderboard listing from the Kat Bot dashboard settings.",
    },
    {
      icon: Users,
      title: "Data freshness",
      body: "Rankings refresh every 5 minutes. Member counts are pulled directly from Discord.",
    },
  ];

  return (
    <div className="space-y-3">
      {items.map(({ icon: Icon, title, body }) => (
        <div
          key={title}
          className="flex gap-3 rounded-xl bg-black/[0.025] p-4 dark:bg-white/[0.03]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kat/10 text-kat">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({ guildId }: { guildId: string }) {
  const { data: settings, isLoading } = useLeaderboardSettings(guildId);
  const { mutate: updateSettings, isPending } = useUpdateLeaderboardSettings(guildId);

  const showOnLeaderboard = settings?.showOnLeaderboard ?? false;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your server only appears on the public leaderboard if you opt in. It is hidden by default and only admins can change this setting.
        </p>
      </div>

      <div className="rounded-xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Appear in Server Leaderboard</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Make this server visible in the public ranking of Kat Bot servers, sorted by member count.
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={showOnLeaderboard}
              onCheckedChange={(checked) => updateSettings(checked)}
              disabled={isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ServerLeaderboardModal({ open, onOpenChange, guildId }: ServerLeaderboardModalProps) {
  const [tab, setTab] = useState<Tab>("ranking");
  const { data: entries = [], isLoading } = useServerLeaderboard();

  const hasGuild = Boolean(guildId);

  type TabConfig = { id: Tab; label: string; icon: typeof Trophy };
  const TABS: TabConfig[] = [
    { id: "ranking", label: "Ranking", icon: Trophy },
    { id: "info", label: "How it works", icon: Info },
    ...(hasGuild ? [{ id: "settings" as Tab, label: "Settings", icon: Settings }] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style>{styles}</style>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-kat/10 text-kat">
              <Trophy className="h-4 w-4" />
            </span>
            Server Leaderboard
          </DialogTitle>
          <DialogDescription>
            Top servers using Kat Bot, ranked by member count.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === "settings" && guildId ? (
          <SettingsTab guildId={guildId} />
        ) : tab === "ranking" && isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tab === "ranking" ? (
          <RankingTab entries={entries} />
        ) : (
          <InfoTab />
        )}
      </DialogContent>
    </Dialog>
  );
}
