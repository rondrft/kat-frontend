import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({ className, label = "Cargando" }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center", className)}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-kat" />
    </div>
  );
}
