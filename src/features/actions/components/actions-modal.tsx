"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Heart, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getDiscordAvatarUrl } from "@/utils/discord";
import {
  useActionsConfig,
  useSaveActionsConfig,
} from "@/features/actions/hooks/use-actions-config";
import {
  actionsConfigSchema,
  type ActionsConfigFormValues,
} from "@/features/actions/schemas/actions-schema";
import { DEFAULT_ACTIONS_CONFIG } from "@/features/actions/types/actions-config";
import { AppError } from "@/lib/errors";

type ActionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

const ACTION_COMMANDS = [
  { command: "xkiss @user", description: "Kiss command with \"Kiss Back\" button" },
  { command: "xpat @user", description: "Pat command (global count) with \"Pat Back\" button" },
  { command: "xhug @user", description: "Hug command (global count)" },
  { command: "xpunch @user", description: "Punch command with \"Punch Back\" button" },
  { command: "xbite @user", description: "Bite command with \"Bite Back\" button" },
  { command: "xfeed @user", description: "Feed command with \"Feed Back\" button" },
  { command: "xslap @user", description: "Slap command" },
];

function configToFormValues(
  config: typeof DEFAULT_ACTIONS_CONFIG | null | undefined,
): ActionsConfigFormValues {
  return { enabled: config?.enabled ?? DEFAULT_ACTIONS_CONFIG.enabled };
}

export function ActionsModal({ open, onOpenChange, guildId }: ActionsModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: savedConfig,
    isLoading: configLoading,
    isError: configError,
    error: configLoadError,
  } = useActionsConfig(guildId, open);

  const saveMutation = useSaveActionsConfig(guildId);

  const form = useForm<ActionsConfigFormValues>({
    resolver: zodResolver(actionsConfigSchema),
    defaultValues: configToFormValues(null),
  });

  const { handleSubmit, reset, watch, setValue } = form;
  const enabled = watch("enabled");

  const noGuild = !guildId;
  const displayName = user?.globalName ?? user?.username ?? "User";
  const avatarUrl = isAuthenticated && user
    ? getDiscordAvatarUrl(user.id, user.avatar, 64)
    : null;

  useEffect(() => {
    if (!open) {
      setSaveSuccess(null);
      setSaveError(null);
      return;
    }
    if (configLoading) return;
    reset(configToFormValues(savedConfig ?? null));
  }, [open, configLoading, savedConfig, reset]);

  const onSubmit = async (values: ActionsConfigFormValues) => {
    if (!guildId) return;

    setSaveSuccess(null);
    setSaveError(null);

    try {
      await saveMutation.mutateAsync(values);
      reset(values);
      setSaveSuccess(
        values.enabled
          ? "Action commands enabled for this server."
          : "Action commands disabled for this server.",
      );
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Could not save settings. Check that the bot is online.";
      setSaveError(message);
    }
  };

  const formDisabled = configLoading || saveMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSaveSuccess(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-kat/10 dark:border-white/10">
            <Sparkles className="h-5 w-5 text-kat" />
          </div>
          <DialogTitle>Actions</DialogTitle>
          <DialogDescription>
            Interactive action commands with GIFs (kiss, hug, pat, slap, cuddle, punch,
            bite, feed)
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">
            Select a server in the header first.
          </p>
        ) : configLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading settings…
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {configError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {configLoadError instanceof AppError
                  ? configLoadError.message
                  : "Could not load saved settings."}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="text-sm font-medium">Action commands</p>
                <p className="text-xs text-muted-foreground">
                  Turn off to disable interactive action commands on this server
                </p>
              </div>
              <Switch
                checked={enabled}
                disabled={formDisabled}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">How it works</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Action commands let members interact with each other using fun animated
                GIFs. Each command targets another member and some include a reciprocal
                button so the target can respond with the same action. These commands
                are a lightweight way to add social engagement to your server.
              </p>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">Example</p>
                <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-[#2b2d31] dark:border-white/10">
                  <div className="flex gap-4 p-4">
                    <div
                      className="h-12 w-12 shrink-0 rounded-full bg-cover bg-center"
                      style={
                        avatarUrl
                          ? { backgroundImage: `url(${avatarUrl})` }
                          : { backgroundColor: "#5865f2" }
                      }
                    />
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-semibold text-[#dbdee1]">
                          {displayName}
                        </span>
                        <span className="text-xs text-[#949ba4]">Today at 12:00</span>
                      </div>
                      <p className="text-base text-[#dbdee1]">
                        kisses{" "}
                        <span className="text-[#5865f2]">@TargetUser</span>
                      </p>
                      <div className="mt-3 flex aspect-video w-full max-w-[480px] items-center justify-center overflow-hidden rounded-lg bg-[#1e1f22]">
                        <img
                          src="/kiss.gif"
                          alt="Kiss GIF"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <div className="flex items-center gap-1.5 rounded-md bg-[#2e3035] px-3.5 py-2 text-sm text-[#dbdee1]">
                          <Heart className="h-4 w-4" />
                          Kiss Back
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  When a member runs{" "}
                  <code className="rounded bg-black/[0.04] px-1 py-0.5 font-mono dark:bg-white/10">
                    xkiss @TargetUser
                  </code>
                  , Kat posts a message with a kiss GIF and a "Kiss Back" button.
                </p>
              </div>

              <div className="w-px shrink-0 bg-border max-lg:hidden" />

              <div className="min-w-0 space-y-2 lg:w-80 lg:shrink-0">
                <p className="text-sm font-medium text-foreground">Available commands</p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
                  {ACTION_COMMANDS.map((cmd, i) => (
                    <div
                      key={cmd.command}
                      className={cn(
                        "flex items-baseline justify-between gap-4 px-4 py-3 text-sm",
                        i < ACTION_COMMANDS.length - 1 &&
                          "border-b border-black/[0.08] dark:border-white/10",
                      )}
                    >
                      <code className="shrink-0 rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-xs text-foreground dark:bg-white/10">
                        {cmd.command}
                      </code>
                      <span className="text-right text-xs text-muted-foreground">
                        {cmd.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {saveSuccess ? (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            ) : null}

            {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saveMutation.isPending}
              >
                {saveSuccess ? "Close" : "Cancel"}
              </Button>
              <Button type="submit" disabled={formDisabled}>
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
