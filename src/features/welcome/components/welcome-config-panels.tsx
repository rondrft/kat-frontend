"use client";

import Image from "next/image";
import {
  ImageIcon,
  Loader2,
  MessageSquare,
  PartyPopper,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiConfig } from "@/config/api";
import { cn } from "@/lib/utils";
import type { BackgroundMode, OutputType, WelcomeConfig } from "@/types/welcome";

type WelcomeEvent = "welcome" | "boost";

type SampleUser = {
  username: string;
  avatar: string;
  memberCount: number;
  boostCount: number;
};

type EventConfigPanelProps = {
  event: WelcomeEvent;
  config: WelcomeConfig;
  serverName: string;
  sampleUser: SampleUser;
  backgroundPreviewUrl: string | null;
  isSaving: boolean;
  isSaved: boolean;
  isUploading: boolean;
  onChange: (patch: Partial<WelcomeConfig>) => void;
  onSave: () => void;
  onUploadBackground: (file: File) => void;
};

const OUTPUT_OPTIONS: { id: OutputType; label: string; icon: typeof MessageSquare }[] =
  [
    { id: "MESSAGE", label: "Message", icon: MessageSquare },
    { id: "EMBED", label: "Embed", icon: Sparkles },
    { id: "IMAGE", label: "Image", icon: ImageIcon },
  ];

const BACKGROUND_OPTIONS: { id: BackgroundMode; label: string }[] = [
  { id: "COLOR", label: "Color" },
  { id: "IMAGE", label: "Image" },
];

function resolveAssetUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  try {
    return new URL(url, apiConfig.baseURL).toString();
  } catch {
    return url;
  }
}

function renderTemplate(
  template: string | null | undefined,
  serverName: string,
  user: SampleUser,
) {
  return String(template ?? "")
    .replaceAll("{user}", user.username)
    .replaceAll("{userMention}", `@${user.username}`)
    .replaceAll("{server}", serverName)
    .replaceAll("{count}", String(user.memberCount))
    .replaceAll("{boostCount}", String(user.boostCount));
}

function textareaClassName() {
  return "flex min-h-[104px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
}

