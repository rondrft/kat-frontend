import { useQuery } from "@tanstack/react-query";
import { getSecurityScan } from "@/lib/api/moderation";

export function useSecurityScan(guildId: string) {
  return useQuery({
    queryKey: ["guilds", guildId, "moderation", "security-scan"],
    queryFn: () => getSecurityScan(guildId),
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
