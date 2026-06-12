export type LoggingEntry = {
  id: string;
  enabled: boolean;
  channelId: string;
};

export type LoggingConfig = {
  defaultChannel: string;
  entries: LoggingEntry[];
};
