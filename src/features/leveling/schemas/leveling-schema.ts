import { z } from "zod";

export const levelingConfigSchema = z.object({
  enabled: z.boolean(),
  levelUpChannelId: z.string().nullable(),
});

export type LevelingConfigFormValues = z.infer<typeof levelingConfigSchema>;
