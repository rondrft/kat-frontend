import { env } from "@/lib/env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  title: `${env.NEXT_PUBLIC_APP_NAME} — Discord Bot Dashboard`,
  description:
    "Manage your Discord server with Kat: leveling, moderation, welcome messages, giveaways, auto-roles, logging, and more. Fast, clean, and effective Discord automation.",
  url: env.NEXT_PUBLIC_APP_URL,
  keywords: [
    "Discord bot",
    "Discord dashboard",
    "Discord server management",
    "Discord moderation bot",
    "Discord leveling bot",
    "Discord welcome bot",
    "Discord giveaway bot",
    "Kat bot",
    env.NEXT_PUBLIC_APP_NAME,
  ],
  links: {
    discord: "https://discord.com",
    docs: "/docs",
    github: "https://github.com",
    privacy: "/privacy",
    terms: "/terms",
    refund: "/refund",
  },
  ogImage: "/logo/og-image.png",
  locale: "es_ES",
} as const;
