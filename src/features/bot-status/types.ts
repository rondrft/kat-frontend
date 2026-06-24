export type ShardStatus = "CONNECTED" | "RECONNECTING" | "DISCONNECTED" | "CONNECTING";

export interface ShardInfo {
  shardId: number;
  totalShards: number;
  status: ShardStatus;
  pingMs: number;
  guilds: number;
  users: number;
}

export interface BotStatus {
  totalShards: number;
  connectedShards: number;
  totalGuilds: number;
  totalUsers: number;
  shards: ShardInfo[];
}
