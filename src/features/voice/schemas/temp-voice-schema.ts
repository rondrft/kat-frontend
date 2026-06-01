import { z } from "zod";
import { DEFAULT_VOICE_CATEGORY } from "@/features/voice/types/temp-voice-config";

const categoryIdSchema = z
  .string()
  .refine(
    (val) => val === DEFAULT_VOICE_CATEGORY || val === "" || /^\d{17,20}$/.test(val),
    "Pick a category or use the default option",
  );

export const tempVoiceConfigSchema = z.object({
  enabled: z.boolean(),
  categoryId: categoryIdSchema,
  channelNameTemplate: z
    .string()
    .min(1, "Channel name is required")
    .max(100, "Name is too long"),
  userLimit: z.number().int().min(0).max(99),
  deleteDelaySeconds: z.number().int().min(0).max(300),
  lockedToOwner: z.boolean(),
});

export type TempVoiceConfigFormValues = z.infer<typeof tempVoiceConfigSchema>;
