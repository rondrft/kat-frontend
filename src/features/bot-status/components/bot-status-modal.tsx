"use client";

import { useState } from "react";
import { Activity, RefreshCw, Search, Server, Users, Wifi } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBotStatus } from "@/features/bot-status/hooks/use-bot-status";
import type { ShardStatus } from "@/features/bot-status/types";
import { cn } from "@/lib/utils";

type BotStatusModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function statusColor(status: ShardStatus) {
  switch (status) {
    case "CONNECTED":
      return "bg-green-500";
    case "RECONNECTING":
    case "CONNECTING":
      return "bg-yellow-500";
    default:
      return "bg-red-500";
  }
}

function overallStatus(connected: number, total: number) {
  if (connected === total) return { label: "Operacional", color: "text-green-500", dot: "bg-green-500" };
  if (connected > 0) return { label: "Degradado", color: "text-yellow-500", dot: "bg-yellow-500" };
  return { label: "Sin conexión", color: "text-red-500", dot: "bg-red-500" };
}

function getShardForGuild(guildId: string, totalShards: number): number | null {
  try {
    return Number((BigInt(guildId) >> 22n) % BigInt(totalShards));
  } catch {
    return null;
  }
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

export function BotStatusModal({ open, onOpenChange }: BotStatusModalProps) {
  const { data, isLoading, isFetching, dataUpdatedAt } = useBotStatus(open);
  const [guildSearch, setGuildSearch] = useState("");

  const overall = data ? overallStatus(data.connectedShards, data.totalShards) : null;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : null;

  const isValidSnowflake = /^\d{17,20}$/.test(guildSearch.trim());
  const highlightedShard =
    data && isValidSnowflake
      ? getShardForGuild(guildSearch.trim(), data.totalShards)
      : null;
  const highlightedShardInfo =
    highlightedShard !== null ? data?.shards.find((s) => s.shardId === highlightedShard) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setGuildSearch(""); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-kat/30 bg-kat/10">
            <Activity className="h-5 w-5 text-kat" />
          </div>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle>Estado del bot</DialogTitle>
              {overall && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={cn("inline-block h-2 w-2 rounded-full", overall.dot)} />
                  <span className={cn("text-sm font-medium", overall.color)}>{overall.label}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
              {lastUpdated && <span>{lastUpdated}</span>}
            </div>
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && !data && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No se pudo conectar con el bot.
          </p>
        )}

        {data && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={Wifi} label="Clusters" value={data.totalShards} />
              <StatCard icon={Activity} label="Conectados" value={`${data.connectedShards}/${data.totalShards}`} />
              <StatCard icon={Server} label="Servidores" value={data.totalGuilds.toLocaleString()} />
              <StatCard icon={Users} label="Usuarios" value={data.totalUsers.toLocaleString()} />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={guildSearch}
                onChange={(e) => setGuildSearch(e.target.value)}
                placeholder="Buscar servidor por ID..."
                className="pl-9"
              />
              {guildSearch && (
                <div className="mt-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 text-sm">
                  {!isValidSnowflake ? (
                    <span className="text-muted-foreground">ID inválida — debe tener entre 17 y 20 dígitos.</span>
                  ) : highlightedShardInfo ? (
                    <span>
                      Este servidor está en el{" "}
                      <span className="font-semibold">Shard {highlightedShard}</span>{" "}
                      <span className={cn("font-medium", highlightedShardInfo.status === "CONNECTED" ? "text-green-500" : highlightedShardInfo.status === "DISCONNECTED" ? "text-red-500" : "text-yellow-500")}>
                        ({highlightedShardInfo.status})
                      </span>
                      {" — "}{highlightedShardInfo.guilds} servidores, {highlightedShardInfo.pingMs}ms
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Este servidor estaría en el{" "}
                      <span className="font-semibold text-foreground">Shard {highlightedShard}</span>{" "}
                      (shard no encontrado en datos actuales).
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shards
              </p>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {data.shards.map((shard) => (
                  <div
                    key={shard.shardId}
                    title={`Shard ${shard.shardId} — ${shard.status} — ${shard.guilds} servidores — ${shard.pingMs}ms`}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2.5 transition-colors",
                      highlightedShard === shard.shardId
                        ? "border-kat/50 bg-kat/10 ring-1 ring-kat/30"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40"
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", statusColor(shard.status))} />
                    <span className={cn(
                      "text-xs font-medium",
                      highlightedShard === shard.shardId ? "text-foreground font-bold" : "text-muted-foreground"
                    )}>
                      {shard.shardId}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Actualización automática cada 15 segundos
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
