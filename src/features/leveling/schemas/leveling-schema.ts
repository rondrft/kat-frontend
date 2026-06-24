import { z } from "zod";

export const levelingConfigSchema = z.object({
  enabled: z.boolean(),
  levelUpChannelId: z.string().nullable(),
  minXpPerMessage: z.number().int().min(1).max(1000),
  maxXpPerMessage: z.number().int().min(1).max(1000),
  minXpPerAction: z.number().int().min(1).max(1000),
  maxXpPerAction: z.number().int().min(1).max(1000),
  cooldownSeconds: z.number().int().min(5).max(3600),
  excludedChannelIds: z.string().nullable(),
  noXpRoleIds: z.string().nullable(),
  announcementsEnabled: z.boolean(),
  mentionOnLevelUp: z.boolean(),
  customLevelUpMessage: z.string().max(500).nullable(),
  roleStacking: z.boolean(),
}).refine((d) => d.minXpPerMessage <= d.maxXpPerMessage, {
  message: "Min XP must be ≤ max XP",
  path: ["minXpPerMessage"],
}).refine((d) => d.minXpPerAction <= d.maxXpPerAction, {
  message: "Min action XP must be ≤ max action XP",
  path: ["minXpPerAction"],
});

export type LevelingConfigFormValues = z.infer<typeof levelingConfigSchema>;
