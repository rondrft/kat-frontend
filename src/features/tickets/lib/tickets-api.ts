import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import type {
  TicketConfig,
  TicketConfigFormValues,
  TicketSaveRequest,
} from "@/features/tickets/types/ticket-config";
import type { TicketConfigSchemaType } from "@/features/tickets/schemas/ticket-config-schema";

function unwrapApiData<T>(data: ApiResponse<T> | T): T {
  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
}

function normalizeConfig(raw: unknown): TicketConfig {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    guildId: String(row.guildId ?? ""),
    enabled: Boolean(row.enabled),
    panelChannelId: row.panelChannelId ? String(row.panelChannelId) : null,
    panelMessageId: row.panelMessageId ? String(row.panelMessageId) : null,
    categoryId: row.categoryId ? String(row.categoryId) : null,
    buttonLabel: String(row.buttonLabel ?? "Create Ticket"),
    buttonStyle: (row.buttonStyle as TicketConfig["buttonStyle"]) ?? "PRIMARY",
    embedTitle: String(row.embedTitle ?? "Support Tickets"),
    embedDescription: String(
      row.embedDescription ??
        "Click the button below to create a support ticket.",
    ),
    embedColor: String(row.embedColor ?? "#5865F2"),
    transcriptEnabled: Boolean(row.transcriptEnabled),
    allowUserToClose: Boolean(row.allowUserToClose ?? true),
    maxOpenTicketsPerUser: Number(row.maxOpenTicketsPerUser ?? 1),
    ticketChannelNameTemplate: String(row.ticketChannelNameTemplate ?? "ticket-{username}"),
    welcomeMessage: row.welcomeMessage ? String(row.welcomeMessage) : null,
    supportRoleIds: Array.isArray(row.supportRoleIds)
      ? row.supportRoleIds.map(String)
      : [],
  };
}

export async function getTicketConfig(guildId: string): Promise<TicketConfig | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<unknown> | unknown>(
      endpoints.guilds.tickets(guildId),
    );
    return normalizeConfig(unwrapApiData(data));
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveTicketConfig(
  guildId: string,
  values: TicketConfigFormValues | TicketConfigSchemaType,
): Promise<TicketConfig> {
  const payload: TicketSaveRequest = {
    enabled: values.enabled,
    panelChannelId: values.panelChannelId || null,
    categoryId: values.categoryId || null,
    buttonLabel: values.buttonLabel,
    buttonStyle: values.buttonStyle,
    embedTitle: values.embedTitle,
    embedDescription: values.embedDescription,
    embedColor: values.embedColor,
    transcriptEnabled: values.transcriptEnabled,
    allowUserToClose: values.allowUserToClose,
    maxOpenTicketsPerUser: values.maxOpenTicketsPerUser,
    ticketChannelNameTemplate: values.ticketChannelNameTemplate,
    welcomeMessage: values.welcomeMessage || null,
    supportRoleIds: values.supportRoleIds,
  };

  const { data } = await apiClient.put<ApiResponse<unknown> | unknown>(
    endpoints.guilds.tickets(guildId),
    payload,
  );
  return normalizeConfig(unwrapApiData(data));
}

export async function resetTicketSystem(guildId: string): Promise<void> {
  await apiClient.delete(endpoints.guilds.tickets(guildId));
}

