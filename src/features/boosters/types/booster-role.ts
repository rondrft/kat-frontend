export type {
  BoosterRole,
  BoosterSettings,
  BoosterSettingsUpdate,
} from "@/types/booster";

export const BOOSTER_ROLE_COMMANDS = [
  {
    command: "/setname <name>",
    description: "Sets the custom role name.",
  },
  {
    command: "/setcolor <#HEX>",
    description: "Sets the custom role color.",
  },
  {
    command: "/setemoji <emoji>",
    description: "Sets the role emoji.",
  },
  {
    command: "/createrol",
    description: "Creates the role in Discord.",
  },
  {
    command: "/inviterol <@user>",
    description: "Grants your custom role to another user.",
  },
] as const;
