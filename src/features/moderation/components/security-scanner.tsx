"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Loader2, Scan, User, UserCheck, FileWarning } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSecurityScan } from "@/features/moderation/hooks/use-security-scan";
import type { SecurityScanFinding, SecurityScanResult, SecurityScanSummary, SecurityScanSeverity } from "@/types/moderation";
import { getDiscordAvatarUrl } from "@/utils/discord";

type ScannedMember = {
  id: string;
  name: string;
  avatar: string | null;
  anomalies: string[];
};

type ScanState = "idle" | "scanning" | "complete" | "error";

const SCAN_LINES = [
  "Initializing security scan engine...",
  "Analyzing channel configurations...",
  "Checking permission structures...",
  "Scanning role hierarchy...",
  "Validating moderation rules...",
  "Inspecting recent member activity...",
  "Checking for anomalous accounts...",
  "Cross-referencing known threat patterns...",
  "Evaluating overall server security posture...",
  "Finalizing report...",
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  WARNING: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  INFO: "text-violet-500 bg-violet-500/10 border-violet-500/30",
  SUCCESS: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
};

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "CRITICAL") return <ShieldAlert className="h-4 w-4 text-rose-500" />;
  if (severity === "WARNING") return <FileWarning className="h-4 w-4 text-amber-500" />;
  if (severity === "INFO") return <Shield className="h-4 w-4 text-violet-500" />;
  return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
}

function SimulatedTerminal({
  lines,
  onComplete,
}: {
  lines: string[];
  onComplete: () => void;
}) {
  const [visible, setVisible] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (currentLine >= lines.length) {
      onComplete();
      return;
    }

    const line = lines[currentLine];
    if (!line) return;
    const timer = setTimeout(() => {
      if (charIndex < line.length) {
        const nextIndex = charIndex + 1;
        setCharIndex(nextIndex);
        setVisible((prev) => {
          const copy = [...prev];
          if (copy.length <= currentLine) {
            copy.push(line.slice(0, nextIndex));
          } else {
            copy[currentLine] = line.slice(0, nextIndex);
          }
          return copy;
        });
      } else {
        setVisible((prev) => {
          const copy = [...prev];
          if (copy.length <= currentLine) {
            copy.push(line);
          } else {
            copy[currentLine] = line;
          }
          return copy;
        });
        setCharIndex(0);
        setCurrentLine((prev) => prev + 1);
      }
    }, charIndex === 0 ? 400 : 25);

    return () => clearTimeout(timer);
  }, [currentLine, charIndex, lines, onComplete]);

  return (
    <div className="max-h-64 overflow-y-auto rounded-xl bg-black/80 p-4 font-mono text-xs leading-relaxed text-emerald-400 dark:bg-black/60">
      {visible.map((text, i) => (
        <div key={i} className="whitespace-pre-wrap">
          <span className="text-emerald-600">$ </span>{text}
          {i === currentLine && i < lines.length ? <span className="animate-pulse text-emerald-400">▊</span> : null}
        </div>
      ))}
      {currentLine < lines.length && visible.length <= currentLine ? (
        <div>
          <span className="text-emerald-600">$ </span>
          <span className="animate-pulse text-emerald-400">▊</span>
        </div>
      ) : null}
    </div>
  );
}

