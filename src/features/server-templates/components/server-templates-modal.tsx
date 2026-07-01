"use client";

import { useMemo, useState } from "react";
import { LayoutTemplate, Search, Sparkles, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SERVER_TEMPLATES } from "@/features/server-templates/data/templates";
import { TemplateDiscordPreview } from "@/features/server-templates/components/template-discord-preview";
import type {
  ServerTemplate,
  TemplateCategory_id,
} from "@/features/server-templates/types/template";

type ServerTemplatesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

function matchesSearch(template: ServerTemplate, query: string): boolean {
  const q = query.toLowerCase();
  return (
    template.name.toLowerCase().includes(q) ||
    template.description.toLowerCase().includes(q) ||
    template.tags.some((tag) => tag.includes(q)) ||
    template.categories.some(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.channels.some((ch) => ch.name.toLowerCase().includes(q)),
    )
  );
}

function RoleBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
        color,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

function TemplateCard({
  template,
  selected,
  onClick,
}: {
  template: ServerTemplate;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = template.icon;
  const channelCount = template.categories.reduce(
    (sum, cat) => sum + cat.channels.length,
    0,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm"
          : "border-black/[0.08] hover:border-black/[0.15] hover:bg-muted/40 dark:border-white/10 dark:hover:border-white/20",
      )}
      style={
        {
          "--accent": template.accentColor,
        } as React.CSSProperties
      }
    >
      {template.recommended ? (
        <span
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
          style={{
            borderColor: `${template.accentColor}40`,
            backgroundColor: `${template.accentColor}15`,
            color: template.accentColor,
          }}
        >
          <Sparkles className="h-2.5 w-2.5" />
          Recommended
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${template.accentColor}20` }}
        >
          <Icon className="h-4 w-4" style={{ color: template.accentColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{template.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {template.roles.length} roles · {channelCount} channels
          </p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{template.description}</p>

      <div className="flex flex-wrap gap-1">
        {template.tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[9px] text-muted-foreground"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

function TemplateDetail({ template }: { template: ServerTemplate }) {
  const Icon = template.icon;
  const totalChannels = template.categories.reduce(
    (sum, cat) => sum + cat.channels.length,
    0,
  );

  return (
    <div className="space-y-5">
      <div
        className="flex items-center gap-3 rounded-xl border p-4"
        style={{
          borderColor: `${template.accentColor}30`,
          backgroundColor: `${template.accentColor}08`,
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${template.accentColor}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: template.accentColor }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{template.name}</p>
            {template.recommended ? (
              <span
                className="flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  borderColor: `${template.accentColor}40`,
                  backgroundColor: `${template.accentColor}15`,
                  color: template.accentColor,
                }}
              >
                <Sparkles className="h-2.5 w-2.5" />
                Recommended
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {template.roles.length} roles · {totalChannels} channels ·{" "}
            {template.categories.length} categories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Channel Preview
          </p>
          <TemplateDiscordPreview template={template} />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Roles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {template.roles.map((role) => (
                <RoleBadge key={role.name} name={role.name} color={role.color} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: `${template.accentColor}25`,
              backgroundColor: `${template.accentColor}06`,
            }}
          >
            <p className="mb-1 text-xs font-semibold" style={{ color: template.accentColor }}>
              What you get
            </p>
            <ul className="space-y-1">
              {template.categories.map((cat) => (
                <li key={cat.name} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{cat.name}:</span>{" "}
                  {cat.channels.map((ch) => ch.name).join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Apply this template</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              One-click setup will create all roles and channels automatically.
              Available in the next release.
            </p>
          </div>
          <Button size="sm" disabled className="shrink-0">
            Coming soon
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ServerTemplatesModal({
  open,
  onOpenChange,
  guildId,
}: ServerTemplatesModalProps) {
  const [activeTab, setActiveTab] = useState<TemplateCategory_id | null>(null);
  const [search, setSearch] = useState("");

  const selectedTemplate = useMemo(
    () => (activeTab ? SERVER_TEMPLATES.find((t) => t.id === activeTab) ?? null : null),
    [activeTab],
  );

  const filteredTemplates = useMemo(
    () =>
      search.trim().length > 0
        ? SERVER_TEMPLATES.filter((t) => matchesSearch(t, search.trim()))
        : SERVER_TEMPLATES,
    [search],
  );

  const isSearching = search.trim().length > 0;

  function handleClose() {
    setSearch("");
    setActiveTab(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-violet-500/10 dark:border-white/10">
            <LayoutTemplate className="h-5 w-5 text-violet-500" />
          </div>
          <DialogTitle>Server Templates</DialogTitle>
          <DialogDescription>
            Start your community faster with ready-to-use server layouts.
          </DialogDescription>
        </DialogHeader>

        {!guildId ? (
          <p className="text-sm text-muted-foreground">Select a server in the header first.</p>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates, channels, or tags…"
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value.trim()) setActiveTab(null);
                }}
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {!isSearching && (
              <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/[0.08] bg-black/[0.02] p-1 dark:border-white/10 dark:bg-white/[0.03]">
                <button
                  type="button"
                  onClick={() => setActiveTab(null)}
                  className={cn(
                    "flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    activeTab === null
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  All
                </button>
                {SERVER_TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        activeTab === t.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon
                        className="h-3.5 w-3.5 shrink-0"
                        style={
                          activeTab === t.id ? { color: t.accentColor } : undefined
                        }
                      />
                      {t.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            )}

            {isSearching ? (
              filteredTemplates.length === 0 ? (
                <div className="py-10 text-center">
                  <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No templates match &ldquo;{search}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {filteredTemplates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      selected={false}
                      onClick={() => {
                        setSearch("");
                        setActiveTab(t.id);
                      }}
                    />
                  ))}
                </div>
              )
            ) : activeTab === null ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SERVER_TEMPLATES.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    selected={false}
                    onClick={() => setActiveTab(t.id)}
                  />
                ))}
              </div>
            ) : selectedTemplate ? (
              <TemplateDetail template={selectedTemplate} />
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
