export type GiveawayParticipant = {
  userId: string;
  username: string;
  globalName: string | null;
  avatarUrl: string;
  effectiveName: string;
  booster: boolean;
};

export type GiveawayStatus = "active" | "ended";

export type Giveaway = {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string | null;
  prize: string;
  endTime: string | null;
  winnerCount: number;
  boosterOnly: boolean;
  participantIds: string[];
  winnerIds: string[];
  ended: boolean;
  active: boolean;
  startedFromDashboard: boolean;
};

export type CreateGiveawayRequest = {
  prize: string;
  channelId: string;
  durationMinutes: number;
  winnerCount: number;
  boosterOnly: boolean;
  startImmediately: boolean;
};

export type CreateGiveawayResponse = Giveaway;

export type RollGiveawayResponse = {
  giveawayId: string;
  winners: GiveawayParticipant[];
  totalParticipants: number;
  ended: boolean;
};

export type DurationUnit = "minutes" | "hours" | "days";
