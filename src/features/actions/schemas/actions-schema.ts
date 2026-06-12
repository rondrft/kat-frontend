import { z } from "zod";

export const actionsConfigSchema = z.object({
  enabled: z.boolean(),
});

export type ActionsConfigFormValues = z.infer<typeof actionsConfigSchema>;
