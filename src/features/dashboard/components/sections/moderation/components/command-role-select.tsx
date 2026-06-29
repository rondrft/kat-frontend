"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getDiscordAvatarUrl } from "@/utils/discord";
import type { GuildRole } from "@/features/auto-roles/types/auto-roles-config";

function roleColorStyle(color?: number): React.CSSProperties | undefined {
  if (!color) return undefined;
  return { backgroundColor: `#${color.toString(16).padStart(6, "0")}` };
}

export function CommandRoleSelect({
  roles,
  selectedIds,
  onChange,
  isLoading,
}: {
  roles: GuildRole[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  isLoading?: boolean;
}) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggle = (roleId: string) => {
    if (selectedIds.includes(roleId)) {
      onChange(selectedIds.filter((id) => id !== roleId));
    } else {
      onChange([...selectedIds, roleId]);
    }
  };

  const selectedRoles = roles.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-10 w-full items-center gap-1.5 rounded-xl border border-black/[0.08] bg-background px-3 py-1.5 text-left text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 dark:border-white/10"
      >
        {isLoading ? (
          <span className="text-xs text-muted-foreground">{t.moderation.selects.loadingRoles}</span>
        ) : selectedRoles.length > 0 ? (
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedRoles.map((role) => (
              <span
                key={role.id}
                className="inline-flex items-center gap-1 rounded-md bg-black/[0.06] px-1.5 py-0.5 text-xs font-medium dark:bg-white/[0.08]"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-muted"
                  style={roleColorStyle(role.color)}
                />
                {role.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t.moderation.selects.selectRoles}</span>
        )}
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-black/[0.08] bg-background p-1 shadow-lg dark:border-white/10">
          {roles.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              {isLoading ? t.moderation.selects.loadingRoles : t.moderation.selects.noRolesAvailable}
            </p>
          ) : (
            roles.map((role) => {
              const checked = selectedIds.includes(role.id);
              return (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                >
                  <input
                    type="checkbox"
                    className="accent-[hsl(var(--kat-brand))]"
                    checked={checked}
                    onChange={() => toggle(role.id)}
                  />
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted"
                    style={roleColorStyle(role.color)}
                  />
                  <span className="truncate">{role.name}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function SingleRoleSelect({
  roles,
  selectedId,
  onChange,
  isLoading,
}: {
  roles: GuildRole[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  isLoading?: boolean;
}) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedRole = roles.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-10 w-full items-center gap-1.5 rounded-xl border border-black/[0.08] bg-background px-3 py-1.5 text-left text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 dark:border-white/10"
      >
        {isLoading ? (
          <span className="text-xs text-muted-foreground">{t.moderation.selects.loadingRoles}</span>
        ) : selectedRole ? (
          <div className="flex flex-1 flex-wrap gap-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-black/[0.06] px-1.5 py-0.5 text-xs font-medium dark:bg-white/[0.08]">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-muted"
                style={roleColorStyle(selectedRole.color)}
              />
              {selectedRole.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t.moderation.selects.selectRole}</span>
        )}
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-black/[0.08] bg-background p-1 shadow-lg dark:border-white/10">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
            <input
              type="radio"
              name="single-role"
              className="accent-[hsl(var(--kat-brand))]"
              checked={selectedId === null}
              onChange={() => onChange(null)}
            />
            <span className="text-muted-foreground">{t.moderation.purgeCommand.noRole}</span>
          </label>
          {roles.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              {isLoading ? t.moderation.selects.loadingRoles : t.moderation.selects.noRolesAvailable}
            </p>
          ) : (
            roles.map((role) => {
              const checked = role.id === selectedId;
              return (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                >
                  <input
                    type="radio"
                    name="single-role"
                    className="accent-[hsl(var(--kat-brand))]"
                    checked={checked}
                    onChange={() => onChange(role.id)}
                  />
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted"
                    style={roleColorStyle(role.color)}
                  />
                  <span className="truncate">{role.name}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

type MemberTag = {
  id: string;
  username: string;
  avatar: string | null;
};

export function UserTagInput({
  userIds,
  onChange,
  guildId,
}: {
  userIds: string[];
  onChange: (ids: string[]) => void;
  guildId: string;
}) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<MemberTag[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userIds.length === 0) {
      setTags([]);
      return;
    }
    const idsSet = new Set(userIds);
    setTags((prev) => {
      const next = prev.filter((t) => idsSet.has(t.id));
      const missing = userIds.filter((id) => !next.find((t) => t.id === id));
      if (missing.length === 0) return next;
      return next;
    });
  }, [userIds]);

  const removeTag = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    onChange(userIds.filter((uid) => uid !== id));
  };

  const addUser = (userId: string) => {
    const trimmed = userId.trim();
    if (!trimmed) return;
    if (userIds.includes(trimmed)) {
      setError(t.moderation.selects.userAlreadyAdded);
      return;
    }
    setError(null);

    const member = queryClient
      .getQueriesData({ queryKey: ["guilds", guildId, "members"] })
      .flatMap(([, data]) => (Array.isArray(data) ? data : []))
      .find(
        (m: { id?: string; discordId?: string }) =>
          m?.id === trimmed || m?.discordId === trimmed,
      );

    if (member) {
      const tag: MemberTag = {
        id: member.id,
        username: member.username ?? t.moderation.whitelist.unknown,
        avatar: typeof member.avatar === "string" ? member.avatar : null,
      };
      setTags((prev) => [...prev, tag]);
      onChange([...userIds, member.id]);
    } else {
      const tag: MemberTag = {
        id: trimmed,
        username: trimmed,
        avatar: null,
      };
      setTags((prev) => [...prev, tag]);
      onChange([...userIds, trimmed]);
    }
    setInputValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void addUser(inputValue);
            }
          }}
          placeholder={t.moderation.selects.enterUserId}
          className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
        />
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-black/[0.06] px-2 py-1 text-xs font-medium dark:bg-white/[0.08]"
            >
              <Image
                src={getDiscordAvatarUrl(tag.id, tag.avatar, 32)}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 shrink-0 rounded-full"
                unoptimized
              />
              <span className="max-w-[120px] truncate">{tag.username}</span>
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-black/[0.1] hover:text-foreground dark:hover:bg-white/[0.1]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
