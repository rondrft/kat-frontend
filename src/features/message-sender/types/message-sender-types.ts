export type MessageType = "message" | "embed";

export type MessageFormat = {
  type: "normal" | "large" | "underlined" | "quote" | "spoiler";
  content: string;
};

export type MessageContent = {
  channelId: string;
  formats: MessageFormat[];
};

export type EmbedContent = {
  channelId: string;
  title?: string;
  description?: string;
  color: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  footer?: string;
  timestamp: boolean;
};

export type SendMessageRequest = {
  type: MessageType;
  guildId: string;
  channelId: string;
  messageContent?: MessageContent;
  embedContent?: EmbedContent;
};

export type SendMessageResponse = {
  messageId: string;
  channelId: string;
};
