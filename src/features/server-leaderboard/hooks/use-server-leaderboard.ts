import { useQuery } from "@tanstack/react-query";
import { fetchServerLeaderboard } from "@/features/server-leaderboard/services/leaderboard.service";

export const serverLeaderboardQueryKey = ["leaderboard", "servers"] as const;

export function useServerLeaderboard() {
  return useQuery({
    queryKey: serverLeaderboardQueryKey,
    queryFn: fetchServerLeaderboard,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
