export type ServerBackup = {
  id: string;
  guildId: string;
  name: string;
  createdAt: string;
  dataSize: number;
};

export type CreateBackupRequest = {
  name: string;
};
