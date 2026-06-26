"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Crown,
  Image,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGuildBranding, useSaveGuildBranding } from "@/features/branding/hooks/use-branding";
import { isSafeImageUrl } from "@/lib/url";
import { AppError } from "@/lib/errors";

type BrandingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
  isPremium: boolean;
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const URL_OR_EMPTY = z
  .string()
  .nullable()
  .transform((v) => v?.trim() || null)
  .refine(
    (v) => !v || isHttpUrl(v),
    "Must be a valid http or https URL",
  );

const formSchema = z.object({
  botName: z.string().max(100).nullable().transform((v) => v?.trim() || null),
  avatarUrl: URL_OR_EMPTY,
});

type FormValues = z.infer<typeof formSchema>;

export function BrandingModal({ open, onOpenChange, guildId, isPremium }: BrandingModalProps) {
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: saved,
    isLoading,
  } = useGuildBranding(guildId, open && isPremium);

  const saveMutation = useSaveGuildBranding(guildId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { botName: null, avatarUrl: null },
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = form;
  const watchAvatarUrl = watch("avatarUrl");

  useEffect(() => {
    if (!open) {
      setSaveSuccess(null);
      setSaveError(null);
      return;
    }
    if (isLoading || !saved) return;
    reset({
      botName: saved.botName ?? null,
      avatarUrl: saved.avatarUrl ?? null,
    });
  }, [open, isLoading, saved, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!guildId) return;
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await saveMutation.mutateAsync({
        botName: values.botName,
        avatarUrl: values.avatarUrl,
      });
      setSaveSuccess("Branding saved.");
    } catch (error) {
      setSaveError(
        error instanceof AppError
          ? error.message
          : "Could not save. Check that the bot is online.",
      );
    }
  };

  const noGuild = !guildId;
  const formDisabled = isLoading || saveMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSaveSuccess(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-yellow-500/10 dark:border-white/10">
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>
          <DialogTitle>Server Branding</DialogTitle>
          <DialogDescription>
            Customize the bot&apos;s name and avatar in this server. Changes apply directly in Discord.
            Premium only.
          </DialogDescription>
        </DialogHeader>

        {!isPremium ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Crown className="h-10 w-10 text-yellow-500/60" />
            <p className="text-sm font-medium">Premium feature</p>
            <p className="text-xs text-muted-foreground">
              Upgrade to premium to customize the bot&apos;s appearance in your server.
            </p>
          </div>
        ) : noGuild ? (
          <p className="text-sm text-muted-foreground">Select a server in the header first.</p>
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Bot name
              </label>
              <input
                {...register("botName")}
                placeholder="Kat"
                disabled={formDisabled}
                className="w-full rounded-lg border border-black/[0.08] bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 dark:border-white/10"
              />
              <p className="text-[10px] text-muted-foreground">
                Changes the bot&apos;s nickname in this server. Leave blank to use the default.
              </p>
              {errors.botName && <p className="text-xs text-destructive">{errors.botName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Image className="h-3.5 w-3.5" />
                Avatar URL
              </label>
              <input
                {...register("avatarUrl")}
                placeholder="https://..."
                disabled={formDisabled}
                className="w-full rounded-lg border border-black/[0.08] bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 dark:border-white/10"
              />
              {isSafeImageUrl(watchAvatarUrl) && (
                <div className="overflow-hidden rounded-lg border border-black/[0.08] dark:border-white/10">
                  <img
                    src={watchAvatarUrl}
                    alt="Avatar preview"
                    className="h-20 w-20 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">
                Applied as Kat&apos;s guild avatar in Discord. Leave blank to restore the default.
              </p>
              {errors.avatarUrl && <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>}
            </div>

            {saveSuccess && (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            )}
            {saveError && <p className="text-xs text-destructive">{saveError}</p>}

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
                    Saving...
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
