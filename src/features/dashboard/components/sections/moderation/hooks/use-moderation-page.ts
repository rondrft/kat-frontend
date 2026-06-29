"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { guildService } from "@/services/guild.service";
import {
  useModerationConfig,
  useSaveModerationConfig,
} from "@/features/moderation/hooks/use-moderation-config";
import { useModPermissions, useSaveModPermissions } from "@/features/moderation/hooks/use-mod-permissions";
import { usePurgeConfig, useSavePurgeConfig } from "@/features/moderation/hooks/use-purge-config";
import { useNukeConfig, useSaveNukeConfig } from "@/features/moderation/hooks/use-nuke-config";
import { useWhitelist, useRemoveWhitelist } from "@/features/moderation/hooks/use-whitelist";
import { useFilters, useAddFilter, useDeleteFilter } from "@/features/moderation/hooks/use-filters";
import { useAutoPunishments } from "@/features/moderation/hooks/use-auto-punishments";
import { useLogChannel, useSaveLogChannel } from "@/features/moderation/hooks/use-log-channel";
import { usePremiumStatus } from "@/features/guilds/hooks/use-premium-status";
import type { ModPermissions, ModerationRuleConfig, NukeConfig, PurgeConfig } from "@/types/moderation";
import { RULE_PREMIUM } from "@/types/moderation";
import {
  applyModerationConfigToRules,
  BACKEND_RULE_IDS,
  INITIAL_RULES,
  toApiAction,
  usesTimeout,
  type ModerationRule,
  type ModerationTab,
  type RuleId,
} from "../types";

