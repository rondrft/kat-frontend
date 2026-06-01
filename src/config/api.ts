import { env } from "@/lib/env";

export const apiConfig = {
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;
