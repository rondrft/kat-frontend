"use client";

import { memo, useState } from "react";
import { ArrowUp, Coins, Crown, Gift, MessageSquare, Sparkles, Ticket } from "lucide-react";
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
import { WorkModal } from "@/features/works/components/work-modal";
import { MessageSenderModal } from "@/features/message-sender/components/message-sender-modal";
import { GiveawayModal } from "@/features/giveaways/components/giveaway-modal";
import { TicketsModal } from "@/features/tickets/components/tickets-modal";
import { usePremiumStatus } from "@/features/guilds/hooks/use-premium-status";
import { useGuildStore } from "@/store/guild-store";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

const PANEL_HEIGHT = "h-[23rem] sm:h-[24rem]";
const BOTTOM_PANEL_HEIGHT = "h-[19rem]";

function OverviewSectionComponent() {
  const t = useTranslation();
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const hasGuild = Boolean(selectedGuildId);
  const [tempVoiceOpen, setTempVoiceOpen] = useState(false);
  const [autoRolesOpen, setAutoRolesOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [boosterRolesOpen, setBoosterRolesOpen] = useState(false);
  const [levelingOpen, setLevelingOpen] = useState(false);
  const [messageSenderOpen, setMessageSenderOpen] = useState(false);
  const [giveawayOpen, setGiveawayOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);

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
                title={t.overview.featureCards.actions.title}
                description={t.overview.featureCards.actions.description}
                icon={Sparkles}
                className="h-full w-[46%] shrink-0"
                badge="configure"
                badgeLabel={t.overview.badges.configure}
                disableHoverMotion
                bgImage="/catbg.jpeg"
                onClick={() => setActionsOpen(true)}
              />
              <OverviewFeatureCard
                title={t.overview.featureCards.boosterRoles.title}
                description={t.overview.featureCards.boosterRoles.description}
                icon={Crown}
                className={cn("h-full min-w-0 flex-1", !isPremium && "pointer-events-none opacity-50")}
                badge="premium"
                badgeLabel={t.overview.badges.premium}
                disableHoverMotion
                onClick={isPremium ? () => setBoosterRolesOpen(true) : undefined}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-[calc(46%_-_0.375rem)]">
            {overviewExtraFeatures.map((feature) => {
              const card = t.overview.featureCards[feature.id];
              return (
                <OverviewFeatureCard
                  key={feature.id}
                  title={card.title}
                  description={card.description}
                  icon={feature.icon}
                  className={cn(
                    "h-full",
                    BOTTOM_PANEL_HEIGHT,
                    feature.id === "tempVoice"
                      ? "sm:w-[46%] sm:shrink-0"
                      : "sm:min-w-0 sm:flex-1",
                  )}
                  badge="configure"
                  badgeLabel={t.overview.badges.configure}
                  disableHoverMotion
                  bgImage={feature.bgImage}
                  onClick={
                    feature.id === "tempVoice"
                      ? () => setTempVoiceOpen(true)
                      : feature.id === "autoRoles"
                        ? () => setAutoRolesOpen(true)
                        : undefined
                  }
                />
              );
            })}
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
            title={t.overview.featureCards.messageSender.title}
            description={t.overview.featureCards.messageSender.description}
            icon={MessageSquare}
            className={cn("h-full w-full sm:min-w-0 sm:flex-1", BOTTOM_PANEL_HEIGHT)}
            badge="configure"
            badgeLabel={t.overview.badges.configure}
            disableHoverMotion
            onClick={() => setMessageSenderOpen(true)}
          />
          <OverviewFeatureCard
            title={t.overview.featureCards.giveaways.title}
            description={t.overview.featureCards.giveaways.description}
            icon={Gift}
            className={cn("h-full w-full sm:min-w-0 sm:flex-1", BOTTOM_PANEL_HEIGHT)}
            badge="configure"
            badgeLabel={t.overview.badges.configure}
            disableHoverMotion
            onClick={() => setGiveawayOpen(true)}
          />
          <OverviewFeatureCard
            title={t.overview.featureCards.leveling.title}
            description={t.overview.featureCards.leveling.description}
            icon={ArrowUp}
            className={cn("h-full w-full sm:min-w-0 sm:flex-1", BOTTOM_PANEL_HEIGHT)}
            badge="configure"
            badgeLabel={t.overview.badges.configure}
            disableHoverMotion
            bgImage="/handbg.jpeg"
            onClick={() => setLevelingOpen(true)}
          />
          <OverviewFeatureCard
            title={t.overview.featureCards.katWorks.title}
            description={t.overview.featureCards.katWorks.description}
            icon={Coins}
            className={cn("h-full w-full sm:min-w-0 sm:flex-1", BOTTOM_PANEL_HEIGHT)}
            badge="configure"
            badgeLabel={t.overview.badges.configure}
            disableHoverMotion
            onClick={() => setWorkOpen(true)}
          />
          <OverviewFeatureCard
            title={t.overview.featureCards.tickets.title}
            description={t.overview.featureCards.tickets.description}
            icon={Ticket}
            className={cn("h-full w-full sm:min-w-0 sm:flex-1", BOTTOM_PANEL_HEIGHT)}
            badge="configure"
            badgeLabel={t.overview.badges.configure}
            disableHoverMotion
            onClick={() => setTicketsOpen(true)}
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
      <WorkModal
        open={workOpen}
        onOpenChange={setWorkOpen}
        guildId={selectedGuildId}
      />

      <TicketsModal
        open={ticketsOpen}
        onOpenChange={setTicketsOpen}
        guildId={selectedGuildId}
      />
    </>
  );
}

export const OverviewSection = memo(OverviewSectionComponent);
