import { z } from "zod";

export const levelingConfigSchema = z.object({
  enabled: z.boolean(),
});

export type LevelingConfigFormValues = z.infer<typeof levelingConfigSchema>;
