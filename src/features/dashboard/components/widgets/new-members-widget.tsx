"use client";

import { memo } from "react";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import type { NewMember } from "@/features/dashboard/types/new-member";
import {
  formatMemberUsername,
  getMemberAccentColor,
} from "@/features/dashboard/lib/member-display";
import { getDiscordAvatarUrl } from "@/utils/discord";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

export type NewMembersWidgetProps = {
  members?: NewMember[];
  isLoading?: boolean;
  className?: string;
};

type MemberAvatarChipProps = {
  member: NewMember;
};

function MemberAvatarChip({ member }: MemberAvatarChipProps) {
  const discordId = member.discordId;
  const accent = getMemberAccentColor(discordId);

  return (
    <li className="flex shrink-0 flex-col items-center gap-1.5">
      <div
        className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-kat/20 ring-offset-2 ring-offset-background sm:h-[3.25rem] sm:w-[3.25rem]"
        title={member.username}
      >
        <Image
          src={getDiscordAvatarUrl(discordId, member.avatar, 128)}
          alt=""
          fill
          className="object-cover"
          sizes="52px"
          unoptimized
        />
      </div>
      <span
        className="max-w-[5.5rem] truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
        style={{ backgroundColor: accent }}
        title={member.username}
      >
        {formatMemberUsername(member.username)}
      </span>
    </li>
  );
}

function NewMembersWidgetComponent({
  members = [],
  isLoading = false,
  className,
}: NewMembersWidgetProps) {
  const t = useTranslation();
  const isEmpty = !isLoading && members.length === 0;

  return (
    <section
      className={cn("w-full shrink-0", className)}
      aria-label={t.overview.newMembersWidget.ariaLabel}
    >
      {isLoading ? (
        <ul className="flex gap-4 overflow-x-auto px-1 pb-1 pt-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <li key={i} className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="h-12 w-12 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10 sm:h-[3.25rem] sm:w-[3.25rem]" />
              <div className="h-4 w-12 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
            </li>
          ))}
        </ul>
      ) : isEmpty ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserPlus className="h-4 w-4 shrink-0 opacity-60" />
          {t.overview.newMembersWidget.empty}
        </p>
      ) : (
        <ul className="flex gap-4 overflow-x-auto px-1 pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {members.map((member) => (
            <MemberAvatarChip key={member.discordId} member={member} />
          ))}
        </ul>
      )}
    </section>
  );
}

export const NewMembersWidget = memo(NewMembersWidgetComponent);
