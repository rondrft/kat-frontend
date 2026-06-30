"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

export default function GuildPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Guild Page Error]", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