function clampInteger(value: string, min: number, max: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function hexToRgba(hex: string, opacity: number) {
  const normalizedHex = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000";
  const red = Number.parseInt(normalizedHex.slice(1, 3), 16);
  const green = Number.parseInt(normalizedHex.slice(3, 5), 16);
  const blue = Number.parseInt(normalizedHex.slice(5, 7), 16);

  return `rgb(${red} ${green} ${blue} / ${
    Math.min(255, Math.max(0, opacity)) / 255
  })`;
}

function EventConfigPanel({
  event,
  config,
  serverName,
  sampleUser,
  backgroundPreviewUrl,
  isSaving,
  isSaved,
  isUploading,
  onChange,
  onSave,
  onUploadBackground,
}: EventConfigPanelProps) {
  const isWelcome = event === "welcome";
  const title = isWelcome ? "Welcome messages" : "Boost messages";
  const description = isWelcome
    ? "Send a message when a new member joins this server."
    : "Celebrate members when they boost the server.";
  const Icon = isWelcome ? PartyPopper : Sparkles;
  const enabled = isWelcome ? config.welcomeEnabled : config.boostEnabled;
  const channelId = isWelcome ? config.welcomeChannelId : config.boostChannelId;
  const outputType = isWelcome ? config.welcomeOutputType : config.boostOutputType;
  const previewTitle =
    renderTemplate(config.embedTitleTemplate, serverName, sampleUser) ||
    renderTemplate(config.imageTitleTemplate, serverName, sampleUser);
  const renderedMessage = renderTemplate(
    config.messageTemplate,
    serverName,
    sampleUser,
  );
  const backgroundUrl = resolveAssetUrl(
    backgroundPreviewUrl ?? config.imageBackgroundUrl,
  );
  const previewBackground =
    config.imageBackgroundMode === "IMAGE" && backgroundUrl
      ? {
          backgroundImage: `linear-gradient(180deg, rgb(15 23 42 / 0.15), rgb(15 23 42 / 0.35)), url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: config.imageBackgroundColor || "#DCEBFF" };

  return (
    <section className="dashboard-glass-card grid min-h-0 gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-kat">
              Message designer
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isSaved ? (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Saved
              </span>
            ) : null}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kat/10">
              <Icon className="h-5 w-5 text-kat" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div className="flex items-center gap-3 rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
            <Switch
              checked={enabled}
              onCheckedChange={(checked) =>
                onChange(
                  isWelcome ? { welcomeEnabled: checked } : { boostEnabled: checked },
                )
              }
            />
            <div>
              <p className="text-sm font-medium">Enabled</p>
              <p className="text-xs text-muted-foreground">
                {enabled ? "Active" : "Disabled"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${event}Channel`}>Channel ID</Label>
            <Input
              id={`${event}Channel`}
              value={channelId ?? ""}
              onChange={(changeEvent) =>
                onChange(
                  isWelcome
                    ? { welcomeChannelId: changeEvent.target.value || null }
                    : { boostChannelId: changeEvent.target.value || null },
                )
              }
              placeholder="Discord text channel ID"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Format</Label>
          <div className="grid grid-cols-3 gap-2">
            {OUTPUT_OPTIONS.map(({ id, label, icon: OutputIcon }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  onChange(
                    isWelcome ? { welcomeOutputType: id } : { boostOutputType: id },
                  )
                }
                className={cn(
                  "flex h-10 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-colors",
                  outputType === id
                    ? "border-kat/40 bg-kat/10 text-kat"
                    : "border-black/[0.08] bg-black/[0.02] text-muted-foreground hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.03]",
                )}
              >
                <OutputIcon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {outputType === "MESSAGE" ? (
          <div className="space-y-2">
            <Label htmlFor={`${event}Message`}>Message</Label>
            <textarea
              id={`${event}Message`}
              value={config.messageTemplate}
              onChange={(changeEvent) =>
                onChange({ messageTemplate: changeEvent.target.value })
              }
              className={textareaClassName()}
            />
          </div>
        ) : null}

        {outputType === "EMBED" ? (
          <div className="space-y-3 rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
            <div className="space-y-2">
              <Label htmlFor={`${event}EmbedTitle`}>Embed title</Label>
              <Input
                id={`${event}EmbedTitle`}
                value={config.embedTitleTemplate ?? ""}
                onChange={(changeEvent) =>
                  onChange({ embedTitleTemplate: changeEvent.target.value || null })
                }
                placeholder="Welcome to {server}"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
              <div className="space-y-2">
                <Label htmlFor={`${event}EmbedMessage`}>Description</Label>
                <textarea
                  id={`${event}EmbedMessage`}
                  value={config.messageTemplate}
                  onChange={(changeEvent) =>
                    onChange({ messageTemplate: changeEvent.target.value })
                  }
                  className={textareaClassName()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${event}EmbedColor`}>Color</Label>
                <Input
                  id={`${event}EmbedColor`}
                  type="color"
                  value={config.embedColor ?? "#2F80ED"}
                  onChange={(changeEvent) =>
                    onChange({ embedColor: changeEvent.target.value })
                  }
                  className="h-10 p-1"
                />
              </div>
            </div>
          </div>
        ) : null}

        {outputType === "IMAGE" ? (
          <div className="space-y-3 rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
            <div>
              <p className="text-sm font-medium">Image text</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                These fields control the generated image.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
              <div className="space-y-2">
                <Label htmlFor={`${event}ImageTitle`}>Top title</Label>
                <Input
                  id={`${event}ImageTitle`}
                  value={config.imageTitleTemplate}
                  onChange={(changeEvent) =>
                    onChange({ imageTitleTemplate: changeEvent.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${event}TextColor`}>Text</Label>
                <Input
                  id={`${event}TextColor`}
                  type="color"
                  value={config.imageTextColor || "#0F172A"}
                  onChange={(changeEvent) =>
                    onChange({ imageTextColor: changeEvent.target.value })
                  }
                  className="h-10 p-1"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${event}ImageUser`}>User line</Label>
                <Input
                  id={`${event}ImageUser`}
                  value={config.imageUsernameTemplate}
                  onChange={(changeEvent) =>
                    onChange({ imageUsernameTemplate: changeEvent.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${event}ImageFooter`}>Footer line</Label>
                <Input
                  id={`${event}ImageFooter`}
                  value={config.imageFooterTemplate}
                  onChange={(changeEvent) =>
                    onChange({ imageFooterTemplate: changeEvent.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
              <div className="space-y-2">
                <Label>Background mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onChange({ imageBackgroundMode: option.id })}
                      className={cn(
                        "h-10 rounded-lg border text-xs font-medium transition-colors",
                        config.imageBackgroundMode === option.id
                          ? "border-kat/40 bg-kat/10 text-kat"
                          : "border-black/[0.08] bg-black/[0.02] text-muted-foreground hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.03]",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${event}ImageColor`}>Color</Label>
                <Input
                  id={`${event}ImageColor`}
                  type="color"
                  value={config.imageBackgroundColor || "#DCEBFF"}
                  onChange={(changeEvent) =>
                    onChange({
                      imageBackgroundColor: changeEvent.target.value,
                      imageBackgroundMode: "COLOR",
                    })
                  }
                  className="h-10 p-1"
                />
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl bg-background/70 p-3">
                <Switch
                  checked={config.imageShowAvatar}
                  onCheckedChange={(checked) => onChange({ imageShowAvatar: checked })}
                />
                <div>
                  <p className="text-sm font-medium">Centered avatar</p>
                  <p className="text-xs text-muted-foreground">
                    Places the member avatar in front.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-background/70 p-3">
                <Switch
                  checked={config.imageMentionUser}
                  onCheckedChange={(checked) => onChange({ imageMentionUser: checked })}
                />
                <div>
                  <p className="text-sm font-medium">Mention user</p>
                  <p className="text-xs text-muted-foreground">
                    Tags them above the image.
                  </p>
                </div>
              </div>

              <label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(changeEvent) => {
                    const file = changeEvent.target.files?.[0];
                    if (file) onUploadBackground(file);
                    changeEvent.target.value = "";
                  }}
                />
                <span className="flex min-h-[72px] cursor-pointer items-center gap-3 rounded-xl bg-background/70 p-3 transition-colors hover:bg-background">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input bg-background">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">Background image</span>
                    <span className="block text-xs text-muted-foreground">
                      Upload PNG, JPG, or WebP.
                    </span>
                  </span>
                </span>
              </label>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(160px,0.7fr)]">
              <div className="space-y-3 rounded-xl bg-background/70 p-3">
                <p className="text-sm font-medium">Card settings</p>
                <div className="grid items-end gap-3 sm:grid-cols-[minmax(150px,0.9fr)_88px_minmax(150px,1fr)]">
                  <div className="flex h-10 items-center gap-3 rounded-lg bg-background px-3">
                    <Switch
                      checked={config.imageCardEnabled}
                      onCheckedChange={(checked) =>
                        onChange({ imageCardEnabled: checked })
                      }
                    />
                    <p className="text-sm font-medium">Card overlay</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${event}CardColor`}>Color</Label>
                    <Input
                      id={`${event}CardColor`}
                      type="color"
                      value={config.imageCardColor || "#000000"}
                      onChange={(changeEvent) =>
                        onChange({ imageCardColor: changeEvent.target.value })
                      }
                      className="h-10 p-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor={`${event}CardOpacity`}>Opacity</Label>
                      <span className="text-xs font-medium text-muted-foreground">
                        {config.imageCardOpacity}
                      </span>
                    </div>
                    <Input
                      id={`${event}CardOpacity`}
                      type="range"
                      min={0}
                      max={255}
                      value={config.imageCardOpacity}
                      onChange={(changeEvent) =>
                        onChange({
                          imageCardOpacity: clampInteger(
                            changeEvent.target.value,
                            0,
                            255,
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-background/70 p-3">
                <p className="text-sm font-medium">Avatar settings</p>
                <div className="space-y-2">
                  <Label htmlFor={`${event}AvatarSize`}>Size</Label>
                  <Input
                    id={`${event}AvatarSize`}
                    type="number"
                    min={60}
                    max={200}
                    value={config.imageAvatarSize}
                    onChange={(changeEvent) =>
                      onChange({
                        imageAvatarSize: clampInteger(
                          changeEvent.target.value,
                          60,
                          200,
                        ),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={isSaving}
          onClick={onSave}
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save config
        </Button>
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live preview
            </p>
            <p className="mt-1 text-sm font-medium">
              {isWelcome ? "Member joined" : "Server boosted"}
            </p>
          </div>
          <span className="rounded-full bg-kat/10 px-2 py-1 text-[10px] font-semibold uppercase text-kat">
            {outputType}
          </span>
        </div>

        <div className="rounded-2xl bg-[#313338] p-4 text-white">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white">
              <Image
                src="/logo/kat-logo.png"
                alt=""
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">Kat</p>
              <p className="text-[10px] text-white/50">BOT</p>
            </div>
          </div>

          {outputType === "MESSAGE" ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#dbdee1]">
              {renderedMessage}
            </p>
          ) : null}

          {outputType === "EMBED" ? (
            <div
              className="rounded-md bg-[#2b2d31] p-4"
              style={{ borderLeft: `4px solid ${config.embedColor ?? "#2F80ED"}` }}
            >
              <p className="font-semibold">{previewTitle}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#dbdee1]">
                {renderedMessage}
              </p>
            </div>
          ) : null}

          {outputType === "IMAGE" ? (
            <div className="space-y-2">
              {config.imageMentionUser ? (
                <p className="text-sm leading-relaxed text-[#dbdee1]">
                  @{sampleUser.username}
                </p>
              ) : null}
              <div
                className="relative flex aspect-[2.2/1] overflow-hidden rounded-lg p-6 text-center sm:p-8"
                style={previewBackground}
              >
                <div className="absolute inset-0 bg-white/20" />
                {config.imageCardEnabled ? (
                  <div
                    className="absolute inset-x-[5%] inset-y-[5%] rounded-md backdrop-blur-[1px]"
                    style={{
                      backgroundColor: hexToRgba(
                        config.imageCardColor,
                        config.imageCardOpacity,
                      ),
                    }}
                  />
                ) : null}
                <div className="relative z-10 m-auto flex flex-col items-center">
                  <p
                    className="text-xl font-bold leading-tight sm:text-2xl"
                    style={{ color: config.imageTextColor || "#0F172A" }}
                  >
                    {renderTemplate(config.imageTitleTemplate, serverName, sampleUser)}
                  </p>
                  {config.imageShowAvatar ? (
                    <img
                      src={sampleUser.avatar}
                      alt=""
                      className="mt-4 rounded-full border-4 border-white object-cover shadow-lg sm:mt-5"
                      style={{
                        height: `clamp(60px, ${config.imageAvatarSize}px, 42%)`,
                        width: `clamp(60px, ${config.imageAvatarSize}px, 42%)`,
                      }}
                    />
                  ) : null}
                  <p
                    className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl"
                    style={{ color: config.imageTextColor || "#0F172A" }}
                  >
                    {renderTemplate(
                      config.imageUsernameTemplate,
                      serverName,
                      sampleUser,
                    )}
                  </p>
                  <p
                    className="mt-1 text-lg font-medium opacity-80 sm:text-xl"
                    style={{ color: config.imageTextColor || "#0F172A" }}
                  >
                    {renderTemplate(config.imageFooterTemplate, serverName, sampleUser)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function WelcomeConfigPanel(props: Omit<EventConfigPanelProps, "event">) {
  return <EventConfigPanel {...props} event="welcome" />;
}

export function BoostConfigPanel(props: Omit<EventConfigPanelProps, "event">) {
  return <EventConfigPanel {...props} event="boost" />;
}
