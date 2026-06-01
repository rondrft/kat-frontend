"use client";

import { Suspense } from "react";
import { useBotInviteReturn } from "@/features/guilds/hooks/use-bot-invite-return";

function BotInviteReturnHandlerInner() {
  useBotInviteReturn();
  return null;
}

export function BotInviteReturnHandler() {
  return (
    <Suspense fallback={null}>
      <BotInviteReturnHandlerInner />
    </Suspense>
  );
}
