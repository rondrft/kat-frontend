"use client";

import { useState } from "react";
import { Activity, LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { GuildSelector } from "@/features/guilds";
import { getDiscordAvatarUrl } from "@/utils/discord";
import { BotStatusModal } from "@/features/bot-status/components/bot-status-modal";

function DashboardHeaderAuthPlaceholder() {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3"
      aria-busy="true"
      aria-label="Loading session"
    >
      <div className="hidden h-9 w-[7.5rem] shrink-0 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10 sm:block" />
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10" />
    </div>
  );
}

function DashboardUserMenu() {
  const { user, isAuthenticated, logout, loginWithDiscord, status } = useAuth();
  const [statusOpen, setStatusOpen] = useState(false);

  const isRecovering = status === "loading" && !user;

  if (isRecovering) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10" />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={loginWithDiscord}
      >
        <LogIn className="mr-2 h-4 w-4" />
        Login with Discord
      </Button>
    );
  }

  const displayName = user.globalName ?? user.username ?? "User";
  const avatarUrl = getDiscordAvatarUrl(user.id, user.avatar, 64);
  const initial = (displayName.trim().charAt(0) || "?").toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full p-0 ring-2 ring-transparent transition-[box-shadow] hover:ring-kat/30"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
              <AvatarFallback delayMs={0} className="bg-muted text-sm font-medium">
                {initial}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            <p className="font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setStatusOpen(true)}>
            <Activity className="mr-2 h-4 w-4" />
            Estado del bot
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <BotStatusModal open={statusOpen} onOpenChange={setStatusOpen} />
    </>
  );
}

export function DashboardHeaderActions() {
  const { hasHydrated, isAuthenticated } = useAuth();

  if (!hasHydrated) {
    return <DashboardHeaderAuthPlaceholder />;
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {isAuthenticated ? <GuildSelector /> : null}
      <DashboardUserMenu />
    </div>
  );
}
