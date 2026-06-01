import { z } from "zod";
import {
  MAX_AUTO_ROLE_COUNT,
  MAX_REACTION_MAPPINGS,
} from "@/features/auto-roles/types/auto-roles-config";

const snowflakeSchema = z.string().regex(/^\d{17,20}$/, "Invalid Discord ID");
const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #FF5733");

const reactionMappingSchema = z.object({
  emoji: z.string().trim().min(1, "Emoji is required").max(100),
  roleId: snowflakeSchema,
});

const roleIdsSchema = z.array(snowflakeSchema).max(MAX_AUTO_ROLE_COUNT);

export const autoRolesFormSchema = z.object({
  joinEnabled: z.boolean(),
  joinRoleIds: roleIdsSchema,
  boostEnabled: z.boolean(),
  boostRoleIds: roleIdsSchema,
  reactionEnabled: z.boolean(),
  reactionChannelId: z.string(),
  reactionUseEmbed: z.boolean(),
  reactionEmbedTitle: z.string().max(256),
  reactionEmbedColor: z.string(),
  reactionMessageContent: z.string().max(2000),
  reactionMappings: z.array(reactionMappingSchema).max(MAX_REACTION_MAPPINGS),
});

export type AutoRolesFormValues = z.infer<typeof autoRolesFormSchema>;

export const joinTabSchema = autoRolesFormSchema
  .pick({ joinEnabled: true, joinRoleIds: true })
  .superRefine((data, ctx) => {
    if (data.joinEnabled && data.joinRoleIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one role for new members",
        path: ["joinRoleIds"],
      });
    }
  });

export const boostTabSchema = autoRolesFormSchema
  .pick({ boostEnabled: true, boostRoleIds: true })
  .superRefine((data, ctx) => {
    if (data.boostEnabled && data.boostRoleIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one role for server boosters",
        path: ["boostRoleIds"],
      });
    }
  });

export const reactionTabSchema = autoRolesFormSchema
  .pick({
    reactionEnabled: true,
    reactionChannelId: true,
    reactionUseEmbed: true,
    reactionEmbedTitle: true,
    reactionEmbedColor: true,
    reactionMessageContent: true,
    reactionMappings: true,
  })
  .superRefine((data, ctx) => {
    if (!data.reactionEnabled) return;

    if (!snowflakeSchema.safeParse(data.reactionChannelId).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a text channel for the reaction panel",
        path: ["reactionChannelId"],
      });
    }

    if (
      data.reactionUseEmbed &&
      data.reactionEmbedColor.trim().length > 0 &&
      !hexColorSchema.safeParse(data.reactionEmbedColor).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use a hex color like #FF5733",
        path: ["reactionEmbedColor"],
      });
    }

    if (data.reactionMappings.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one emoji → role mapping",
        path: ["reactionMappings"],
      });
    }

    const emojis = data.reactionMappings.map((m) => m.emoji.trim());
    if (new Set(emojis).size !== emojis.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each emoji must be unique",
        path: ["reactionMappings"],
      });
    }
  });

export type TabId = "join" | "boost" | "reaction";

const TAB_SCHEMAS = {
  join: joinTabSchema,
  boost: boostTabSchema,
  reaction: reactionTabSchema,
} as const;

export function validateAutoRolesTab(
  tab: TabId,
  values: AutoRolesFormValues,
): { success: true } | { success: false; errors: Record<string, string> } {
  const result = TAB_SCHEMAS[tab].safeParse(values);
  if (result.success) return { success: true };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
