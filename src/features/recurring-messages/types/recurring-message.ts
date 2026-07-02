export type RecurringMessage = {
  id: number;
  guildId: string;
  channelId: string;
  name: string;
  title: string | null;
  content: string;
  intervalMinutes: number;
  nextSendAt: string;
  enabled: boolean;
  createdAt: string;
  color: string | null;
  footerText: string | null;
};

export type RecurringMessageRequest = {
  channelId: string;
  name: string;
  title: string | null;
  content: string;
  intervalMinutes: number;
  enabled: boolean;
  color: string | null;
  footerText: string | null;
};
