import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import type {
  BackgroundMode,
  OutputType,
  SaveWelcomeConfigPayload,
  UploadedBackground,
  WelcomeConfig,
} from "@/types/welcome";

const OUTPUT_TYPES = new Set<OutputType>(["MESSAGE", "EMBED", "IMAGE"]);
const BACKGROUND_MODES = new Set<BackgroundMode>(["COLOR", "IMAGE"]);

export const DEFAULT_WELCOME_CONFIG: WelcomeConfig = {
  guildId: "",
  welcomeEnabled: false,
  boostEnabled: false,
  welcomeChannelId: null,
  boostChannelId: null,
  welcomeOutputType: "IMAGE",
  boostOutputType: "IMAGE",
  messageTemplate: "Welcome {userMention} to {server}!",
  embedTitleTemplate: null,
  embedColor: null,
  imageTitleTemplate: "Welcome to {server}",
  imageUsernameTemplate: "{user}!",
  imageFooterTemplate: "Member #{count}",
  imageBackgroundMode: "COLOR",
  imageBackgroundColor: "#DCEBFF",
  imageBackgroundUrl: null,
  imageShowAvatar: true,
  imageTextColor: "#0F172A",
  imageMentionUser: false,
  imageCardEnabled: true,
  imageCardColor: "#000000",
  imageCardOpacity: 120,
  imageAvatarSize: 140,
};

function unwrapApiData<T>(data: ApiResponse<T> | T): T {
  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function normalizeOutputType(value: unknown, fallback: OutputType): OutputType {
  const outputType = String(value ?? fallback).toUpperCase() as OutputType;
  return OUTPUT_TYPES.has(outputType) ? outputType : fallback;
}

function normalizeBackgroundMode(
  value: unknown,
  fallback: BackgroundMode,
): BackgroundMode {
  const mode = String(value ?? fallback).toUpperCase() as BackgroundMode;
  return BACKGROUND_MODES.has(mode) ? mode : fallback;
}

function normalizeInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

export function normalizeWelcomeConfig(raw: unknown, guildId = ""): WelcomeConfig {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    guildId: String(row.guildId ?? guildId),
    welcomeEnabled: Boolean(row.welcomeEnabled),
    boostEnabled: Boolean(row.boostEnabled),
    welcomeChannelId: nullableString(row.welcomeChannelId),
    boostChannelId: nullableString(row.boostChannelId),
    welcomeOutputType: normalizeOutputType(
      row.welcomeOutputType,
      DEFAULT_WELCOME_CONFIG.welcomeOutputType,
    ),
    boostOutputType: normalizeOutputType(
      row.boostOutputType,
      DEFAULT_WELCOME_CONFIG.boostOutputType,
    ),
    messageTemplate: String(
      row.messageTemplate ?? DEFAULT_WELCOME_CONFIG.messageTemplate,
    ),
    embedTitleTemplate: nullableString(row.embedTitleTemplate),
    embedColor: nullableString(row.embedColor),
    imageTitleTemplate: String(
      row.imageTitleTemplate ?? DEFAULT_WELCOME_CONFIG.imageTitleTemplate,
    ),
    imageUsernameTemplate: String(
      row.imageUsernameTemplate ?? DEFAULT_WELCOME_CONFIG.imageUsernameTemplate,
    ),
    imageFooterTemplate: String(
      row.imageFooterTemplate ?? DEFAULT_WELCOME_CONFIG.imageFooterTemplate,
    ),
    imageBackgroundMode: normalizeBackgroundMode(
      row.imageBackgroundMode,
      DEFAULT_WELCOME_CONFIG.imageBackgroundMode,
    ),
    imageBackgroundColor: String(
      row.imageBackgroundColor ?? DEFAULT_WELCOME_CONFIG.imageBackgroundColor,
    ),
    imageBackgroundUrl: nullableString(row.imageBackgroundUrl),
    imageShowAvatar:
      typeof row.imageShowAvatar === "boolean"
        ? row.imageShowAvatar
        : DEFAULT_WELCOME_CONFIG.imageShowAvatar,
    imageTextColor: String(row.imageTextColor ?? DEFAULT_WELCOME_CONFIG.imageTextColor),
    imageMentionUser:
      typeof row.imageMentionUser === "boolean"
        ? row.imageMentionUser
        : DEFAULT_WELCOME_CONFIG.imageMentionUser,
    imageCardEnabled:
      typeof row.imageCardEnabled === "boolean"
        ? row.imageCardEnabled
        : DEFAULT_WELCOME_CONFIG.imageCardEnabled,
    imageCardColor: String(
      row.imageCardColor ?? DEFAULT_WELCOME_CONFIG.imageCardColor,
    ),
    imageCardOpacity: normalizeInteger(
      row.imageCardOpacity,
      DEFAULT_WELCOME_CONFIG.imageCardOpacity,
      0,
      255,
    ),
    imageAvatarSize: normalizeInteger(
      row.imageAvatarSize,
      DEFAULT_WELCOME_CONFIG.imageAvatarSize,
      60,
      200,
    ),
  };
}

export function toWelcomePayload(config: WelcomeConfig): SaveWelcomeConfigPayload {
  return {
    welcomeEnabled: config.welcomeEnabled,
    boostEnabled: config.boostEnabled,
    welcomeChannelId: config.welcomeChannelId,
    boostChannelId: config.boostChannelId,
    welcomeOutputType: config.welcomeOutputType,
    boostOutputType: config.boostOutputType,
    messageTemplate: config.messageTemplate,
    embedTitleTemplate: config.embedTitleTemplate,
    embedColor: config.embedColor,
    imageTitleTemplate: config.imageTitleTemplate,
    imageUsernameTemplate: config.imageUsernameTemplate,
    imageFooterTemplate: config.imageFooterTemplate,
    imageBackgroundMode: config.imageBackgroundMode,
    imageBackgroundColor: config.imageBackgroundColor,
    imageBackgroundUrl: config.imageBackgroundUrl,
    imageShowAvatar: config.imageShowAvatar,
    imageTextColor: config.imageTextColor,
    imageMentionUser: config.imageMentionUser,
    imageCardEnabled: config.imageCardEnabled,
    imageCardColor: config.imageCardColor,
    imageCardOpacity: config.imageCardOpacity,
    imageAvatarSize: config.imageAvatarSize,
  };
}

export async function getWelcomeConfig(guildId: string): Promise<WelcomeConfig> {
  const { data } = await apiClient.get<ApiResponse<WelcomeConfig> | unknown>(
    endpoints.guilds.welcomes(guildId),
  );
  return normalizeWelcomeConfig(unwrapApiData(data), guildId);
}

export async function saveWelcomeConfig(
  guildId: string,
  payload: SaveWelcomeConfigPayload,
): Promise<WelcomeConfig> {
  const { data } = await apiClient.put<ApiResponse<WelcomeConfig> | unknown>(
    endpoints.guilds.welcomes(guildId),
    payload,
  );
  return normalizeWelcomeConfig(unwrapApiData(data), guildId);
}

export async function uploadBackground(
  guildId: string,
  file: File,
): Promise<UploadedBackground> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<ApiResponse<UploadedBackground> | unknown>(
    endpoints.guilds.welcomeBackground(guildId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  const raw = unwrapApiData(data);
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    url: String(row.url ?? ""),
  };
}
