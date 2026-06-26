"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  Ban,
  Clock,
  Database,
  Gavel,
  HardDrive,
  Lock,
  MailWarning,
  MessageSquare,
  RefreshCw,
  ScrollText,
  Server,
  Shield,
  UserMinus,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOwnerMetrics } from "@/features/owner/hooks/use-owner-metrics";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const OWNER_DISCORD_ID = "590275518599921701";

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function GatewayPing({ ms }: { ms: number }) {
  const color =
    ms < 100 ? "text-green-400" : ms < 300 ? "text-yellow-400" : "text-red-400";
  return <span className={cn("font-bold tabular-nums", color)}>{ms} ms</span>;
}

function JvmProgress({ used, max }: { used: number; max: number }) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <p className="font-bold tabular-nums text-white">
        {used}
        <span className="text-xs font-normal text-muted-foreground">
          /{max} MB
        </span>
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-4">
      <Skeleton className="mb-3 h-4 w-4" />
      <Skeleton className="mb-1 h-7 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value?: string | number;
  label: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-4 transition-colors hover:border-white/[0.12]">
      <div className={cn("mb-3", accent)}>
        <Icon className="h-4 w-4" />
      </div>
      {children ?? (
        <p className="truncate text-xl font-bold tabular-nums tracking-tight text-white">
          {value ?? "—"}
        </p>
      )}
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className={cn("grid gap-3", cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
      {Array.from({ length: cols }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

function OwnerPageComponent() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const session = useAuthStore((s) => s.session);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const discordId = session?.user?.id;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!discordId || discordId !== OWNER_DISCORD_ID) {
      router.replace("/dashboard");
    } else {
      setAuthorized(true);
    }
  }, [hasHydrated, discordId, router]);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useOwnerMetrics();

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (!hasHydrated || !authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-400" />
              <h1 className="text-2xl font-bold tracking-tight text-white">
                System Dashboard
              </h1>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Owner only — private metrics panel
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dataUpdatedAt ? (
              <p className="text-xs text-muted-foreground">
                Last updated {formatTimestamp(new Date(dataUpdatedAt))}
              </p>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="border-white/[0.08] bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
            >
              <RefreshCw
                className={cn("mr-1.5 h-3.5 w-3.5", isFetching && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-red-400" />
            <p className="text-sm font-medium text-white/80">
              Failed to load metrics
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The server may be unavailable. Try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-4 border-white/[0.08] bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 1 — Bot Status */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400">
                <Activity className="h-4 w-4" />
                Bot Status
              </h2>
              {isLoading ? (
                <SectionSkeleton cols={4} />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetricCard
                    icon={Server}
                    value={data?.totalGuilds}
                    label="Total Guilds"
                    accent="text-blue-400"
                  />
                  <MetricCard
                    icon={Users}
                    value={data?.totalUsers}
                    label="Total Users"
                    accent="text-blue-400"
                  />
                  <MetricCard
                    icon={Zap}
                    label="Gateway Ping"
                    accent="text-blue-400"
                  >
                    <GatewayPing ms={data?.gatewayPingMs ?? 0} />
                  </MetricCard>
                  <MetricCard
                    icon={Clock}
                    label="Uptime"
                    accent="text-blue-400"
                  >
                    <p className="truncate text-xl font-bold tabular-nums tracking-tight text-white">
                      {data ? formatUptime(data.uptimeSeconds) : "—"}
                    </p>
                  </MetricCard>
                </div>
              )}
            </section>

            {/* Section 2 — Infrastructure */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-purple-400">
                <HardDrive className="h-4 w-4" />
                Infrastructure
              </h2>
              {isLoading ? (
                <SectionSkeleton cols={4} />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetricCard
                    icon={HardDrive}
                    label="JVM Memory"
                    accent="text-purple-400"
                  >
                    <JvmProgress
                      used={data?.jvmUsedMemoryMb ?? 0}
                      max={data?.jvmMaxMemoryMb ?? 0}
                    />
                  </MetricCard>
                  <MetricCard
                    icon={Activity}
                    value={data?.activeThreads}
                    label="Active Threads"
                    accent="text-purple-400"
                  />
                  <MetricCard
                    icon={MessageSquare}
                    value={data?.totalChannels}
                    label="Total Channels"
                    accent="text-purple-400"
                  />
                  <MetricCard
                    icon={Database}
                    label="Redis"
                    accent="text-purple-400"
                  >
                    <p className="text-lg font-bold text-green-400">Connected</p>
                  </MetricCard>
                </div>
              )}
            </section>

            {/* Section 3 — Database Totals */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-400">
                <Database className="h-4 w-4" />
                Database Totals
              </h2>
              {isLoading ? (
                <SectionSkeleton cols={4} />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetricCard
                    icon={Users}
                    value={data?.totalGuildMembers}
                    label="Guild Members Tracked"
                    accent="text-green-400"
                  />
                  <MetricCard
                    icon={ScrollText}
                    value={data?.totalAuditLogs}
                    label="Audit Log Entries"
                    accent="text-green-400"
                  />
                  <MetricCard
                    icon={Shield}
                    value={data?.totalWarns}
                    label="Warns Issued (Total)"
                    accent="text-green-400"
                  />
                  <MetricCard
                    icon={MessageSquare}
                    value={data?.totalMessageCounts}
                    label="Message Count Entries"
                    accent="text-green-400"
                  />
                </div>
              )}
            </section>

            {/* Section 4 — Today's Activity */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-400">
                <Activity className="h-4 w-4" />
                Today&apos;s Activity
              </h2>
              {isLoading ? (
                <SectionSkeleton cols={9} />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <MetricCard
                    icon={MessageSquare}
                    value={data?.todayMessagesProcessed}
                    label="Messages Processed"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={Zap}
                    value={data?.todayCommandsExecuted}
                    label="Commands Executed"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={Shield}
                    value={data?.todayAutomodActions}
                    label="AutoMod Actions"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={UserPlus}
                    value={data?.todayMembersJoined}
                    label="Members Joined"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={MailWarning}
                    value={data?.todayWelcomeSent}
                    label="Welcome Messages Sent"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={Gavel}
                    value={data?.todayWarnsIssued}
                    label="Warns Issued"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={Ban}
                    value={data?.todayMutesIssued}
                    label="Mutes Issued"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={Gavel}
                    value={data?.todayBansIssued}
                    label="Bans Issued"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={UserMinus}
                    value={data?.todayKicksIssued}
                    label="Kicks Issued"
                    accent="text-orange-400"
                  />
                  <MetricCard
                    icon={Activity}
                    value={data?.todayAuditActions}
                    label="Audit Actions"
                    accent="text-orange-400"
                  />
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(OwnerPageComponent);
