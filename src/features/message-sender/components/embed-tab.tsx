"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmbedContent } from "../types/message-sender-types";

type EmbedTabProps = {
  embed: EmbedContent;
  onChange: (embed: EmbedContent) => void;
};

export function EmbedTab({ embed, onChange }: EmbedTabProps) {
  const update = (field: keyof EmbedContent, value: unknown) => {
    onChange({ ...embed, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="embed-title">Title</Label>
          <Input
            id="embed-title"
            value={embed.title ?? ""}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Embed title"
            maxLength={256}
          />
          <p className="text-xs text-muted-foreground">
            {256 - (embed.title?.length ?? 0)} characters remaining
          </p>
        </div>

        <div className="space-y-2 sm:w-36">
          <Label htmlFor="embed-color">Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={embed.color || "#5865F2"}
              onChange={(e) => update("color", e.target.value)}
              className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-black/[0.08] bg-transparent p-0.5 dark:border-white/10"
            />
            <Input
              id="embed-color"
              value={embed.color || "#5865F2"}
              onChange={(e) => update("color", e.target.value)}
              placeholder="#5865F2"
              maxLength={7}
              className="min-w-0 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="embed-description">Description</Label>
        <textarea
          id="embed-description"
          value={embed.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Embed description..."
          maxLength={4096}
          rows={3}
          className="w-full resize-none rounded-md border border-black/[0.08] bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-kat/40 dark:border-white/10"
        />
        <p className="text-xs text-muted-foreground">
          {4096 - (embed.description?.length ?? 0)} characters remaining
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="embed-image">Image URL</Label>
          <Input
            id="embed-image"
            value={embed.imageUrl ?? ""}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="https://example.com/image.png"
            type="url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="embed-thumbnail">Thumbnail URL</Label>
          <Input
            id="embed-thumbnail"
            value={embed.thumbnailUrl ?? ""}
            onChange={(e) => update("thumbnailUrl", e.target.value)}
            placeholder="https://example.com/thumb.png"
            type="url"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="embed-footer">Footer</Label>
        <Input
          id="embed-footer"
          value={embed.footer ?? ""}
          onChange={(e) => update("footer", e.target.value)}
          placeholder="Footer text"
          maxLength={256}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-black/[0.08] px-4 py-3 dark:border-white/10">
        <div>
          <Label className="text-sm font-medium">Timestamp</Label>
          <p className="text-xs text-muted-foreground">
            Show the current date and time in the footer
          </p>
        </div>
        <Switch
          checked={embed.timestamp ?? false}
          onCheckedChange={(v) => update("timestamp", v)}
        />
      </div>
    </div>
  );
}
