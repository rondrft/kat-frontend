import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Kat"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080/api"),
  NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_DISCORD_REDIRECT_URI: z.string().url().optional(),
  NEXT_PUBLIC_DISCORD_BOT_REDIRECT_URI: z.string().url().optional(),
  NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS: z.string().optional(),
  NEXT_PUBLIC_ENABLE_DEVTOOLS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

function parseClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    NEXT_PUBLIC_DISCORD_REDIRECT_URI: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
    NEXT_PUBLIC_DISCORD_BOT_REDIRECT_URI:
      process.env.NEXT_PUBLIC_DISCORD_BOT_REDIRECT_URI,
    NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS:
      process.env.NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS,
    NEXT_PUBLIC_ENABLE_DEVTOOLS: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS,
  });

  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid client environment configuration");
  }

  return parsed.data;
}

export const env = parseClientEnv();
