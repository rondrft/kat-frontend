"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MessageFormat } from "../types/message-sender-types";

const FORMAT_OPTIONS: { value: MessageFormat["type"]; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "underlined", label: "Underlined" },
  { value: "quote", label: "Quote" },
  { value: "spoiler", label: "Spoiler" },
];

type MessageTabProps = {
  formats: MessageFormat[];
  onChange: (formats: MessageFormat[]) => void;
};

export function MessageTab({ formats, onChange }: MessageTabProps) {
  const updateLine = (index: number, field: keyof MessageFormat, value: string) => {
    const next = formats.map((f, i) =>
      i === index ? { ...f, [field]: value } : f,
    );
    onChange(next);
  };

  const removeLine = (index: number) => {
    if (formats.length <= 1) return;
    onChange(formats.filter((_, i) => i !== index));
  };

  const addLine = () => {
    onChange([...formats, { type: "normal", content: "" }]);
  };

  return (
    <div className="space-y-4">
      <Label>Message lines</Label>

      <div className="space-y-3">
        {formats.map((f, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 rounded-lg border p-3",
              "border-black/[0.08] dark:border-white/10",
              f.type === "quote" && "border-l-4 border-l-gray-500",
              f.type === "spoiler" && "bg-black/20",
            )}
          >
            <select
              value={f.type}
              onChange={(e) =>
                updateLine(i, "type", e.target.value as MessageFormat["type"])
              }
              className={cn(
                "h-9 shrink-0 rounded-md border bg-transparent px-2 text-xs",
                "border-black/[0.08] text-foreground dark:border-white/10",
              )}
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Input
              value={f.content}
              onChange={(e) => updateLine(i, "content", e.target.value)}
              placeholder="Type your message line..."
              className={cn(
                "min-w-0 flex-1",
                f.type === "large" && "text-lg font-bold",
                f.type === "underlined" && "underline",
                f.type === "spoiler" &&
                  "bg-black/40 text-transparent placeholder:text-transparent",
              )}
            />

            <button
              type="button"
              onClick={() => removeLine(i)}
              disabled={formats.length <= 1}
              className="mt-1 shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLine}
        className="gap-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Add line
      </Button>
    </div>
  );
}
