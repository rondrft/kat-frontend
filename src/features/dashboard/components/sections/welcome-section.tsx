"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { AlertCircle, Braces, Crown, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api";
import {
  BoostConfigPanel,
  WelcomeConfigPanel,
} from "@/features/welcome/components/welcome-config-panels";
import {
  useSaveWelcomeConfig,
  useUploadBackground,
  useWelcomeConfig,
} from "@/features/welcome/hooks/use-welcome-config";
import { useGuilds } from "@/features/guilds/hooks/use-guilds";
import { usePremiumStatus } from "@/features/guilds/hooks/use-premium-status";
import { DEFAULT_WELCOME_CONFIG, toWelcomePayload } from "@/lib/api/welcome";
import { cn } from "@/lib/utils";
import { useGuildStore } from "@/store/guild-store";
import type { WelcomeConfig } from "@/types/welcome";

type ActivePanel = "welcome" | "boost" | "variables";

function resolveBackendAssetUrl(url: string) {
  if (!url || url.startsWith("http://") || url.startsWith("https://")) return url;
  try {
    return new URL(url, apiConfig.baseURL).toString();
  } catch {
    return url;
  }
}

type WelcomeSectionProps = {
  guildId?: string;
};

function WelcomeSectionComponent({ guildId: guildIdProp }: WelcomeSectionProps) {
  const t = useTranslation();
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const guildId = guildIdProp ?? selectedGuildId;

  const TEMPLATE_VARIABLES = [
    { token: "{user}", description: t.welcome.variables.user },
    { token: "{userMention}", description: t.welcome.variables.userMention },
    { token: "{server}", description: t.welcome.variables.server },
    { token: "{count}", description: t.welcome.variables.count },
    { token: "{boostCount}", description: t.welcome.variables.boostCount },
  ];

  const sampleUser = {
    username: t.welcome.sampleUsername,
    avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
    memberCount: 1284,
    boostCount: 2,
  };

  const PANEL_OPTIONS: {
    id: ActivePanel;
    label: string;
    description: string;
    icon: typeof PartyPopper;
  }[] = [
    {
      id: "welcome",
      label: t.welcome.tabs.welcome.label,
      description: t.welcome.tabs.welcome.description,
      icon: PartyPopper,
    },
    {
      id: "boost",
      label: t.welcome.tabs.booster.label,
      description: t.welcome.tabs.booster.description,
      icon: Sparkles,
    },
    {
      id: "variables",
      label: t.welcome.variablesPanel.sectionLabel,
      description: t.welcome.variablesPanel.heading,
      icon: Braces,
    },
  ];
  const { data: guilds = [] } = useGuilds();
  const selectedGuild = guilds.find((guild) => guild.id === guildId);
  const serverName = selectedGuild?.name ?? t.welcome.fallbackServerName;

  const { data: premiumData } = usePremiumStatus(guildId);
  const isPremium = premiumData?.isPremium ?? false;

  const welcomeQuery = useWelcomeConfig(guildId);
  const saveMutation = useSaveWelcomeConfig(guildId);
  const uploadMutation = useUploadBackground(guildId);
  const [draft, setDraft] = useState<WelcomeConfig | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>("welcome");
  const [localBackgroundPreview, setLocalBackgroundPreview] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!welcomeQuery.data) return;
    setDraft(welcomeQuery.data);
  }, [welcomeQuery.data]);

  useEffect(() => {
    return () => {
      if (localBackgroundPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localBackgroundPreview);
      }
    };
  }, [localBackgroundPreview]);

  const config = useMemo(
    () =>
      draft ??
      welcomeQuery.data ?? { ...DEFAULT_WELCOME_CONFIG, guildId: guildId ?? "" },
    [draft, guildId, welcomeQuery.data],
  );

  const updateDraft = (patch: Partial<WelcomeConfig>) => {
    setDraft((current) => ({
      ...(current ?? config),
      ...patch,
    }));
  };

  const handleSave = () => {
    if (!guildId) return;
    saveMutation.mutate(toWelcomePayload(config));
  };

  const handleUploadBackground = (file: File) => {
    if (!guildId) return;

    if (localBackgroundPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localBackgroundPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalBackgroundPreview(objectUrl);
    updateDraft({ imageBackgroundMode: "IMAGE" });

    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        if (!result.url) return;
        const savedUrl = resolveBackendAssetUrl(result.url);
        const nextConfig: WelcomeConfig = {
          ...config,
          imageBackgroundMode: "IMAGE",
          imageBackgroundUrl: savedUrl,
        };

        setDraft(nextConfig);
        saveMutation.mutate(toWelcomePayload(nextConfig));
      },
    });
  };

  if (!guildId) {
    return (
      <div className="dashboard-glass-card flex min-h-[320px] items-center justify-center p-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">{t.welcome.noGuild.heading}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.welcome.noGuild.description}
          </p>
        </div>
      </div>
    );
  }

  if (welcomeQuery.isLoading && !draft) {
    return (
      <div className="dashboard-glass-card flex min-h-[320px] items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.welcome.loading}
      </div>
    );
  }

  if (welcomeQuery.isError && !draft) {
    return (
      <div className="dashboard-glass-card flex min-h-[320px] items-center justify-center p-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-3 text-sm font-medium">{t.welcome.error.heading}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.welcome.error.description}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void welcomeQuery.refetch()}
          >
            {t.welcome.error.retry}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 space-y-4">
      <div className="flex flex-col gap-2 rounded-2xl bg-white/35 p-1.5 backdrop-blur-sm dark:bg-white/[0.04] sm:flex-row">
        {PANEL_OPTIONS.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActivePanel(id)}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              activePanel === id
                ? "bg-white text-foreground shadow-sm dark:bg-white/[0.08]"
                : "text-muted-foreground hover:bg-white/45 dark:hover:bg-white/[0.06]",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                activePanel === id ? "bg-kat/10 text-kat" : "bg-black/[0.04]",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block truncate text-xs opacity-75">{description}</span>
            </span>
          </button>
        ))}
      </div>

      {activePanel === "welcome" ? (
        <WelcomeConfigPanel
          config={config}
          serverName={serverName}
          sampleUser={sampleUser}
          backgroundPreviewUrl={localBackgroundPreview}
          isSaving={saveMutation.isPending}
          isSaved={saveMutation.isSuccess}
          isUploading={uploadMutation.isPending}
          onChange={updateDraft}
          onSave={handleSave}
          onUploadBackground={handleUploadBackground}
        />
      ) : null}

      {activePanel === "boost" ? (
        <div className="relative">
          {!isPremium ? (
            <span className="pointer-events-none absolute right-0 top-0 z-10 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">
              <Crown className="h-3 w-3" />
              {t.welcome.premium}
            </span>
          ) : null}
          <div className={!isPremium ? "pointer-events-none opacity-50" : undefined}>
            <BoostConfigPanel
              config={config}
              serverName={serverName}
              sampleUser={sampleUser}
              backgroundPreviewUrl={localBackgroundPreview}
              isSaving={saveMutation.isPending}
              isSaved={saveMutation.isSuccess}
              isUploading={uploadMutation.isPending}
              onChange={updateDraft}
              onSave={handleSave}
              onUploadBackground={handleUploadBackground}
            />
          </div>
        </div>
      ) : null}

      {activePanel === "variables" ? (
        <section className="dashboard-glass-card p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-kat">
                {t.welcome.variablesPanel.sectionLabel}
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">{t.welcome.variablesPanel.heading}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.welcome.variablesPanel.description}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {TEMPLATE_VARIABLES.map((variable) => (
              <div
                key={variable.token}
                className="rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]"
              >
                <code className="text-sm font-semibold text-kat">{variable.token}</code>
                <p className="mt-1 text-xs text-muted-foreground">
                  {variable.description}
                </p>
              </div>
            ))}
          </div>

          {saveMutation.isError || uploadMutation.isError ? (
            <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t.welcome.saveError}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export const WelcomeSection = memo(WelcomeSectionComponent);
