import { z } from "zod";

export const ticketConfigSchema = z.object({
  enabled: z.boolean(),
  panelChannelId: z.string().min(1).optional().or(z.literal("")),
  categoryId: z.string().min(1).optional().or(z.literal("")),
  buttonLabel: z.string().min(1).max(80),
  buttonStyle: z.enum(["PRIMARY", "SUCCESS", "DANGER", "SECONDARY"]),
  embedTitle: z.string().min(1).max(256),
  embedDescription: z.string().max(2000),
  embedColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  transcriptEnabled: z.boolean(),
  allowUserToClose: z.boolean(),
  maxOpenTicketsPerUser: z.number().min(1).max(10),
  ticketChannelNameTemplate: z.string().min(1).max(100),
  welcomeMessage: z.string().max(2000).optional().or(z.literal("")),
  supportRoleIds: z.array(z.string()),
});

export type TicketConfigSchemaType = z.infer<typeof ticketConfigSchema>;
