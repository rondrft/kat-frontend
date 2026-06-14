import { z } from "zod";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const messageFormatSchema = z.object({
  type: z.enum(["normal", "large", "underlined", "quote", "spoiler"]),
  content: z.string().min(1, "Content is required").max(2000, "Line too long"),
});

export const messageContentSchema = z.object({
  channelId: z.string().min(1, "Select a channel"),
  formats: z.array(messageFormatSchema)
    .min(1, "Add at least one line")
    .max(20, "Too many lines"),
});

export const embedContentSchema = z.object({
  channelId: z.string().min(1, "Select a channel"),
  title: z.string().max(256, "Title too long").optional(),
  description: z.string().max(4096, "Description too long").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .default("#5865F2"),
  imageUrl: z
    .string()
    .refine((v) => !v || isHttpUrl(v), { message: "Must be an http or https URL" })
    .optional()
    .or(z.literal("")),
  thumbnailUrl: z
    .string()
    .refine((v) => !v || isHttpUrl(v), { message: "Must be an http or https URL" })
    .optional()
    .or(z.literal("")),
  footer: z.string().max(256, "Footer too long").optional(),
  timestamp: z.boolean().optional().default(false),
});

export const messageSenderSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("message"),
    channelId: z.string().min(1, "Select a channel"),
    messageContent: messageContentSchema,
    embedContent: embedContentSchema.optional(),
  }),
  z.object({
    type: z.literal("embed"),
    channelId: z.string().min(1, "Select a channel"),
    messageContent: messageContentSchema.optional(),
    embedContent: embedContentSchema,
  }),
]);

export type MessageSenderFormData = z.infer<typeof messageSenderSchema>;