function FindingCard({ finding }: { finding: SecurityScanFinding }) {
  return (
    <div className={cn("rounded-xl border p-3", SEVERITY_COLORS[finding.severity] ?? "border-black/[0.08] dark:border-white/10")}>
      <div className="flex items-start gap-2">
        <SeverityIcon severity={finding.severity} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold">{finding.title}</p>
            <Badge className={cn("text-[10px] shadow-none", SEVERITY_COLORS[finding.severity])}>
              {finding.severity}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{finding.description}</p>
          {finding.targetName ? (
            <p className="mt-1 text-[11px] text-muted-foreground/70">
              Target: {finding.targetName} {finding.targetId ? `(${finding.targetId.slice(0, 8)}…)` : ""}
            </p>
          ) : null}
          {finding.recommendation ? (
            <p className="mt-1.5 text-[11px] font-medium text-foreground/80">
              {finding.recommendation}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";
  const barColor = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("text-4xl font-black tracking-tight", color)}>{score}</div>
      <p className="text-xs text-muted-foreground">Security Score</p>
      <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/[0.08]">
        <div className={cn("h-full rounded-full transition-all duration-1000", barColor)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SummaryCards({ summary }: { summary: SecurityScanSummary }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: "Total", value: summary.total, color: "text-foreground" },
        { label: "Critical", value: summary.critical, color: "text-rose-500" },
        { label: "Warnings", value: summary.warning, color: "text-amber-500" },
        { label: "Info", value: summary.info, color: "text-violet-500" },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
          <span className={cn("text-xl font-black", color)}>{value}</span>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

async function fetchRecentMembers(guildId: string): Promise<ScannedMember[]> {
  try {
    const { guildService } = await import("@/services/guild.service");
    const members = await guildService.getRecentMembers(guildId, 20);
    return (Array.isArray(members) ? members : []).map((m: { id?: string; username?: string; displayName?: string; globalName?: string; name?: string; avatar?: string | null | undefined }) => {
      const anomalies: string[] = [];
      const name = m.displayName || m.globalName || m.username || m.name || "Unknown";
      const avatar = m.avatar ?? null;
      if (avatar === null || avatar === undefined) anomalies.push("Default avatar");
      if (name.length < 2 || /[^a-zA-Z0-9_\u4e00-\u9fff]/.test(name)) anomalies.push("Suspicious name");
      return {
        id: m.id || "",
        name,
        avatar,
        anomalies,
      };
    });
  } catch {
    return [];
  }
}

function MemberCard({ member }: { member: ScannedMember }) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border p-3 transition-colors",
      member.anomalies.length > 0
        ? "border-amber-500/30 bg-amber-500/[0.03]"
        : "border-black/[0.08] dark:border-white/10",
    )}>
      <div className="relative shrink-0">
        <img
          src={getDiscordAvatarUrl(member.id, member.avatar, 64)}
          alt=""
          className="h-10 w-10 rounded-full"
        />
        {member.anomalies.length > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
            !
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{member.name}</p>
        <p className="text-[11px] text-muted-foreground">{member.id.slice(0, 12)}…</p>
        {member.anomalies.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {member.anomalies.map((a) => (
              <span key={a} className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500">
                {a}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {member.anomalies.length === 0 ? (
        <UserCheck className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <User className="h-4 w-4 shrink-0 text-amber-500" />
      )}
    </div>
  );
}

type SecurityScannerProps = {
  guildId: string;
};

function SecurityScannerComponent({ guildId }: SecurityScannerProps) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [members, setMembers] = useState<ScannedMember[]>([]);
  const [findings, setFindings] = useState<SecurityScanFinding[]>([]);
  const [result, setResult] = useState<SecurityScanResult | null>(null);
  const queryClient = useQueryClient();
  const { refetch } = useSecurityScan(guildId);

  useEffect(() => {
    const cached = queryClient.getQueryData<SecurityScanResult>(["guilds", guildId, "moderation", "security-scan"]);
    if (cached) {
      setResult(cached);
      setFindings(cached.findings);
      setScanState("complete");
      fetchRecentMembers(guildId).then(setMembers);
    }
  }, [guildId, queryClient]);

  const handleScanComplete = useCallback(() => {
    setScanState("complete");
  }, []);

  const startScan = useCallback(async () => {
    setScanState("scanning");

    try {
      const [scanResult, recentMembers] = await Promise.all([
        refetch(),
        fetchRecentMembers(guildId),
      ]);

      setMembers(recentMembers);

      if (scanResult.data) {
        setResult(scanResult.data);
        setFindings(scanResult.data.findings);
      }
    } catch {
      const recentMembers = await fetchRecentMembers(guildId);
      setMembers(recentMembers);
    }
  }, [guildId, refetch]);

  const anomalousMembers = members.filter((m) => m.anomalies.length > 0);
  const safeMembers = members.filter((m) => m.anomalies.length === 0);
  const sortedFindings = [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="dashboard-glass-card p-5 sm:p-6">
        {scanState === "idle" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <motion.div
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.03, 1],
                filter: ["drop-shadow(0 0 8px rgba(244,63,94,0.2))", "drop-shadow(0 0 20px rgba(244,63,94,0.4))", "drop-shadow(0 0 8px rgba(244,63,94,0.2))"],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="mb-8"
            >
              <ShieldAlert className="h-32 w-32 text-rose-500/60 dark:text-rose-500/30" />
            </motion.div>
            <h2 className="text-2xl font-black tracking-tight">Security Scan</h2>
            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
              Analyze your server for vulnerabilities, suspicious members, and configuration issues.
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8"
            >
              <Button
                type="button"
                size="lg"
                onClick={startScan}
                className="min-w-[200px] rounded-2xl"
              >
                <Scan className="mr-2 h-5 w-5" />
                Start Scan
              </Button>
            </motion.div>
          </motion.div>
        ) : null}

        {scanState === "scanning" ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4 }}
            className="py-4"
          >
            <SimulatedTerminal lines={SCAN_LINES} onComplete={handleScanComplete} />
          </motion.div>
        ) : null}

        {scanState === "error" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
          >
            Scan failed. Please check your permissions and try again.
          </motion.div>
        ) : null}

        <AnimatePresence>
          {scanState === "complete" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-6"
            >
              {result ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid gap-4 md:grid-cols-[1fr_2fr]"
                  >
                    <ScoreGauge score={result.score} />
                    <SummaryCards summary={result.summary} />
                  </motion.div>

                  {result.topRecommendations.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex flex-wrap gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3"
                    >
                      {result.topRecommendations.map((rec, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs">
                          <span className="font-bold text-amber-500">#{i + 1}</span>
                          <span className="text-muted-foreground">{rec}</span>
                        </span>
                      ))}
                    </motion.div>
                  ) : null}

                  {sortedFindings.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <p className="text-sm font-bold">Findings ({sortedFindings.length})</p>
                      <div className="max-h-[320px] overflow-y-auto rounded-xl border border-black/[0.06] p-1 dark:border-white/[0.06]">
                        <div className="grid gap-2 md:grid-cols-2">
                          {sortedFindings.map((finding) => (
                            <FindingCard key={finding.id} finding={finding} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </>
              ) : null}

              {anomalousMembers.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">Anomalous Members</p>
                    <Badge className="bg-amber-500/10 text-amber-500 shadow-none">
                      {anomalousMembers.length} flagged
                    </Badge>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto rounded-xl border border-black/[0.06] p-1 dark:border-white/[0.06]">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {anomalousMembers.map((member) => (
                        <MemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {safeMembers.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">Recent Members</p>
                    <Badge className="bg-emerald-500/10 text-emerald-500 shadow-none">
                      {safeMembers.length} checked
                    </Badge>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto rounded-xl border border-black/[0.06] p-1 dark:border-white/[0.06]">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {safeMembers.slice(0, 6).map((member) => (
                        <MemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center pt-2"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={startScan}
                  className="rounded-2xl"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Scan Again
                </Button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const SEVERITY_ORDER: Record<SecurityScanSeverity, number> = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
  SUCCESS: 3,
};

export const SecurityScanner = memo(SecurityScannerComponent);
