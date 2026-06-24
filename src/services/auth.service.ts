import { apiClient, endpoints } from "@/api";
import type { AuthSession } from "@/types/auth";
import type { AuthUser } from "@/types/auth";
import type { ApiResponse } from "@/types/api";
import { normalizeAuthSession, normalizeAuthUser } from "@/utils/auth-normalize";

export const authService = {
  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiResponse<AuthUser> | AuthUser>(
      endpoints.auth.me,
    );
    return normalizeAuthUser(
      typeof data === "object" && data !== null && "data" in data
        ? (data as ApiResponse<AuthUser>).data
        : data,
    );
  },

  async getOAuthState(): Promise<string> {
    const { data } = await apiClient.get<{ success: boolean; data: { state: string } }>(
      endpoints.auth.oauthState,
    );
    return data.data.state;
  },

  async logout(): Promise<void> {
    await apiClient.post(endpoints.auth.logout);
  },

  async discordCallback(code: string, state: string): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiResponse<AuthSession> | AuthSession>(
      endpoints.auth.discordCallback,
      { code, state },
    );
    return normalizeAuthSession(data);
  },
};
