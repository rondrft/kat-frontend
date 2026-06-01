export type GuildRole = {
  id: string;
  name: string;
  color?: number;
};

export type GuildTextChannel = {
  id: string;
  name: string;
};

export type ReactionRoleMapping = {
  emoji: string;
  roleId: string;
};

export type AutoRolesConfig = {
  joinEnabled: boolean;
  joinRoleIds: string[];
  boostEnabled: boolean;
  boostRoleIds: string[];
  reactionEnabled: boolean;
  reactionChannelId: string;
  reactionUseEmbed: boolean;
  reactionEmbedTitle: string;
  reactionEmbedColor: string;
  reactionMessageContent: string;
  reactionMessageId?: string;
  reactionMappings: ReactionRoleMapping[];
};

export type AutoRolesPutRequest = Omit<AutoRolesConfig, "reactionMessageId">;

export const MAX_REACTION_MAPPINGS = 10;
export const MAX_AUTO_ROLE_COUNT = 25;

export const DEFAULT_AUTO_ROLES_CONFIG: AutoRolesConfig = {
  joinEnabled: false,
  joinRoleIds: [],
  boostEnabled: false,
  boostRoleIds: [],
  reactionEnabled: false,
  reactionChannelId: "",
  reactionUseEmbed: false,
  reactionEmbedTitle: "Elegí tu rol",
  reactionEmbedColor: "#5865F2",
  reactionMessageContent: "React below to pick your roles:",
  reactionMessageId: undefined,
  reactionMappings: [],
};

export function toPutRequest(config: AutoRolesConfig): AutoRolesPutRequest {
  const {
    joinEnabled,
    joinRoleIds,
    boostEnabled,
    boostRoleIds,
    reactionEnabled,
    reactionChannelId,
    reactionUseEmbed,
    reactionEmbedTitle,
    reactionEmbedColor,
    reactionMessageContent,
    reactionMappings,
  } = config;
  return {
    joinEnabled,
    joinRoleIds,
    boostEnabled,
    boostRoleIds,
    reactionEnabled,
    reactionChannelId,
    reactionUseEmbed,
    reactionEmbedTitle,
    reactionEmbedColor,
    reactionMessageContent,
    reactionMappings,
  };
}
