import { env } from "@/lib/env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description: "Discord automation — fast, clean, effective.",
  url: env.NEXT_PUBLIC_APP_URL,
  links: {
    discord: "https://discord.com",
    docs: "/docs",
    github: "https://github.com",
    privacy: "/privacy",
    terms: "/terms",
  },
} as const;
