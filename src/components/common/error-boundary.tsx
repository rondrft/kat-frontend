"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[Kat ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="flex min-h-[240px] animate-fade-in flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Algo salió mal</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {getErrorMessage(this.state.error)}
            </p>
          </div>
          <Button variant="outline" onClick={this.handleReset}>
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
