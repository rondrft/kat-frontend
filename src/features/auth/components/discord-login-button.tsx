"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isDiscordOAuthConfigured } from "@/config/discord";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useTranslation } from "@/lib/i18n/useTranslation";

type DiscordLoginButtonProps = {
  label?: string;
  className?: string;
};

export function DiscordLoginButton({ label, className }: DiscordLoginButtonProps) {
  const { loginWithDiscord, status } = useAuth();
  const { auth } = useTranslation();
  const configured = isDiscordOAuthConfigured();

  return (
    <Button
      size="lg"
      className={className}
      onClick={loginWithDiscord}
      disabled={status === "loading"}
      title={
        configured ? undefined : "Configura NEXT_PUBLIC_DISCORD_CLIENT_ID en .env.local"
      }
    >
      <LogIn className="mr-2 h-4 w-4" />
      {status === "loading" ? auth.redirecting : (label ?? auth.loginWithDiscord)}
    </Button>
  );
}
