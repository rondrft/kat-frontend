"use client";

import { memo, useState } from "react";
import { ArrowUp, Crown, Gift, MessageSquare, Sparkles } from "lucide-react";
import { ActionsModal } from "@/features/actions/components/actions-modal";
import { overviewExtraFeatures } from "@/features/dashboard/config/overview-extra-features";
import { MonthlyJoinsChart } from "@/features/dashboard/components/widgets/monthly-joins-chart";
import { NewMembersWidget } from "@/features/dashboard/components/widgets/new-members-widget";
import { OverviewFeatureCard } from "@/features/dashboard/components/widgets/overview-feature-card";
import { MemberAlertsWidget } from "@/features/dashboard/components/widgets/member-alerts-widget";
import { useMemberJoinStats } from "@/features/dashboard/hooks/use-member-join-stats";
import {
  useMemberAlerts,
  useNewMembers,
} from "@/features/dashboard/hooks/use-new-members";
import { TempVoiceChannelModal } from "@/features/voice/components/temp-voice-channel-modal";
import { AutoRolesModal } from "@/features/auto-roles/components/auto-roles-modal";
import { BoosterRoleModal } from "@/features/boosters/components/booster-role-modal";
import { LevelingModal } from "@/features/leveling/components/leveling-modal";
import { MessageSenderModal } from "@/features/message-sender/components/message-sender-modal";
import { GiveawayModal } from "@/features/giveaways/components/giveaway-modal";
import { usePremiumStatus } from "@/features/guilds/hooks/use-premium-status";
import { useGuildStore } from "@/store/guild-store";
import { cn } from "@/lib/utils";

const PANEL_HEIGHT = "h-[23rem] sm:h-[24rem]";
const BOTTOM_PANEL_HEIGHT = "h-[19rem]";

function OverviewSectionComponent() {
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const hasGuild = Boolean(selectedGuildId);
  const [tempVoiceOpen, setTempVoiceOpen] = useState(false);
  const [autoRolesOpen, setAutoRolesOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [boosterRolesOpen, setBoosterRolesOpen] = useState(false);
  const [levelingOpen, setLevelingOpen] = useState(false);
  const [messageSenderOpen, setMessageSenderOpen] = useState(false);
  const [giveawayOpen, setGiveawayOpen] = useState(false);

  const { data: premiumData } = usePremiumStatus(selectedGuildId);
  const isPremium = premiumData?.isPremium ?? false;

  const {
    data: joinStats,
    isPending: statsPending,
    isError: statsError,
  } = useMemberJoinStats(selectedGuildId);

  const { data: members = [], isPending: membersPending } =
    useNewMembers(selectedGuildId);
  const { data: alerts = [], isPending: alertsPending } =
    useMemberAlerts(selectedGuildId);

  const showMembersLoading = hasGuild && membersPending && members.length === 0;
  const showStatsLoading = hasGuild && statsPending && !joinStats;
  const showAlertsLoading = hasGuild && alertsPending && alerts.length === 0;

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <MonthlyJoinsChart
            stats={joinStats}
            isPending={showStatsLoading}
            isError={statsError}
            hasGuild={hasGuild}
            className="w-full lg:w-[calc(54%_-_0.375rem)]"
          />

          <div
            className={cn(
              "flex w-full shrink-0 flex-col gap-3 lg:w-[calc(46%_-_0.375rem)]",
              PANEL_HEIGHT,
            )}
          >
            <NewMembersWidget
              members={members}
              isLoading={showMembersLoading}
              className="shrink-0"
            />

            <div className="flex min-h-0 flex-1 gap-3">
              <OverviewFeatureCard
                title="Actions"
                description="Interactive action commands with GIFs (kiss, hug, pat, slap, cuddle, punch, bite, feed)"
                icon={Sparkles}
                className="h-full w-[46%] shrink-0"
                badge="configure"
                disableHoverMotion
                onClick={() => setActionsOpen(true)}
              />
              <OverviewFeatureCard
                title="Booster Roles"
                description="Custom premium roles for 2x server boosters."
                icon={Crown}
                className={cn("h-full min-w-0 flex-1", !isPremium && "pointer-events-none opacity-50")}
                badge="premium"
                disableHoverMotion
                onClick={isPremium ? () => setBoosterRolesOpen(true) : undefined}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-[calc(46%_-_0.375rem)]">
            {overviewExtraFeatures.map((feature) => (
              <OverviewFeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                className={cn(
                  "h-full",
                  BOTTOM_PANEL_HEIGHT,
                  feature.id === "temp-voice"
                    ? "sm:w-[46%] sm:shrink-0"
                    : "sm:min-w-0 sm:flex-1",
                )}
                badge="configure"
                disableHoverMotion
                onClick={
                  feature.id === "temp-voice"
                    ? () => setTempVoiceOpen(true)
                    : feature.id === "auto-roles"
                      ? () => setAutoRolesOpen(true)
                      : feature.id === "leveling"
                        ? () => setLevelingOpen(true)
                        : undefined
                }
              />
            ))}
          </div>

          <div className="w-full lg:w-[calc(54%_-_0.375rem)]">
            <MemberAlertsWidget
              members={alerts}
              isLoading={showAlertsLoading}
              className={cn("h-full", BOTTOM_PANEL_HEIGHT)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <OverviewFeatureCard
            title="Message Sender"
            description="Send plain messages or rich embeds to any text channel."
            icon={MessageSquare}
            className={cn("h-full w-full sm:min-w-0 sm:flex-1", BOTTOM_PANEL_HEIGHT)}
            badge="configure"
            disableHoverMotion
            onClick={() => setMessageSenderOpen(true)}
          />
          <OverviewFeatureCard
            title="Giveaways"
            description="Run reaction giveaways and spin the wheel to pick winners."
            icon={Gift}
            className={cn("h-full w-full sm:min-w-0 sm:flex-1", BOTTOM_PANEL_HEIGHT)}
            badge="configure"
            disableHoverMotion
            onClick={() => setGiveawayOpen(true)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <OverviewFeatureCard
            title="Leveling"
            description="Members earn XP, level up, and compete on the leaderboard."
            icon={ArrowUp}
            className={cn("h-full w-full", BOTTOM_PANEL_HEIGHT)}
            badge="configure"
            disableHoverMotion
            onClick={() => setLevelingOpen(true)}
          />
        </div>
      </div>

      <TempVoiceChannelModal
        open={tempVoiceOpen}
        onOpenChange={setTempVoiceOpen}
        guildId={selectedGuildId}
      />

      <AutoRolesModal
        open={autoRolesOpen}
        onOpenChange={setAutoRolesOpen}
        guildId={selectedGuildId}
      />

      <ActionsModal
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        guildId={selectedGuildId}
      />

      <BoosterRoleModal
        open={boosterRolesOpen}
        onOpenChange={setBoosterRolesOpen}
        guildId={selectedGuildId}
      />

      <LevelingModal
        open={levelingOpen}
        onOpenChange={setLevelingOpen}
        guildId={selectedGuildId}
      />

      <MessageSenderModal
        open={messageSenderOpen}
        onOpenChange={setMessageSenderOpen}
        guildId={selectedGuildId}
      />

      <GiveawayModal
        open={giveawayOpen}
        onOpenChange={setGiveawayOpen}
        guildId={selectedGuildId}
      />
    </>
  );
}

export const OverviewSection = memo(OverviewSectionComponent);
