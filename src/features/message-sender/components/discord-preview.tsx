"use client";

import { cn } from "@/lib/utils";
import { isSafeImageUrl } from "@/lib/url";
import type { MessageFormat, EmbedContent } from "../types/message-sender-types";

type DiscordPreviewProps = {
  mode: "message" | "embed";
  formats: MessageFormat[];
  embed: EmbedContent;
};

function MessagePreview({ formats }: { formats: MessageFormat[] }) {
  if (formats.length === 0) {
    return (
      <p className="text-sm italic text-white/40">
        Your message preview will appear here...
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {formats.map((f, i) => {
        switch (f.type) {
          case "large":
            return (
              <p key={i} className="text-xl font-bold leading-tight text-white">
                {f.content}
              </p>
            );
          case "underlined":
            return (
              <p key={i} className="text-sm text-white underline">
                {f.content}
              </p>
            );
          case "quote":
            return (
              <div
                key={i}
                className="border-l-4 border-[#4e5058] pl-3 text-sm text-white/80"
              >
                {f.content}
              </div>
            );
          case "spoiler":
            return (
              <span
                key={i}
                className="cursor-pointer rounded bg-[#202225] px-1 text-sm text-transparent select-none hover:bg-transparent hover:text-white"
              >
                {f.content.replace(/./g, "\u2588")}
              </span>
            );
          default:
            return (
              <p key={i} className="text-sm text-white">
                {f.content}
              </p>
            );
        }
      })}
    </div>
  );
}

function EmbedPreview({ embed }: { embed: EmbedContent }) {
  const hasContent =
    embed.title || embed.description || embed.imageUrl || embed.footer;

  if (!hasContent) {
    return (
      <p className="text-sm italic text-white/40">
        Your embed preview will appear here...
      </p>
    );
  }

  return (
    <div className="flex max-w-md rounded bg-[#2b2d31] p-4">
      <div
        className="w-1 shrink-0 rounded"
        style={{ backgroundColor: embed.color || "#5865F2" }}
      />
      <div className="ml-3 min-w-0 space-y-1.5">
        {isSafeImageUrl(embed.thumbnailUrl) && (
          <img
            src={embed.thumbnailUrl}
            alt=""
            className="float-right h-20 w-20 rounded object-cover"
          />
        )}
        {embed.title && (
          <h2 className="text-base font-semibold text-white">{embed.title}</h2>
        )}
        {embed.description && (
          <p className="text-sm leading-relaxed text-white/80">
            {embed.description}
          </p>
        )}
        {isSafeImageUrl(embed.imageUrl) && (
          <img
            src={embed.imageUrl}
            alt=""
            className="max-h-72 w-full rounded object-cover"
          />
        )}
        {embed.footer && (
          <p className="pt-1 text-xs text-white/50">
            {embed.timestamp && (
              <span>{new Date().toLocaleDateString()} &middot; </span>
            )}
            {embed.footer}
          </p>
        )}
      </div>
    </div>
  );
}

export function DiscordPreview({ mode, formats, embed }: DiscordPreviewProps) {
  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col gap-2 rounded-lg bg-[#313338] p-4",
        "shadow-inner",
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <img
          src="/logo/kat-logo.png"
          alt="Kat"
          className="h-6 w-6 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-white/80">Kat</span>
        <span className="rounded bg-[#5865F2] px-1.5 py-0.5 text-[10px] font-bold text-white">
          APP
        </span>
        <span className="text-xs text-white/40">
          {new Date().toLocaleTimeString()}
        </span>
      </div>

      {mode === "message" ? (
        <MessagePreview formats={formats} />
      ) : (
        <EmbedPreview embed={embed} />
      )}
    </div>
  );
}
