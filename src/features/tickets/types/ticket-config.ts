export interface TicketConfig {
  guildId: string;
  enabled: boolean;
  panelChannelId: string | null;
  panelMessageId: string | null;
  categoryId: string | null;
  buttonLabel: string;
  buttonStyle: "PRIMARY" | "SUCCESS" | "DANGER" | "SECONDARY";
  embedTitle: string;
  embedDescription: string;
  embedColor: string;
  transcriptEnabled: boolean;
  allowUserToClose: boolean;
  maxOpenTicketsPerUser: number;
  ticketChannelNameTemplate: string;
  welcomeMessage: string | null;
  supportRoleIds: string[];
}

export interface TicketConfigFormValues {
  enabled: boolean;
  panelChannelId: string;
  categoryId: string;
  buttonLabel: string;
  buttonStyle: "PRIMARY" | "SUCCESS" | "DANGER" | "SECONDARY";
  embedTitle: string;
  embedDescription: string;
  embedColor: string;
  transcriptEnabled: boolean;
  allowUserToClose: boolean;
  maxOpenTicketsPerUser: number;
  ticketChannelNameTemplate: string;
  welcomeMessage: string;
  supportRoleIds: string[];
}

export interface TicketSaveRequest {
  enabled: boolean;
  panelChannelId: string | null;
  categoryId: string | null;
  buttonLabel: string;
  buttonStyle: "PRIMARY" | "SUCCESS" | "DANGER" | "SECONDARY";
  embedTitle: string;
  embedDescription: string;
  embedColor: string;
  transcriptEnabled: boolean;
  allowUserToClose: boolean;
  maxOpenTicketsPerUser: number;
  ticketChannelNameTemplate: string;
  welcomeMessage: string | null;
  supportRoleIds: string[];
}
