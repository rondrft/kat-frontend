import { useMutation } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import type { SendMessageRequest, SendMessageResponse } from "../types/message-sender-types";

export function useSendMessage(guildId: string | null) {
  return useMutation<SendMessageResponse, Error, SendMessageRequest>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<ApiResponse<SendMessageResponse>>(
        endpoints.guilds.messageSender(guildId!),
        payload,
      );
      return data.data;
    },
  });
}
