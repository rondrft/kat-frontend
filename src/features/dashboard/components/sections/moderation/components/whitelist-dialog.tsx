"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddWhitelist } from "@/features/moderation/hooks/use-whitelist";

export function WhitelistDialog({
  open,
  onOpenChange,
  guildId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string;
}) {
  const t = useTranslation();
  const addMutation = useAddWhitelist(guildId);
  const [channelId, setChannelId] = useState("");
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");

  const handleSave = useCallback(() => {
    if (!channelId && !userId) return;
    addMutation.mutate(
      { channelId: channelId || null, userId: userId || null, reason: reason || undefined, ruleType: null },
      { onSuccess: () => { onOpenChange(false); setChannelId(""); setUserId(""); setReason(""); } },
    );
  }, [channelId, userId, reason, addMutation, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.moderation.addWhitelistDialog.title}</DialogTitle>
          <DialogDescription>{t.moderation.addWhitelistDialog.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t.moderation.addWhitelistDialog.channel}</Label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm dark:border-white/10"
            >
              <option value="">{t.moderation.addWhitelistDialog.anyChannel}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t.moderation.addWhitelistDialog.userId}</Label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={t.moderation.addWhitelistDialog.userIdPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.moderation.addWhitelistDialog.reason}</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.moderation.addWhitelistDialog.reasonPlaceholder}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={addMutation.isPending}>
            {addMutation.isPending ? t.moderation.addWhitelistDialog.adding : t.moderation.addWhitelistDialog.add}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
