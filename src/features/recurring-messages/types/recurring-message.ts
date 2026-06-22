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
};

export type RecurringMessageRequest = {
  channelId: string;
  name: string;
  title: string | null;
  content: string;
  intervalMinutes: number;
  enabled: boolean;
};
