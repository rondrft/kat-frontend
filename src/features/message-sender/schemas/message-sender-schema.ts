import { z } from "zod";

export const messageFormatSchema = z.object({
  type: z.enum(["normal", "large", "underlined", "quote", "spoiler"]),
  content: z.string().min(1, "Content is required"),
});

export const messageContentSchema = z.object({
  channelId: z.string().min(1, "Select a channel"),
  formats: z.array(messageFormatSchema).min(1, "Add at least one line"),
});

export const embedContentSchema = z.object({
  channelId: z.string().min(1, "Select a channel"),
  title: z.string().max(256, "Title too long").optional(),
  description: z.string().max(4096, "Description too long").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .default("#5865F2"),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  thumbnailUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  footer: z.string().max(256, "Footer too long").optional(),
  timestamp: z.boolean().default(false),
});
