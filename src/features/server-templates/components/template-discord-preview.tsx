"use client";

import { Hash, Megaphone, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServerTemplate } from "@/features/server-templates/types/template";

type TemplateDiscordPreviewProps = {
  template: ServerTemplate;
  className?: string;
};

export function TemplateDiscordPreview({
  template,
  className,
}: TemplateDiscordPreviewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-black/[0.08] dark:border-white/10",
        className,
      )}
    >
      <div
        className="px-3 py-2.5"
        style={{ backgroundColor: `${template.accentColor}18` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: template.accentColor }}
          >
            {template.name[0]}
          </div>
          <span className="truncate text-xs font-semibold">{template.name}</span>
        </div>
      </div>

      <div className="bg-[#1e1f22]/60 p-2 dark:bg-[#1e1f22]/90">
        {template.categories.map((category) => (
          <div key={category.name} className="mb-1 last:mb-0">
            <p className="mb-0.5 px-2 pt-2 text-[9px] font-semibold uppercase tracking-wider text-[#949ba4]">
              {category.name}
            </p>
            {category.channels.map((channel) => (
              <div
                key={channel.name}
                className="flex items-center gap-1.5 rounded px-2 py-0.5 hover:bg-white/5"
              >
                {channel.type === "voice" ? (
                  <Volume2 className="h-3 w-3 shrink-0 text-[#949ba4]" />
                ) : channel.type === "announcement" ? (
                  <Megaphone className="h-3 w-3 shrink-0 text-[#949ba4]" />
                ) : (
                  <Hash className="h-3 w-3 shrink-0 text-[#949ba4]" />
                )}
                <span className="truncate text-[11px] text-[#949ba4]">{channel.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
