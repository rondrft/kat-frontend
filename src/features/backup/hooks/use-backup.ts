"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guildService } from "@/services/guild.service";

export const backupQueryKey = (guildId: string | null) =>
  ["guilds", guildId, "backups"] as const;

export function useGuildBackups(guildId: string | null, enabled = true) {
  return useQuery({
    queryKey: backupQueryKey(guildId),
    queryFn: () => guildService.listBackups(guildId!),
    enabled: enabled && !!guildId,
    staleTime: 30_000,
  });
}

export function useCreateBackup(guildId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => guildService.createBackup(guildId!, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: backupQueryKey(guildId) }),
  });
}

export function useRestoreBackup(guildId: string | null) {
  return useMutation({
    mutationFn: (id: string) => guildService.restoreBackup(guildId!, id),
  });
}

export function useDeleteBackup(guildId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guildService.deleteBackup(guildId!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: backupQueryKey(guildId) }),
  });
}
