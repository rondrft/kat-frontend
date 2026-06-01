"use client";

import type { CSSProperties } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { GuildRole } from "@/features/auto-roles/types/auto-roles-config";
import { cn } from "@/lib/utils";

type RoleCheckboxListProps = {
  roles: GuildRole[];
  selectedIds: string[];
  onChange: (roleIds: string[]) => void;
  isLoading?: boolean;
  emptyHint?: string;
  className?: string;
};

function roleColorStyle(color?: number): CSSProperties | undefined {
  if (!color) return undefined;
  return { backgroundColor: `#${color.toString(16).padStart(6, "0")}` };
}

export function RoleCheckboxList({
  roles,
  selectedIds,
  onChange,
  isLoading,
  emptyHint = "No roles found. Make sure Kat is in the server with Manage Roles permission.",
  className,
}: RoleCheckboxListProps) {
  const toggle = (roleId: string) => {
    if (selectedIds.includes(roleId)) {
      onChange(selectedIds.filter((id) => id !== roleId));
      return;
    }
    onChange([...selectedIds, roleId]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading roles…
      </div>
    );
  }

  if (roles.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyHint}</p>;
  }

  return (
    <div
      className={cn(
        "max-h-52 space-y-1 overflow-y-auto rounded-xl border border-black/[0.08] p-2 dark:border-white/10",
        className,
      )}
    >
      {roles.map((role) => {
        const checked = selectedIds.includes(role.id);

        return (
          <label
            key={role.id}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
              checked && "bg-kat/10",
            )}
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
      })}
      <Label className="px-2 pt-1 text-[10px] font-normal text-muted-foreground">
        {selectedIds.length} selected
      </Label>
    </div>
  );
}
