"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

interface QueryErrorProps {
  error: unknown;
  onRetry?: () => void;
}

export function QueryError({ error, onRetry }: QueryErrorProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
