import type { LucideIcon } from "lucide-react";

export type TemplateChannelType = "text" | "voice" | "announcement";

export type TemplateChannel = {
  name: string;
  type: TemplateChannelType;
};

export type TemplateCategory = {
  name: string;
  channels: TemplateChannel[];
};

export type TemplateRole = {
  name: string;
  color: string;
};

export type TemplateCategory_id =
  | "community"
  | "gaming"
  | "creator"
  | "study"
  | "support";

export type ServerTemplate = {
  id: TemplateCategory_id;
  name: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  tags: string[];
  recommended?: boolean;
  roles: TemplateRole[];
  categories: TemplateCategory[];
};
