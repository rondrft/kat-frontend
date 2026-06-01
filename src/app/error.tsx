"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Kat GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Error inesperado</h1>
      <p className="max-w-md text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
