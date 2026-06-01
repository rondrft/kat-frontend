import { z } from "zod";

export const discordCallbackSchema = z.object({
  code: z.string().min(1, "Código OAuth requerido"),
  state: z.string().min(1, "State requerido"),
});

export type DiscordCallbackInput = z.infer<typeof discordCallbackSchema>;
