"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Loader2, PartyPopper, RotateCcw, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { isSafeImageUrl } from "@/lib/url";
import { useGuildTextChannels } from "@/features/auto-roles/hooks/use-guild-text-channels";
import {
  useCreateGiveaway,
  useGiveaway,
  useGiveawayParticipants,
  useRollGiveaway,
} from "@/features/giveaways/hooks/use-giveaway";
import { GiveawayWheel } from "./giveaway-wheel";
import type { DurationUnit, GiveawayParticipant } from "@/features/giveaways/types/giveaway";
import { AppError } from "@/lib/errors";

const DURATION_UNITS: { value: DurationUnit; label: string }[] = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

const MAX_WINNERS = 10;

function toMinutes(value: number, unit: DurationUnit): number {
  if (unit === "days") return value * 24 * 60;
  if (unit === "hours") return value * 60;
  return value;
}

function formatDuration(value: number, unit: DurationUnit): string {
  if (value <= 0) return "now";
  const label = value === 1 ? unit.slice(0, -1) : unit;
  return `${value} ${label}`;
}

type GiveawayModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

export function GiveawayModal({ open, onOpenChange, guildId }: GiveawayModalProps) {
  const [prize, setPrize] = useState("");
  const [channelId, setChannelId] = useState("");
  const [durationValue, setDurationValue] = useState<number | "">("");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("minutes");
  const [winnerCount, setWinnerCount] = useState(1);
  const [boosterOnly, setBoosterOnly] = useState(false);

  const [giveawayId, setGiveawayId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"setup" | "wheel" | "active" | "result">("setup");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [wheelWinner, setWheelWinner] = useState<GiveawayParticipant | null>(null);
  const [spinning, setSpinning] = useState(false);

  const createGiveaway = useCreateGiveaway(guildId);
  const rollGiveaway = useRollGiveaway(guildId);

  const { data: channels = [], isLoading: channelsLoading } = useGuildTextChannels(guildId, open);
  const { data: giveaway } = useGiveaway(guildId, giveawayId);
  const { data: participants = [] } = useGiveawayParticipants(
    guildId,
    giveawayId,
    giveaway?.ended ?? false,
  );

  const channelOptions = useMemo(() => {
    const list = channels.map((c) => ({ id: c.id, name: c.name }));
    if (channelId && !list.some((c) => c.id === channelId)) {
      list.unshift({ id: channelId, name: "selected-channel" });
    }
    return list;
  }, [channels, channelId]);

  useEffect(() => {
    if (open) return;
    resetForm();
  }, [open]);

  useEffect(() => {
    if (giveaway?.ended && phase !== "result") {
      setPhase("result");
    }
  }, [giveaway, phase]);

  const resetForm = () => {
    setPrize("");
    setChannelId("");
    setDurationValue("");
    setDurationUnit("minutes");
    setWinnerCount(1);
    setBoosterOnly(false);
    setGiveawayId(null);
    setPhase("setup");
    setStatus(null);
    setWheelWinner(null);
    setSpinning(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const isNow = durationValue === "" || Number(durationValue) <= 0;
  const durationMinutes = isNow ? 0 : toMinutes(Number(durationValue), durationUnit);
  const isValid = Boolean(channelId) && prize.trim().length > 0;

  const handleStart = async () => {
    if (!guildId || !channelId || !isValid) return;

    setStatus(null);
    setWheelWinner(null);

    try {
      const response = await createGiveaway.mutateAsync({
        prize: prize.trim(),
        channelId,
        durationMinutes,
        winnerCount,
        boosterOnly,
        startImmediately: isNow,
      });

      setGiveawayId(response.id);

      if (isNow) {
        setPhase("wheel");
        handleSpin(response.id);
      } else {
        setPhase("active");
        setStatus({ type: "success", text: `Giveaway started in the selected channel. It will end in ${formatDuration(Number(durationValue), durationUnit)}.` });
      }
    } catch (error) {
      const text = error instanceof AppError ? error.message : "Could not start the giveaway.";
      setStatus({ type: "error", text });
    }
  };

  const handleSpin = async (targetGiveawayId: string) => {
    if (!guildId || !targetGiveawayId) return;

    setSpinning(true);
    setWheelWinner(null);

    try {
      const response = await rollGiveaway.mutateAsync(targetGiveawayId);
      const winner = response.winners[0] ?? null;
      setWheelWinner(winner);
      setTimeout(() => {
        setSpinning(false);
        setPhase("result");
      }, 3500);
    } catch (error) {
      setSpinning(false);
      const text = error instanceof AppError ? error.message : "Could not roll the giveaway.";
      setStatus({ type: "error", text });
    }
  };

  const handleRollNow = () => {
    if (giveawayId) handleSpin(giveawayId);
  };

  const handleReset = () => {
    resetForm();
  };

  const noGuild = !guildId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-kat/10 dark:border-white/10">
            <Gift className="h-5 w-5 text-kat" />
          </div>
          <DialogTitle>Giveaways</DialogTitle>
          <DialogDescription>
            Run a reaction giveaway and spin the wheel to pick winners.
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">Select a server in the header first.</p>
        ) : phase === "setup" ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="giveaway-prize">Prize</Label>
              <Input
                id="giveaway-prize"
                placeholder="e.g. Nitro Classic"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                disabled={createGiveaway.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="giveaway-channel">Text channel</Label>
              <div className="relative">
                <select
                  id="giveaway-channel"
                  disabled={channelsLoading || createGiveaway.isPending}
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    (channelsLoading || createGiveaway.isPending) && "opacity-60",
                  )}
                >
                  <option value="">Select a channel…</option>
                  {channelOptions.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      #{channel.name}
                    </option>
                  ))}
                </select>
                {channelsLoading ? (
                  <Loader2 className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Now"
                  value={durationValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setDurationValue("");
                      return;
                    }
                    const parsed = parseInt(value, 10);
                    setDurationValue(Number.isFinite(parsed) && parsed >= 0 ? parsed : "");
                  }}
                  disabled={createGiveaway.isPending}
                  className="w-28"
                />
                <select
                  value={durationUnit}
                  disabled={createGiveaway.isPending || isNow}
                  onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                  className={cn(
                    "flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    (createGiveaway.isPending || isNow) && "opacity-60",
                  )}
                >
                  {DURATION_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty or set to 0 to roll immediately.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="giveaway-winners">Winners</Label>
              <Input
                id="giveaway-winners"
                type="number"
                min={1}
                max={MAX_WINNERS}
                value={winnerCount}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10);
                  setWinnerCount(Number.isFinite(parsed) ? Math.max(1, Math.min(MAX_WINNERS, parsed)) : 1);
                }}
                disabled={createGiveaway.isPending}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="text-sm font-medium">Server boosters only</p>
                <p className="text-xs text-muted-foreground">
                  Only members with the Discord booster role can participate
                </p>
              </div>
              <Switch
                checked={boosterOnly}
                disabled={createGiveaway.isPending}
                onCheckedChange={setBoosterOnly}
              />
            </div>

            {status ? (
              <p
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  status.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                {status.text}
              </p>
            ) : null}
          </div>
        ) : phase === "wheel" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Spinning the wheel</p>
                <p className="text-xs text-muted-foreground">
                  {participants.length} participant{participants.length !== 1 ? "s" : ""} joined
                </p>
              </div>
              {participants.length > 0 ? (
                <span className="flex items-center gap-1.5 text-xs text-kat">
                  <Sparkles className="h-3.5 w-3.5" />
                  Rolling…
                </span>
              ) : null}
            </div>
            <GiveawayWheel
              participants={participants}
              winner={wheelWinner}
              spinning={spinning}
            />
            {status?.type === "error" ? (
              <p className="text-xs text-destructive">{status.text}</p>
            ) : null}
          </div>
        ) : phase === "active" ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-kat/20 bg-kat/5 p-4 dark:border-kat/30 dark:bg-kat/10">
              <div className="flex items-start gap-3">
                <PartyPopper className="mt-0.5 h-5 w-5 text-kat" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Giveaway is live</p>
                  <p className="text-xs text-muted-foreground">
                    Members can react with 🎉 on the Discord message to enter. Come back here to roll
                    the wheel whenever you want.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prize</span>
                <span className="font-medium text-foreground">{prize}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Winners</span>
                <span className="font-medium text-foreground">{winnerCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Participants</span>
                <span className="font-medium text-foreground">{participants.length}</span>
              </div>
            </div>

            <GiveawayWheel
              participants={participants}
              winner={null}
              spinning={false}
              className="opacity-70"
            />

            {status ? (
              <p
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  status.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                {status.text}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Giveaway finished</p>
              <p className="text-xs text-muted-foreground">
                {participants.length} participant{participants.length !== 1 ? "s" : ""} · {giveaway?.winnerCount ?? winnerCount} winner
                {(giveaway?.winnerCount ?? winnerCount) > 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {wheelWinner ? (
                <div className="flex flex-col items-center rounded-2xl border border-kat/30 bg-kat/10 p-5">
                  <div
                    className="h-20 w-20 rounded-full bg-cover bg-center ring-4 ring-kat/30"
                    style={{
                      backgroundImage: isSafeImageUrl(wheelWinner.avatarUrl)
                        ? `url(${wheelWinner.avatarUrl})`
                        : undefined,
                    }}
                  />
                  <p className="mt-3 text-lg font-bold text-foreground">Winner</p>
                  <p className="text-sm text-kat">@{wheelWinner.username}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] px-6 py-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No participants joined.</p>
                </div>
              )}
            </div>

            {status?.type === "error" ? (
              <p className="text-xs text-destructive">{status.text}</p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          {phase === "setup" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createGiveaway.isPending}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleStart}
                disabled={!isValid || createGiveaway.isPending}
              >
                {createGiveaway.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting…
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Start Giveaway
                  </>
                )}
              </Button>
            </>
          ) : phase === "active" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={rollGiveaway.isPending}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleRollNow}
                disabled={rollGiveaway.isPending}
              >
                {rollGiveaway.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rolling…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Roll Now
                  </>
                )}
              </Button>
            </>
          ) : phase === "wheel" ? (
            <Button type="button" variant="outline" onClick={handleClose} disabled={spinning}>
              Close
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button type="button" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                New Giveaway
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