export function useModerationPage(guildId: string | null | undefined) {
  const id = guildId ?? null;

  const { data: moderationConfig, isLoading, isError, refetch } = useModerationConfig(id);
  const saveMutation = useSaveModerationConfig(id);

  const { data: permissionsData, isLoading: permissionsLoading } = useModPermissions(id);
  const savePermissions = useSaveModPermissions(id);

  const { data: purgeData, isLoading: purgeLoading } = usePurgeConfig(id);
  const savePurge = useSavePurgeConfig(id);

  const { data: nukeData } = useNukeConfig(id);
  const saveNuke = useSaveNukeConfig(id);

  const { data: whitelistData, isLoading: whitelistLoading } = useWhitelist(id);
  const removeWhitelistEntry = useRemoveWhitelist(id);

  const { data: filtersData, isLoading: filtersLoading } = useFilters(id);
  const addFilterMut = useAddFilter(id);
  const deleteFilterMut = useDeleteFilter(id);

  const { data: autoPunishData, isLoading: autoPunishLoading } = useAutoPunishments(id);

  const { data: logChannelData, isLoading: logChannelLoading } = useLogChannel(id);
  const saveLogChannelMut = useSaveLogChannel(id);

  const premiumQuery = usePremiumStatus(id);
  const isPremium = premiumQuery.data?.isPremium ?? false;

  const { data: guildRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["guilds", id, "roles"],
    queryFn: () => guildService.getGuildRoles(id!),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  const [rules, setRules] = useState(INITIAL_RULES);
  const [selectedRuleId, setSelectedRuleId] = useState<RuleId | null>(null);
  const [strictness, setStrictness] = useState(50);
  const [muteMinutes, setMuteMinutes] = useState(10);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<ModerationTab>("free");
  const [rulePage, setRulePage] = useState(0);
  const [permissions, setPermissions] = useState<ModPermissions | null>(null);
  const [purgeConfig, setPurgeConfig] = useState<PurgeConfig | null>(null);
  const [nukeConfig, setNukeConfig] = useState<NukeConfig | null>(null);
  const [whitelistOpen, setWhitelistOpen] = useState(false);
  const [newFilterPattern, setNewFilterPattern] = useState("");
  const [logChannelId, setLogChannelId] = useState<string | null>(null);
  const [premiumLogChannelId, setPremiumLogChannelId] = useState<string | null>(null);

  useEffect(() => {
    if (!moderationConfig) return;
    setStrictness(moderationConfig.strictness);
    setMuteMinutes(moderationConfig.defaultTimeoutMinutes);
    setRules((current) => applyModerationConfigToRules(current, moderationConfig));
    setSaved(true);
  }, [moderationConfig]);

  useEffect(() => { if (permissionsData) setPermissions(permissionsData); }, [permissionsData]);
  useEffect(() => { if (purgeData) setPurgeConfig(purgeData); }, [purgeData]);
  useEffect(() => { if (nukeData) setNukeConfig(nukeData); }, [nukeData]);

  useEffect(() => {
    if (logChannelData) {
      setLogChannelId(logChannelData.logChannelId ?? null);
      setPremiumLogChannelId(logChannelData.premiumLogChannelId ?? null);
    }
  }, [logChannelData]);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? null;

  const enabledCount = useMemo(
    () => rules.filter((rule) => rule.enabled).length,
    [rules],
  );
  const premiumCount = useMemo(
    () => rules.filter((rule) => RULE_PREMIUM[rule.apiType]).length,
    [rules],
  );

  const RULES_PER_PAGE = 9;
  const freeRules = rules.filter((r) => !RULE_PREMIUM[r.apiType]);
  const premiumRules = rules.filter((r) => RULE_PREMIUM[r.apiType]);
  const currentRules = tab === "free" ? freeRules : premiumRules;
  const totalPages = Math.max(1, Math.ceil(currentRules.length / RULES_PER_PAGE));
  const safePage = Math.min(rulePage, totalPages - 1);
  const paginatedRules = currentRules.slice(safePage * RULES_PER_PAGE, (safePage + 1) * RULES_PER_PAGE);

  const updateRule = useCallback((id: RuleId, patch: Partial<ModerationRule>) => {
    setSaved(false);
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    );
  }, []);

  const handleStrictnessChange = useCallback((value: number) => {
    setSaved(false);
    setStrictness(value);
  }, []);

  const handleMuteMinutesChange = useCallback((value: number) => {
    setSaved(false);
    setMuteMinutes(value);
  }, []);

  const saveDraft = useCallback(() => {
    if (!id) return;
    const payload = {
      enabled: rules.some((rule) => rule.enabled),
      strictness,
      defaultTimeoutMinutes: muteMinutes,
      rules: rules
        .map((rule) => {
          const apiId = BACKEND_RULE_IDS[rule.id];
          if (!apiId) return null;
          return {
            id: apiId,
            enabled: rule.enabled,
            action: toApiAction(rule.mode),
            threshold: rule.threshold,
            timeoutMinutes: usesTimeout(rule.mode) ? rule.timeoutMinutes : null,
          };
        })
        .filter((rule): rule is ModerationRuleConfig => rule !== null),
    };
    saveMutation.mutate(payload, {
      onSuccess: (config) => {
        setStrictness(config.strictness);
        setMuteMinutes(config.defaultTimeoutMinutes);
        setRules((current) => applyModerationConfigToRules(current, config));
        setSaved(true);
      },
      onError: () => setSaved(false),
    });
  }, [id, rules, strictness, muteMinutes, saveMutation]);

  const addFilter = useCallback(() => {
    if (!id || !newFilterPattern.trim()) return;
    addFilterMut.mutate(
      { pattern: newFilterPattern.trim(), enabled: true },
      { onSuccess: () => setNewFilterPattern("") },
    );
  }, [id, newFilterPattern, addFilterMut]);

  const saveLogChannels = useCallback(() => {
    saveLogChannelMut.mutate({ logChannelId, premiumLogChannelId });
  }, [saveLogChannelMut, logChannelId, premiumLogChannelId]);

  const savePermissionsAndNuke = useCallback(() => {
    if (!permissions) return;
    savePermissions.mutate(permissions, {
      onSuccess: () => { if (nukeConfig) saveNuke.mutate(nukeConfig); },
    });
  }, [permissions, nukeConfig, savePermissions, saveNuke]);

  return {
    isLoading,
    isError,
    refetch,
    saveMutation,
    savePermissions,
    savePurge,
    saveNuke,
    saveLogChannelMut,
    removeWhitelistEntry,
    addFilterMut,
    deleteFilterMut,
    rules,
    strictness,
    muteMinutes,
    saved,
    tab,
    setTab,
    rulePage,
    setRulePage,
    permissions,
    setPermissions,
    purgeConfig,
    setPurgeConfig,
    nukeConfig,
    setNukeConfig,
    whitelistOpen,
    setWhitelistOpen,
    newFilterPattern,
    setNewFilterPattern,
    logChannelId,
    setLogChannelId,
    premiumLogChannelId,
    setPremiumLogChannelId,
    selectedRuleId,
    setSelectedRuleId,
    selectedRule,
    enabledCount,
    premiumCount,
    freeRules,
    premiumRules,
    paginatedRules,
    totalPages,
    safePage,
    isPremium,
    whitelistData,
    whitelistLoading,
    filtersData,
    filtersLoading,
    autoPunishData,
    autoPunishLoading,
    logChannelLoading,
    permissionsLoading,
    purgeLoading,
    rolesLoading,
    guildRoles,
    updateRule,
    handleStrictnessChange,
    handleMuteMinutesChange,
    saveDraft,
    addFilter,
    saveLogChannels,
    savePermissionsAndNuke,
  };
}
