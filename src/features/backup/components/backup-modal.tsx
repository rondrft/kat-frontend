"use client";

import { useState } from "react";
import { CheckCircle2, Crown, DatabaseBackup, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGuildBackups, useCreateBackup, useRestoreBackup, useDeleteBackup } from "@/features/backup/hooks/use-backup";
import type { ServerBackup } from "@/features/backup/types/backup";
import { AppError } from "@/lib/errors";

const FREE_LIMIT = 2;
const PREMIUM_LIMIT = 10;

type BackupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
  isPremium: boolean;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `~${Math.round(bytes / 1024)} KB`;
}

export function BackupModal({ open, onOpenChange, guildId, isPremium }: BackupModalProps) {
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<ServerBackup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServerBackup | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: backups = [], isLoading } = useGuildBackups(guildId, open);
  const createMutation = useCreateBackup(guildId);
  const restoreMutation = useRestoreBackup(guildId);
  const deleteMutation = useDeleteBackup(guildId);

  const maxBackups = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;
  const atLimit = backups.length >= maxBackups;

  function reset() {
    setNewName("");
    setCreateError(null);
    setCreateSuccess(false);
    setRestoreTarget(null);
    setDeleteTarget(null);
    setActionError(null);
  }

  async function handleCreate() {
    if (!newName.trim() || !guildId) return;
    setCreateError(null);
    setCreateSuccess(false);
    try {
      await createMutation.mutateAsync(newName.trim());
      setNewName("");
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      setCreateError(
        err instanceof AppError ? err.message : "Could not create backup. Check that the bot is online.",
      );
    }
  }

  async function handleRestore() {
    if (!restoreTarget || !guildId) return;
    setActionError(null);
    try {
      await restoreMutation.mutateAsync(restoreTarget.id);
      setRestoreTarget(null);
    } catch (err) {
      setActionError(err instanceof AppError ? err.message : "Could not start restore.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !guildId) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setActionError(err instanceof AppError ? err.message : "Could not delete backup.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-violet-500/10 dark:border-white/10">
            <DatabaseBackup className="h-5 w-5 text-violet-500" />
          </div>
          <DialogTitle>Server Backups</DialogTitle>
          <DialogDescription>
            Save snapshots of your server structure — roles, categories, and channels.
          </DialogDescription>
        </DialogHeader>

        {!guildId ? (
          <p className="text-sm text-muted-foreground">Select a server in the header first.</p>
        ) : restoreTarget ? (
          <div className="space-y-4">
            <p className="text-sm">
              Restore backup <span className="font-semibold">{restoreTarget.name}</span>?
              <br />
              <span className="text-xs text-muted-foreground">
                This will recreate roles and channels from this backup. Existing structure will not be deleted.
              </span>
            </p>
            {actionError && <p className="text-xs text-destructive">{actionError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRestoreTarget(null)} disabled={restoreMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleRestore} disabled={restoreMutation.isPending}>
                {restoreMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Restoring…</>
                ) : (
                  "Confirm Restore"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : deleteTarget ? (
          <div className="space-y-4">
            <p className="text-sm">
              Delete backup <span className="font-semibold">{deleteTarget.name}</span>? This cannot be undone.
            </p>
            {actionError && <p className="text-xs text-destructive">{actionError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">New backup name</label>
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="My Server Backup"
                  maxLength={100}
                  disabled={createMutation.isPending || atLimit}
                  className="flex-1 rounded-lg border border-black/[0.08] bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 dark:border-white/10"
                />
                <Button
                  onClick={handleCreate}
                  disabled={!newName.trim() || createMutation.isPending || atLimit}
                  size="sm"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {isPremium ? (
                  <><Crown className="mr-0.5 inline h-3 w-3 text-yellow-500" /> Premium — up to {PREMIUM_LIMIT} backups</>
                ) : (
                  <>Free — up to {FREE_LIMIT} backups. <span className="text-yellow-600 dark:text-yellow-400">Upgrade to Premium for {PREMIUM_LIMIT}.</span></>
                )}
              </p>
              {atLimit && (
                <p className="text-xs text-destructive">
                  Backup limit reached ({backups.length}/{maxBackups}). Delete an existing backup to create a new one.
                </p>
              )}
              {createError && <p className="text-xs text-destructive">{createError}</p>}
              {createSuccess && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Backup created.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Saved backups ({backups.length}/{maxBackups})
              </p>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : backups.length === 0 ? (
                <p className="rounded-lg border border-dashed border-black/[0.12] py-8 text-center text-xs text-muted-foreground dark:border-white/10">
                  No backups yet. Create one above to save your server structure.
                </p>
              ) : (
                <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                  {backups.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{b.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(b.createdAt)} · {formatSize(b.dataSize)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => { setActionError(null); setRestoreTarget(b); }}
                          title="Restore"
                        >
                          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => { setActionError(null); setDeleteTarget(b); }}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
